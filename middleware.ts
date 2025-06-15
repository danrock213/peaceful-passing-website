// middleware.ts
import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/', 
    '/sign-in', 
    '/sign-up',
    '/vendors',
    '/vendors/:path*',
    '/checklist',        // Allow public viewing checklist page
    '/messages',         // messages page maybe public? or only protected on send?
    '/tribute',
    '/reviews',
  ],
});

export const config = {
  matcher: [
    '/checklist/edit',     // or your route where checklist editing happens
    '/messages/send',      // messages send API or page
    '/tribute/create',     // tribute creation pages
    '/reviews/submit',     // reviews submission route
  ],
};
