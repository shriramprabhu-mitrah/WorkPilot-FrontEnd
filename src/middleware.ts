import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/src/lib/auth/refresh-access-token';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/src/lib/auth/cookie-options';

const DEFAULT_PRIVATE = '/dashboard';
const DEFAULT_PUBLIC = '/signin';

const applyRefreshedTokens = (
  response: NextResponse,
  tokens: { access_token: string; refresh_token: string; expires_in?: number }
) => {
  response.cookies.set(
    ACCESS_TOKEN_KEY,
    tokens.access_token,
    getAccessTokenCookieOptions(tokens.expires_in)
  );
  response.cookies.set(REFRESH_TOKEN_KEY, tokens.refresh_token, getRefreshTokenCookieOptions());

  return response;
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_KEY)?.value;

  const isPublicRoute =
    pathname === '/' || pathname.startsWith('/signin') || pathname.startsWith('/signup');

  const isSetupRoute = pathname.startsWith('/setup');

  // Missing access token but refresh token exists — refresh before redirecting
  if (!accessToken && refreshToken && !isPublicRoute && !isSetupRoute) {
    try {
      const tokens = await refreshAccessToken(refreshToken, req.url);
      return applyRefreshedTokens(NextResponse.next(), tokens);
    } catch {
      return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
    }
  }

  // No tokens at all on a protected route
  if (!accessToken && !refreshToken && !isPublicRoute && !isSetupRoute) {
    return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
  }

  // Authenticated users should not access auth pages
  if (accessToken && isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_PRIVATE, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
