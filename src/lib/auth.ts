import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

if (!process.env.DISCORD_CLIENT_ID) {
    throw new Error('Missing DISCORD_CLIENT_ID');
}

if (!process.env.DISCORD_CLIENT_SECRET) {
    throw new Error('Missing DISCORD_CLIENT_SECRET');
}

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'identify email guilds'
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                // Store both snake_case and camelCase versions for compatibility
                token.access_token = account.access_token;
                token.token_type = account.token_type;
                token.accessToken = account.access_token;
                token.tokenType = account.token_type;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user && token.sub) {
                session.user.id = token.sub;
                // Use the camelCase versions for consistency in the session
                session.user.accessToken = token.accessToken as string || token.access_token as string;
                session.user.tokenType = token.tokenType as string || token.token_type as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/signin'
    },
    session: {
        strategy: 'jwt'
    }
};
