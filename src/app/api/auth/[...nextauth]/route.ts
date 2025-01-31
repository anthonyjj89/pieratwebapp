import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(process.env.MONGODB_DB);

// Define custom user type that includes discordId
interface CustomUser {
  id: string;
  discordId: string;
  name: string;
  email: string;
  image?: string;
}

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      },
      profile(profile) {
        return {
          id: profile.id,
          discordId: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : undefined
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'discord') {
        await client.connect();
        await db.collection('users').updateOne(
          { discordId: user.id },
          {
            $set: {
              name: user.name,
              email: user.email,
              image: user.image,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }
      return true;
    },
    async session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          discordId: user.id
        }
      };
    }
  },
  pages: {
    signIn: '/signin',
    error: '/error'
  }
});

export { handler as GET, handler as POST };
