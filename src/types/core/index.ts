export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  meta?: PaginationMeta;
  status: number;
  message: string;
}

export interface ApiResponseError {
  message: string;
  status: number;
  data: {
    message: string;
  };
}
