import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Check for Supabase auth cookies (multiple possible cookie names)
  const cookies = req.cookies.getAll();
  const hasAuthCookie = cookies.some(cookie =>
    cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  );

  console.log('[Middleware]', {
    path: req.nextUrl.pathname,
    hasAuthCookie,
    cookieNames: cookies.map(c => c.name),
  });

  // Public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));

  // If no auth cookie and trying to access protected route, redirect to login
  if (!hasAuthCookie && !isPublicPath) {
    console.log('[Middleware] Redirecting to /login - no auth cookie');
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If has auth cookie and trying to access login, redirect to home
  if (hasAuthCookie && req.nextUrl.pathname === '/login') {
    console.log('[Middleware] Redirecting to / - already logged in');
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
