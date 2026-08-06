import { ProjectStatus } from "../project";

export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  tasks: number;
  done: number;
}
export interface RoleCard {
  name: string;
  description: string;
  dotColor: string;
  permissions: string[];
}
export interface TeamMember {
  id: string;
  organization_id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  timezone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RemoveUserPayload {
  user_id: string;
}

export interface UpdateRolePayload {
  user_id: string;
  role: string;
}

export interface User {
  id: string;
  organization_id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  timezone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProject {
  project_id: string;
  project_name: string;
  role: string;
  status: ProjectStatus;
}

export interface GetUserProjectsResponse {
  user_id: string;
  project: UserProject[];
}
