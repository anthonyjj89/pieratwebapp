import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuthPage = request.nextUrl.pathname.startsWith('/signin');

    if (isAuthPage) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (!token && request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!token) {
        const url = new URL('/signin', request.url);
        url.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/:path*',
        '/signin'
    ]
};
