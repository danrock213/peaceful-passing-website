// apps/web/middleware.ts
import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default authMiddleware({
  publicRoutes: [
    '/', '/sign-in', '/sign-up', '/vendors', '/vendors/:path*',
    '/checklist', '/messages', '/tribute', '/reviews',
  ],

  afterAuth(auth, req: NextRequest) {
    const { userId } = auth;
    const url = req.nextUrl.clone();

    if (!userId) {
      const protectedPrefixes = ['/dashboard', '/admin', '/vendor/dashboard', '/vendor-profile'];
      if (protectedPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
        url.pathname = '/sign-in';
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
});

// ✅ Updated matcher to explicitly exclude static files
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next|favicon.ico).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
