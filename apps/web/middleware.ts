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
    const { userId } = auth;
    const url = req.nextUrl.clone();

    // If not signed in, redirect away from protected routes
    if (!userId) {
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

    // Do NOT access user.publicMetadata here — move that logic to server/page components
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
