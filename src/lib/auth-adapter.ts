import type { Adapter, AdapterUser, AdapterSession, AdapterAccount } from 'next-auth/adapters';
import { ObjectId, WithId } from 'mongodb';
import clientPromise from './mongodb';

interface MongoUser extends Omit<AdapterUser, 'id'> {
    _id: ObjectId;
    discordId: string;
    discordGuilds?: {
        id: string;
        name: string;
        icon: string | null;
        owner: boolean;
        permissions: string;
        features: string[];
    }[];
}

interface MongoSession {
    _id: ObjectId;
    sessionToken: string;
    userId: ObjectId;
    expires: Date;
}

interface MongoAccount {
    _id: ObjectId;
    userId: ObjectId;
    type: 'oauth' | 'email' | 'oidc';
    provider: string;
    providerAccountId: string;
    access_token?: string;
    token_type?: string;
    scope?: string;
    expires_at?: number;
    refresh_token?: string;
    id_token?: string;
    session_state?: string;
}

// Convert MongoDB document to AdapterUser
function documentToAdapter(user: WithId<MongoUser>): AdapterUser {
    return {
        id: user._id.toString(),
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        discordId: user.discordId,
        discordGuilds: user.discordGuilds || []
    };
}

// Convert session document to AdapterSession
function sessionToAdapter(session: WithId<MongoSession>): AdapterSession {
    return {
        sessionToken: session.sessionToken,
        userId: session.userId.toString(),
        expires: session.expires
    };
}

export function CustomAdapter(): Adapter {
    return {
        async createUser(data: Omit<AdapterUser, 'id'>) {
            const client = await clientPromise;
            const db = client.db();

            const user: MongoUser = {
                _id: new ObjectId(),
                email: data.email,
                emailVerified: data.emailVerified,
                name: data.name,
                image: data.image,
                discordId: data.discordId || '',
                discordGuilds: data.discordGuilds || []
            };

            await db.collection<MongoUser>('users').insertOne(user);
            return documentToAdapter(user as WithId<MongoUser>);
        },

        async getUser(id) {
            const client = await clientPromise;
            const db = client.db();

            const user = await db
                .collection<MongoUser>('users')
                .findOne({ _id: new ObjectId(id) });

            if (!user) return null;
            return documentToAdapter(user);
        },

        async getUserByEmail(email) {
            const client = await clientPromise;
            const db = client.db();

            const user = await db
                .collection<MongoUser>('users')
                .findOne({ email });

            if (!user) return null;
            return documentToAdapter(user);
        },

        async getUserByAccount({ providerAccountId, provider }) {
            const client = await clientPromise;
            const db = client.db();

            const account = await db
                .collection<MongoAccount>('accounts')
                .findOne({ provider, providerAccountId });

            if (!account) return null;

            const user = await db
                .collection<MongoUser>('users')
                .findOne({ _id: account.userId });

            if (!user) return null;
            return documentToAdapter(user);
        },

        async updateUser(data: Partial<AdapterUser> & { id: string }) {
            const client = await clientPromise;
            const db = client.db();

            const { id, ...updateData } = data;
            const user = await db
                .collection<MongoUser>('users')
                .findOne({ _id: new ObjectId(id) });

            if (!user) throw new Error('User not found');

            const updatedUser = {
                ...user,
                ...updateData
            };

            await db
                .collection<MongoUser>('users')
                .updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateData }
                );

            return documentToAdapter(updatedUser as WithId<MongoUser>);
        },

        async deleteUser(userId) {
            const client = await clientPromise;
            const db = client.db();

            const id = new ObjectId(userId);
            await db.collection('users').deleteOne({ _id: id });
            await db.collection('accounts').deleteMany({ userId: id });
            await db.collection('sessions').deleteMany({ userId: id });
        },

        async linkAccount(data: AdapterAccount) {
            const client = await clientPromise;
            const db = client.db();

            const account: MongoAccount = {
                _id: new ObjectId(),
                userId: new ObjectId(data.userId),
                type: data.type as 'oauth' | 'email' | 'oidc',
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                access_token: data.access_token,
                token_type: data.token_type,
                scope: data.scope,
                expires_at: data.expires_at,
                refresh_token: data.refresh_token,
                id_token: data.id_token,
                session_state: data.session_state
            };

            await db.collection<MongoAccount>('accounts').insertOne(account);
            return;
        },

        async unlinkAccount({ provider, providerAccountId }) {
            const client = await clientPromise;
            const db = client.db();

            await db
                .collection('accounts')
                .deleteOne({ provider, providerAccountId });
        },

        async createSession(data: {
            sessionToken: string;
            userId: string;
            expires: Date;
        }): Promise<AdapterSession> {
            const client = await clientPromise;
            const db = client.db();

            const session: MongoSession = {
                _id: new ObjectId(),
                userId: new ObjectId(data.userId),
                expires: data.expires,
                sessionToken: data.sessionToken
            };

            await db.collection<MongoSession>('sessions').insertOne(session);
            return sessionToAdapter(session as WithId<MongoSession>);
        },

        async getSessionAndUser(sessionToken: string) {
            const client = await clientPromise;
            const db = client.db();

            const session = await db
                .collection<MongoSession>('sessions')
                .findOne({ sessionToken });

            if (!session) return null;

            const user = await db
                .collection<MongoUser>('users')
                .findOne({ _id: session.userId });

            if (!user) return null;

            return {
                session: sessionToAdapter(session),
                user: documentToAdapter(user)
            };
        },

        async updateSession(
            data: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>
        ): Promise<AdapterSession | null> {
            const client = await clientPromise;
            const db = client.db();

            const session = await db
                .collection<MongoSession>('sessions')
                .findOne({ sessionToken: data.sessionToken });

            if (!session) return null;

            const updatedSession = {
                ...session,
                ...(data.expires && { expires: data.expires })
            };

            await db
                .collection<MongoSession>('sessions')
                .updateOne(
                    { sessionToken: data.sessionToken },
                    { $set: { expires: data.expires } }
                );

            return sessionToAdapter(updatedSession as WithId<MongoSession>);
        },

        async deleteSession(sessionToken: string) {
            const client = await clientPromise;
            const db = client.db();

            await db
                .collection('sessions')
                .deleteOne({ sessionToken });
        }
    };
}
