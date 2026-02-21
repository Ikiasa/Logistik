
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const { pathname } = request.nextUrl;

    console.log(`[Middleware] Path: ${pathname}, Token Detected: ${!!token}`);

    // 1. Redirect to Dashboard if logged in and trying to access login
    if (token && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. Redirect to Login if NOT logged in and trying to access dashboard
    if (!token && (pathname === '/dashboard' || pathname.startsWith('/dashboard/'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};
