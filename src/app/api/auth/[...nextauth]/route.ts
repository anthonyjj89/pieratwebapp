import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in attempt:', { user, account, profile });
      return true;
    },
    async jwt({ token, account }) {
      console.log('JWT callback:', { token, account });
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      return session;
    }
  },
  logger: {
    error(code, metadata) {
      console.error('Auth error:', { code, metadata });
    },
    warn(code) {
      console.warn('Auth warning:', { code });
    },
    debug(code, metadata) {
      console.log('Auth debug:', { code, metadata });
    }
  }
});

export { handler as GET, handler as POST };
