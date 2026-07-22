import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PRIVATE = '/dashboard';
const DEFAULT_PUBLIC = '/signin';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('accessToken')?.value;

  const isPublicRoute =
    pathname === '/' || pathname.startsWith('/signin') || pathname.startsWith('/signup');

  // Not authenticated
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
  }

  // Already authenticated
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_PRIVATE, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
