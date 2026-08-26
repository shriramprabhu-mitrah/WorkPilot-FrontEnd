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
  username?: string;
  is_active?: boolean;
  color?: string;
  organization_id?:string;
  organization_name?:string;
  require_password_change?:boolean;
}

export interface UserUpdatePayload {
  full_name: string;
  avatar?: File;
}
export interface UserInsights {
  total_assigned: number;
  in_progress: number;
  completed: number;
  completion_percentage: number;
}