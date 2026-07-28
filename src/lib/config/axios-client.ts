import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allows cookies to be sent and received
});

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

    // Handle 401 errors with automatic token refresh via backend
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Backend handles refresh token from HTTP-only cookies
        const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        // Retry the original request - backend will use refreshed cookie
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to signin
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
