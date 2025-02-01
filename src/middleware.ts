import { withAuth } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*']
};

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/signin',
  },
});
