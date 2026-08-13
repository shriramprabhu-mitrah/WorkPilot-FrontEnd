import axios from 'axios';
import { refreshAccessToken } from '@/src/lib/auth/refresh-access-token';
import { getRefreshToken, setTokens } from '@/src/lib/utils/cookies';
import { showToast } from '@/src/utils/toast';

export const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'web',
  },

  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

const redirectToSignIn = () => {
  if (typeof window !== 'undefined') {
    showToast.error('Session expired. Please sign in again.');

    setTimeout(() => {
      window.location.href = '/signin';
    }, 2000);
  }
};

const attemptTokenRefresh = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const tokens = await refreshAccessToken(refreshToken);
  setTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in);
};

// Response Interceptor: Handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';

    // Ignore 401/403 errors for auth routes to prevent loops
    if (
      requestUrl.includes('/auth/signin') ||
      requestUrl.includes('/auth/signup') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/password-reset/request') ||
      requestUrl.includes('/auth/password-reset/confirm')
    ) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(undefined),
            reject,
          });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await attemptTokenRefresh();
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        redirectToSignIn();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 || status === 403) {
      redirectToSignIn();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
