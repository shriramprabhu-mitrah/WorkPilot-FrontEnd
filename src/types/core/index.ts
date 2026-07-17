export interface ApiResponse<T> {
  data?: T;
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