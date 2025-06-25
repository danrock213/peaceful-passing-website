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
      const { userId } = auth;
      const url = req.nextUrl.clone();

      // If not signed in, block access to protected routes
      if (!userId) {
        const isProtected =
          url.pathname.startsWith('/dashboard') ||
          url.pathname.startsWith('/admin') ||
          url.pathname.startsWith('/vendor/dashboard') ||
          url.pathname.startsWith('/vendor-profile');

        if (isProtected) {
          url.pathname = '/sign-in';
          return NextResponse.redirect(url);
        }

        return NextResponse.next();
      }

      // ⚠️ Avoid checking user.publicMetadata at the edge
      // Role-based routing should be done in server components or API routes

      return NextResponse.next();
    } catch (err) {
      console.error('🔴 Middleware error:', err);
      return NextResponse.next(); // Always allow fallback in case of middleware failure
    }
  },
});

export const config = {
  matcher: [
    // Match everything except public static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
