export interface SignInPayload {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignInResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
}
