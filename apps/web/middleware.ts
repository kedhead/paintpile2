import { NextResponse, type NextRequest } from 'next/server';

// Personal pages that need a signed-in user. Everything else — the gallery,
// project pages, profiles, painters, paints, posts, challenges — is public.
const authRequiredPrefixes = [
  '/home',
  '/admin',
  '/settings',
  '/notifications',
  '/diary',
  '/pile',
  '/dashboard',
];
// Exact matches only: /projects/<id> and /profile/<id> stay public.
const authRequiredExact = new Set(['/projects', '/profile']);

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth');
  const isAuthenticated = !!authCookie?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/auth');
  const isApiRoute = pathname.startsWith('/api');
  const isAuthRequired =
    authRequiredExact.has(pathname) ||
    authRequiredPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  // Redirect unauthenticated users away from auth-required routes
  if (!isAuthenticated && !isApiRoute && isAuthRequired) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages (but allow password reset)
  if (isAuthenticated && isAuthRoute && !pathname.startsWith('/auth/reset-password')) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
