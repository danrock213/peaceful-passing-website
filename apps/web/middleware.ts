// apps/web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware, getAuth } from '@clerk/nextjs/server';

export default async function middleware(req: NextRequest) {
  const { userId, user } = getAuth(req);

  const url = req.nextUrl.clone();

  // List of public routes - accessible without auth
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/vendors',
    '/vendors/:path*',
    '/checklist',
    '/messages',
    '/tribute',
    '/reviews',
  ];

  // Check if request path matches any public route pattern (simple startsWith check for wildcard)
  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith('/:path*')) {
      return url.pathname.startsWith(route.replace('/:path*', ''));
    }
    return url.pathname === route;
  });

  // If public route, let it through with Clerk's authMiddleware for session management
  if (isPublicRoute) {
    return authMiddleware({
      publicRoutes,
    })(req);
  }

  // For protected routes, check if user is signed in
  if (!userId) {
    // Redirect to sign-in if not signed in
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Get user role from publicMetadata
  const role = user?.publicMetadata?.role;

  // Role-based route protections

  // Admin routes
  if (url.pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Vendor dashboard routes
  if (url.pathname.startsWith('/vendor/dashboard') || url.pathname.startsWith('/vendor-profile')) {
    if (role !== 'vendor') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // You can add more role-based restrictions here

  // Default: let Clerk's authMiddleware handle the request for session
  return authMiddleware({
    publicRoutes,
  })(req);
}

export const config = {
  matcher: [
    '/dashboard(.*)',    // Protect /dashboard and nested routes
    '/checklist/edit',
    '/messages/send',
    '/tribute/create',
    '/reviews/submit',
    '/admin/:path*',      // Protect admin area
    '/vendor/dashboard/:path*', // Protect vendor dashboard
    '/vendor-profile/:path*',    // Protect vendor profiles
  ],
};
