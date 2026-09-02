import axios from 'axios';
import { getRefreshToken, setTokens } from '@/src/lib/utils/cookies';
import { showToast } from '@/src/utils/toast';
import { getAuthSource } from '../utils/auth';
import { signupService } from '@/src/services/signup';

export const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers['X-Client-Platform'] = getAuthSource();

  return config;
});

let isRefreshing = false;
let isLoggingOut = false;
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
  if (typeof window !== 'undefined' && !isLoggingOut) {
    isLoggingOut = true;
    showToast.error('Session expired. Please sign in again.');
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
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

  // Use the service method for refresh
  const response = await signupService.refreshToken(refreshToken);

  if (!response.data) {
    throw new Error('Failed to refresh access token');
  }

  const tokens = response.data;
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
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/password-reset/request') ||
      requestUrl.includes('/auth/password-reset/confirm')
    ) {
      return Promise.reject(error);
    }

    if (isLoggingOut) {
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

// Export helper to set logout state
export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};
