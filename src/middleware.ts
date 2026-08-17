import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/src/lib/auth/refresh-access-token';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '@/src/lib/auth/cookie-options';

const ORG_SLUG_COOKIE = 'org_slug';
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
  const orgSlug = req.cookies.get(ORG_SLUG_COOKIE)?.value;

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === '/' || 
    pathname.startsWith('/signin') || 
    pathname.startsWith('/signup');

  // Organization-protected routes (anything under /{orgSlug}/)
  const orgSlugPattern = /^\/[^\/]+\/(dashboard|projects|backlog|tasks|boards|settings|profile|teams|calendar|reports|analytics|issues|members|sprint)/;
  const isOrgProtectedRoute = orgSlugPattern.test(pathname);

  const isSetupRoute = pathname.startsWith('/setup');
  const fromSetup = req.nextUrl.searchParams.get('from') === 'setup';
  const fromSignup = req.nextUrl.searchParams.get('from') === 'signup';

  // Handle setup route
  if (isSetupRoute) {
    if (accessToken && fromSignup) {
      return NextResponse.next();
    }

    if (accessToken && orgSlug) {
      // User is authenticated and has org - redirect to dashboard
      return NextResponse.redirect(new URL(`/${orgSlug}/dashboard`, req.url));
    }

    if (accessToken) {
      // Authenticated but no org yet - allow setup
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
  }

  // Missing access token but refresh token exists — refresh before redirecting
  if (!accessToken && refreshToken && (isOrgProtectedRoute || pathname === '/')) {
    try {
      const tokens = await refreshAccessToken(refreshToken, req.url);
      return applyRefreshedTokens(NextResponse.next(), tokens);
    } catch {
      return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
    }
  }

  // No tokens at all on a protected route
  if (!accessToken && !refreshToken && (isOrgProtectedRoute || (pathname === '/' && !isPublicRoute))) {
    return NextResponse.redirect(new URL(DEFAULT_PUBLIC, req.url));
  }

  // Authenticated user accessing public auth routes - redirect to dashboard
  if (accessToken && (pathname === '/signin' || pathname === '/signup') && !fromSetup) {
    if (orgSlug) {
      return NextResponse.redirect(new URL(`/${orgSlug}/dashboard`, req.url));
    } else {
      // No org slug yet, redirect to root which will handle it
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Authenticated user at root - redirect to their org dashboard
  if (accessToken && pathname === '/' && orgSlug) {
    return NextResponse.redirect(new URL(`/${orgSlug}/dashboard`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
