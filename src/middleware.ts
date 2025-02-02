import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuthPage = request.nextUrl.pathname.startsWith('/signin');
    const isAuthApi = request.nextUrl.pathname.startsWith('/api/auth');

    console.log('Middleware:', {
        path: request.nextUrl.pathname,
        isAuthPage,
        isAuthApi,
        hasToken: !!token
    });

    // Allow auth API routes to pass through
    if (isAuthApi) {
        console.log('Allowing auth API route');
        return NextResponse.next();
    }

    // Handle auth pages
    if (isAuthPage) {
        if (token) {
            console.log('Redirecting authenticated user from auth page to dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        console.log('Allowing unauthenticated user to access auth page');
        return NextResponse.next();
    }

    // Handle API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        if (!token) {
            console.log('Blocking unauthenticated API request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log('Allowing authenticated API request');
        return NextResponse.next();
    }

    // Handle protected pages
    if (!token) {
        console.log('Redirecting unauthenticated user to signin');
        const url = new URL('/signin', request.url);
        url.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    console.log('Allowing authenticated request');
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
        '/signin'
    ]
};
