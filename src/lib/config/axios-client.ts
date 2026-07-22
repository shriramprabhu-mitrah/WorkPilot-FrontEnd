import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from '../utils/cookies';

export const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Rotation on 401
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
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use raw axios to avoid circular dependency with apiService
        const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
        const response = await axios.post(`${baseURL}/auth/refresh`, { token: refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data?.data || response.data;

        if (accessToken) {
          setTokens(accessToken, newRefreshToken || refreshToken);

          // Update the failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed (token expired or invalid)
        removeTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return Promise.reject(refreshError);
      }
    }

    // If 403 or other unauthorized access not handled by refresh
    if ((status === 401 || status === 403) && typeof window !== 'undefined') {
      window.location.href = '/signin';
    }

    return Promise.reject(error);
  }
);
