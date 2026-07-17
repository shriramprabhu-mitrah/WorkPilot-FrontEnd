export interface SignInPayload {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignInResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
