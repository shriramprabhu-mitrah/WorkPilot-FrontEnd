export interface SignupPayload {
  full_name:string;
  username:string;
  email: string;
  password: string;
  avatar_url?:string;
  timezone?:string
  confirmPwd?: string;
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
