import { withAuth } from 'next-auth/middleware';

// Export the middleware config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|discord-mark-white.svg).*)',
  ],
};

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      
      // Allow access to signin page
      if (path === '/signin') return true;
      
      // Allow access to home page
      if (path === '/') return true;
      
      // Require auth for dashboard routes
      if (path.startsWith('/dashboard')) {
        return !!token;
      }
      
      // Allow access to all other routes
      return true;
    },
  },
  pages: {
    signIn: '/signin',
  },
});
