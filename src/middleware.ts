import { withAuth } from 'next-auth/middleware';

// Simplified middleware that only protects dashboard routes
export const config = {
  matcher: [
    /*
     * Match dashboard routes
     * Exclude api routes and static files
     */
    '/dashboard/:path*'
  ]
};

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      
      // Always allow home and signin
      if (path === '/' || path === '/signin') return true;
      
      // Protect dashboard routes
      if (path.startsWith('/dashboard')) {
        return !!token;
      }
      
      // Allow all other routes
      return true;
    }
  },
  pages: {
    signIn: '/signin'
  }
});
