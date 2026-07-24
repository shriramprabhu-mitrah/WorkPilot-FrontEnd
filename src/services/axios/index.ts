import axios, { AxiosError, AxiosResponse } from 'axios';
import { logger } from '@/src/lib/utils/logger';
import { ApiResponse } from '@/src/types/core';
import { axiosInstance } from '@/src/lib/config/axios-client';

// Generic pagination interface based on the API structure
export interface PaginationInfo {
  page: number;
  pageSize?: number;
  page_size?: number;
  total_items?: number | string;
  totalItems?: number | string;
  total_pages?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  has_next_page?: boolean;
  hasPrevPage?: boolean;
  has_prev_page?: boolean;
}

// Generic paginated response interface
export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination?: PaginationInfo;
}
interface ErrorResponseData {
  error?: {
    message?: string;
    code?: string;
    details?: Array<{ field: string; message: string }>;
  };
  message?: string;
}

// Centralized error handling function
const handleApiError = (error: unknown, requestType: string): never => {
  logger.error(`${requestType} request failed`, error);

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data as ErrorResponseData | undefined;

    const errorMessage =
      data?.error?.message ?? data?.message ?? axiosError.message ?? 'Something went wrong';

    const apiError = new Error(errorMessage) as Error & {
      status: number;
      data: unknown;
    };

    apiError.status = status;
    apiError.data = data;

    throw apiError;
  }

  throw error;
};

// Process the API response to a standardized format
const processResponse = <T>(response: AxiosResponse): ApiResponse<T> => {
  let data = response?.data?.data ?? response?.data;

  // If `data` has a `result` field, unwrap it
  if (data && typeof data === 'object' && 'result' in data) {
    data = data.result;
  }

  return {
    data,
    message: response?.data?.message,
    status: response.status,
  };
};

// Process the API response with pagination support
const processPaginatedResponse = <T>(response: AxiosResponse): PaginatedApiResponse<T> => {
  let data = response?.data?.data ?? response?.data;

  // Handle nested `result` field
  if (data && typeof data === 'object' && 'result' in data) {
    data = data.result;
  }

  return {
    data,
    message: response?.data?.message,
    status: response.status,
    pagination: response?.data?.pagination ?? response?.data?.data?.pagination ?? undefined,
  };
};

class AxiosApiService {
  // GET Request
  async get<T>(endpoint: string, options: object = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.get(endpoint, options);
      return processResponse<T>(response);
    } catch (error) {
      return handleApiError(error, 'GET');
    }
  }

  // POST Request
  async post<T>(endpoint: string, payload: unknown, options: object = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.post(endpoint, payload, options);
      return processResponse<T>(response);
    } catch (error) {
      return handleApiError(error, 'POST');
    }
  }

  // PUT Request
  async put<T>(endpoint: string, payload: unknown, options: object = {}): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.put(endpoint, payload, options);
      return processResponse<T>(response);
    } catch (error) {
      return handleApiError(error, 'PUT');
    }
  }

  // PATCH Request
  async patch<T>(
    endpoint: string,
    payload: unknown,
    options: object = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axiosInstance.patch(endpoint, payload, options);
      return processResponse<T>(response);
    } catch (error) {
      return handleApiError(error, 'PATCH');
    }
  }

  // DELETE Request
  async delete<T>(
    endpoint: string,
    payload?: unknown,
    options: object = {}
  ): Promise<ApiResponse<T>> {
    try {
      const config = payload ? { ...options, data: payload } : options;
      const response = await axiosInstance.delete(endpoint, config);
      return processResponse<T>(response);
    } catch (error) {
      return handleApiError(error, 'DELETE');
    }
  }

  // Paginated POST Request
  async postPaginated<T>(
    endpoint: string,
    payload: unknown,
    options: object = {}
  ): Promise<PaginatedApiResponse<T>> {
    try {
      const response = await axiosInstance.post(endpoint, payload, options);
      return processPaginatedResponse<T>(response);
    } catch (error) {
      return handleApiError(error, 'POST');
    }
  }
}

// Export a static instance for all services to use
export const apiService = new AxiosApiService();
