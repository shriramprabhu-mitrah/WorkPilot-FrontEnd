import axios, { AxiosError, AxiosResponse } from 'axios';
import { logger } from '@/src/lib/utils/logger';
import { ApiResponse } from '@/src/types/core';
import { axiosInstance } from '@/src/lib/config/axios-client';
import { showToast } from '@/src/utils/toast';

// Generic pagination interface based on the API structure
export interface PaginationInfo {
  page: number;
  pageSize?: number;
  page_size?: number;
  total_items?: number | string;
  totalItems?: number | string;
  total_pages?: number;
  totalPages?: number;
  has_next?: boolean;
  has_previous?: boolean;
  hasNextPage?: boolean;
  has_next_page?: boolean;
  hasPrevPage?: boolean;
  has_prev_page?: boolean;
}

// Generic paginated response interface
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  meta?: PaginationInfo;
}
interface ErrorResponseData {
  error?: {
    message?: string;
    code?: string;
    details?: Array<{ field: string; message: string }>;
  };
  message?: string;
}

// Options for API requests with toast control
export interface ApiRequestOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  headers?: Record<string, string>;
}

// Centralized error handling function
const handleApiError = (
  error: unknown,
  requestType: string,
  options?: ApiRequestOptions
): never => {
  logger.error(`${requestType} request failed`, error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data as ErrorResponseData | undefined;

    const errorMessage =
      data?.error?.message ?? data?.message ?? axiosError.message ?? 'Something went wrong';

    // Show error toast if not explicitly disabled
    if (options?.showErrorToast !== false) {
      showToast.error(options?.errorMessage ?? errorMessage);
    }

    const apiError = new Error(errorMessage) as Error & {
      status: number;
      data: unknown;
    };

    apiError.status = status;
    apiError.data = data;

    throw apiError;
  }

  // Show generic error toast for non-axios errors
  if (options?.showErrorToast !== false) {
    showToast.error(options?.errorMessage ?? 'An unexpected error occurred');
  }

  throw error;
};

// Process the API response to a standardized format
const processResponse = <T>(
  response: AxiosResponse,
  options?: ApiRequestOptions
): ApiResponse<T> => {
  let data = response?.data?.data ?? response?.data;

  // If `data` has a `result` field, unwrap it
  if (data && typeof data === 'object' && 'result' in data) {
    data = data.result;
  }

  // Show success toast if requested
  if (options?.showSuccessToast) {
    const successMessage = options?.successMessage ?? response?.data?.message ?? 'Success!';
    showToast.success(successMessage);
  }

  return {
    data,
    message: response?.data?.message,
    status: response.status,
  };
};

// Process the API response with pagination support
const processPaginatedResponse = <T>(
  response: AxiosResponse,
  options?: ApiRequestOptions
): PaginatedApiResponse<T> => {
  let data = response?.data?.data ?? response?.data;

  // Handle nested `result` field
  if (data && typeof data === 'object' && 'result' in data) {
    data = data.result;
  }

  // Show success toast if requested
  if (options?.showSuccessToast) {
    const successMessage = options?.successMessage ?? response?.data?.message ?? 'Success!';
    showToast.success(successMessage);
  }

  return {
    data,
    message: response?.data?.message,
    status: response.status,
    meta: response?.data?.meta ?? response?.data?.data?.meta ?? undefined,
  };
};

class AxiosApiService {
  // GET Request
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get(endpoint);
      return processResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'GET', options);
    }
  }

  // POST Request
  async post<T>(
    endpoint: string,
    payload: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post(endpoint, payload, {
        headers: options?.headers,
      });

      return processResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'POST', options);
    }
  }

  async postFormData<T>(
    endpoint: string,
    payload: FormData,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post(endpoint, payload, {
        headers: {
          'Content-Type': undefined,
          ...options?.headers,
        },
      });

      return processResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'POST', options);
    }
  }
  // PUT Request
  async put<T>(
    endpoint: string,
    payload: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put(endpoint, payload);
      return processResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'PUT', options);
    }
  }

  // PATCH Request
  async patch<T>(
    endpoint: string,
    payload: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch(endpoint, payload, {
        headers: options?.headers,
      });
      return processResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'PATCH', options);
    }
  }

  // DELETE Request
  async delete<T>(
    endpoint: string,
    payload?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const config = payload ? { data: payload } : undefined;
      const response = await axiosInstance.delete(endpoint, config);
      return processResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'DELETE', options);
    }
  }

  // Paginated POST Request
  async postPaginated<T>(
    endpoint: string,
    payload: unknown,
    options?: ApiRequestOptions
  ): Promise<PaginatedApiResponse<T>> {
    try {
      const response = await axiosInstance.post(endpoint, payload);
      return processPaginatedResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'POST', options);
    }
  }

  async getPaginated<T>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<PaginatedApiResponse<T>> {
    try {
      const response = await axiosInstance.get(endpoint);
      return processPaginatedResponse<T>(response, options);
    } catch (error) {
      return handleApiError(error, 'GET', options);
    }
  }

  // GET Request for file/blob downloads
  async getBlob(endpoint: string, options?: ApiRequestOptions): Promise<Blob> {
    try {
      const response = await axiosInstance.get(endpoint, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      return handleApiError(error, 'GET', options);
    }
  }
}

// Export a static instance for all services to use
export const apiService = new AxiosApiService();
