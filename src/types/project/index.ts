// Project Types
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id?: string;
  name: string;
  key?: string;
  slug?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  organization_id?: string;
  creator?: Creator;
  owner?: string;
  sprint_count?: number;
  sprints?: SprintDetail[];
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
  full_name?: string;
}

// Add Members Payload
export interface AddProjectMembersPayload {
  project_id: string;
  members: {
    user_id: string;
    project_role: string;
  }[];
}

// Get Project Query Params
export interface GetProjectQueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  status?: string;
  fields?: string;
  include_sprints?: boolean;
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

// Sprint API Types
export interface SprintItem {
  name: string;
  goal?: string;
  // start_date: string;
  // end_date: string;
}

export interface SprintPayload {
  sprints: SprintItem[];
}

export type UpdateSprintPayload = Partial<SprintItem>;

// Project Member for Project Detail
export interface ProjectDetailMember {
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  email?: string;
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
  owner?: string;
  slug?: string// Optional owner to be added after fetching
}

export interface ProjectMember {
  user_id: string;
  username: string;
  full_name?: string;
  role?: string;
  color?: string;
}

export interface GetProjectMembersParams {
  page?: number;
  page_size?: number;
  name?: string;
}

export interface ActivityUser {
  avatar_url: string;
  email: string;
  id: string;
  name: string;
  role: string;
}

export interface Activity {
  action: string;
  details: string;
  id: string;
  organization_id: string;
  project_id: string;
  project_name: string;
  resource_id: string;
  resource_type: string;
  sprint_name: string;
  task_key: string;
  task_name: string;
  timestamp: string;
  title: string;
  user: ActivityUser;
  user_story_name: string;
}

export type ActivityType = 'view' | 'activity';

export type ActivityResourceType =
  | 'project'
  | 'task'
  | 'userstory'
  | 'sprint'
  | 'comment';

export interface ActivityFilters {
  type: ActivityType;
  page?: number;
  page_size?: number;
  action?: string;
  resource_type?: ActivityResourceType;
  resource_id?: string;
  task_id?: string;
  user_story_id?: string;
  sprint_id?: string;
  user_id?: string;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}