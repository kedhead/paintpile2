import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication (personal/private pages)
const authRequiredPrefixes = [
  '/profile',
  '/admin',
  '/settings',
  '/notifications',
  '/diary',
  '/pile',
  '/dashboard',
];

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth');
  const isAuthenticated = !!authCookie?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/auth');
  const isApiRoute = pathname.startsWith('/api');
  const isAuthRequired = authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Redirect unauthenticated users away from auth-required routes
  if (!isAuthenticated && !isApiRoute && isAuthRequired) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages (but allow password reset)
  if (isAuthenticated && isAuthRoute && !pathname.startsWith('/auth/reset-password')) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
