export interface Member {
  name: string;
  color: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
  tasks: number;
  goal?: string;
}
export interface Project {
  id?: string;
  initials: string;
  name: string;
  code: string;
  status: string;
  description: string;
  progress: number;
  tasks: string;
  date: string;
  members: Member[];
  owner?: string;
  creator?: Creator;
  sprint_count?: number;
}

export interface Creator {
  id: string;
  organization_id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  avatar_url: string;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  joined_at: string;
}

export interface UpdateProjectRolePayload {
  project_id: string;
  user_id: string;
  project_role: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  label_ids?: string[];
  priority?: string;
  sprint_id?: string;
  status?: string;
  story_points?: number;
  estimated_hours?: number;
  actual_hours?: number;
  type?: string;
}
