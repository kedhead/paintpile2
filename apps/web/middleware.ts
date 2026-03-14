import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth');
  const isAuthenticated = !!authCookie?.value;

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isShareRoute = request.nextUrl.pathname.startsWith('/share');
  const isManifestRoute = request.nextUrl.pathname === '/manifest.webmanifest';
  const isPublicRoute = request.nextUrl.pathname === '/' || isShareRoute || isManifestRoute;

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isAuthRoute && !isApiRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
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
