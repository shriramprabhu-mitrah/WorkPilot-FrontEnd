export interface SignupPayload {
  name:string
  email: string;
  password: string;
  confirmPwd: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface SignupResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}
