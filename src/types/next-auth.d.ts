import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id: string;
        } & DefaultSession['user'];
    }

    interface Profile {
        id: string;
        username: string;
        discriminator: string;
        avatar: string | null;
        email: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        id?: string;
    }
}
