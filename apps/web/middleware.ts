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

  afterAuth(auth, req: NextRequest) {
    try {
      console.log('🔐 Middleware auth payload:', JSON.stringify(auth));
      const { userId } = auth;
      const url = req.nextUrl.clone();

      if (!userId) {
        const protectedPrefixes = ['/dashboard', '/admin', '/vendor/dashboard', '/vendor-profile'];
        if (protectedPrefixes.some((p) => url.pathname.startsWith(p))) {
          url.pathname = '/sign-in';
          return NextResponse.redirect(url);
        }
        return NextResponse.next();
      }

      return NextResponse.next();
    } catch (err) {
      console.error('🔴 Middleware failed:', err);
      return NextResponse.next();
    }
  },
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
