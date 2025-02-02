import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'identify email guilds guilds.members.read',
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'discord' && profile) {
                // Update user with Discord data
                const updates = {
                    discordId: profile.id,
                    name: profile.username,
                    image: profile.avatar 
                        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                        : null
                };
                
                Object.assign(user, updates);
            }
            return true;
        },
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.accessToken = account.access_token;
                token.discordId = profile.id;
                token.id = token.sub;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.accessToken = token.accessToken;
                session.user.discordId = token.discordId as string;
                session.user.id = token.id as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        }
    },
    pages: {
        signIn: '/signin',
        error: '/signin'
    },
    events: {
        async createUser({ user }) {
            console.log('New user created:', {
                userId: user.id,
                discordId: user.discordId,
                email: user.email
            });
        },
        async signIn({ user }) {
            console.log('User signed in:', { 
                userId: user.id,
                discordId: user.discordId,
                email: user.email
            });
        },
        async signOut({ session }) {
            if (session?.user) {
                console.log('User signed out:', { 
                    userId: session.user.id,
                    discordId: session.user.discordId
                });
            }
        }
    },
    debug: process.env.NODE_ENV === 'development'
};
