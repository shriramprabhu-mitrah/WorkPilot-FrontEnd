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

export interface ResetPasswordPaylaod {
  email: string;
  otp: string;
  new_password: string;
}