import DiscordProvider from 'next-auth/providers/discord';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { Account } from 'next-auth';

export const authOptions = {
  debug: true,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds.members.read guilds',
        },
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
