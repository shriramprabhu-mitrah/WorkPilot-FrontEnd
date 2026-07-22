export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  department?: string;
  location?: string;
  timezone?: string;
  created_at?: string;
  username?:string;
  is_active?:boolean;
}

export interface UserUpdatePayload {
  full_name?: string;
  department?: string;
  location?: string;
  timezone?: string;
}
