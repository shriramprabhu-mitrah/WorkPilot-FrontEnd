import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setTokens = (accessToken: string, refreshToken?: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    secure: isProduction,
    sameSite: 'strict',
  });
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      secure: isProduction,
      sameSite: 'strict',
      expires: 7,
    });
  }
};

export const getAccessToken = () => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
