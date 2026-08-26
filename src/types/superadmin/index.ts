export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  domain: string;
  industry: string;
  team_size: string;
  country: string;
  is_active: boolean;
  created_at: string;
  total_projects: number;
  total_members: number;
}

export interface AdminOrganizationMember {
  id: string;
  organization_id: string;
  organization_name: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  joined_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  organization_name: string;
  name: string;
  description: string;
  status: string;
  created_by: string;
  created_at: string;
  sprint_count: number;
  total_tasks: number;
  total_members: number;
  key?:string;
  project_key?:string;
  slug?:string;
}

export interface AdminMembersParams {
  page?: number;
  page_size?: number;
  search?: string;
  full_name?: string;
  email?: string;
  username?: string;
  role?: string;
  organization_id?: string;
  is_active?: boolean;
  is_verified?: boolean;
  timezone?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  [key: string]: string | number | boolean | undefined;
}

export interface AdminProjectsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  include_sprints?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface UpdateOrganization {
  organizationId: string;
  is_active: boolean;
}
