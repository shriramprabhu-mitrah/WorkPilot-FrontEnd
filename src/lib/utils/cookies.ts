import Cookies from 'js-cookie';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/src/lib/auth/cookie-options';

export const setTokens = (
  accessToken: string,
  refreshToken?: string,
  expiresInSeconds?: number
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    secure: isProduction,
    sameSite: 'strict',
    ...(expiresInSeconds ? { expires: new Date(Date.now() + expiresInSeconds * 1000) } : {}),
  });

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      secure: isProduction,
      sameSite: 'strict',
      expires: 7,
    });
  }
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const getAccessToken = () => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

export const removeTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
