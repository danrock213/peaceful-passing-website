// apps/web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/vendors',
    '/vendors/:path*',
    '/checklist',
    '/messages',
    '/tribute',
    '/reviews',
  ],
  afterAuth(auth, req) {
    const { userId, user } = auth;
    const url = req.nextUrl.clone();

    if (!userId) {
      // Block access to protected routes if not signed in
      if (
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/vendor/dashboard') ||
        url.pathname.startsWith('/vendor-profile')
      ) {
        url.pathname = '/sign-in';
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    const role = user?.publicMetadata?.role;

    // Block users without correct role
    if (url.pathname.startsWith('/admin') && role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    if (
      (url.pathname.startsWith('/vendor/dashboard') ||
        url.pathname.startsWith('/vendor-profile')) &&
      role !== 'vendor'
    ) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
