import { NextAuthOptions, Session } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'identify email guilds',
                    prompt: 'consent'
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log('Sign in attempt:', { user, account });
            return true;
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                console.log('JWT callback:', { token, account });
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            session.accessToken = token.accessToken;
            console.log('Session callback:', { session, token });
            return session;
        },
        async redirect({ url, baseUrl }) {
            console.log('Redirect callback:', { url, baseUrl });
            if (url.startsWith(baseUrl)) return url;
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            return baseUrl;
        }
    },
    pages: {
        signIn: '/signin',
        error: '/signin'
    }
};
