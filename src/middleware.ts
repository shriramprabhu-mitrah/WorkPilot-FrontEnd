import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PRIVATE = '/dashboard';
const DEFAULT_PUBLIC = '/signin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('access_token')?.value;

  const isPublicRoute =
    pathname === '/' || pathname.startsWith('/signin') || pathname.startsWith('/signup');

  const isSetupRoute = pathname.startsWith('/setup');

  // User is not authenticated
  if (!token && !isPublicRoute && !isSetupRoute) {
    return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
  }

  // Authenticated users should not access auth pages
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_PRIVATE, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
