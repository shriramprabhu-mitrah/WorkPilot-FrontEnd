import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './token-utils';

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };

export const getAccessTokenCookieOptions = (expiresInSeconds?: number) => ({
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  ...(expiresInSeconds ? { maxAge: expiresInSeconds } : {}),
});

export const getRefreshTokenCookieOptions = () => ({
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
});
