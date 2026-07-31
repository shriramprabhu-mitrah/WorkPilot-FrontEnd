// Project Types
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id?: string;
  name: string;
  key: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status?: ProjectStatus;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  organization_id?: string;
  creator?: Creator;
}

// Create Project Payload
export interface CreateProjectPayload {
  name: string;
  description?: string;
}

// Update Project Payload
export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
}

// Project Member Types
export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role?: string;
  joined_at?: string;
  user?: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Add Members Payload
export interface AddProjectMembersPayload {
  project_id: string;
  user_id: string[];
}

// Get Project Query Params
export interface GetProjectQueryParams {
  name?: string;
  status?: string;
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

// Sprint Types for Project Detail
export interface SprintDetail {
  id: string;
  name: string;
  goal?: string;
  status: string;
  start_date: string;
  end_date: string;
}

// Project Member for Project Detail
export interface ProjectDetailMember {
  user_id: string;
  username: string;
  full_name: string;
  role: string;
}

// Project Detail Response (includes sprints and members)
export interface ProjectDetail {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  created_by: string;
  creator: string; // This is just the creator's name
  created_at: string;
  members: ProjectDetailMember[];
  sprints: SprintDetail[];
  key?: string; // Optional key to be added after fetching
}
