import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { AdminOrganization, AdminOrganizationMember, Project } from '@/src/types/superadmin';

export interface AdminOrganizationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  name?: string;
  domain?: string;
  industry?: string;
  team_size?: string;
  country?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  [key: string]: string | number | boolean | undefined;
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

class AdminService {
  async getOrganizations(
    params?: AdminOrganizationsParams
  ): Promise<PaginatedApiResponse<AdminOrganization[]>> {
    const endpoint = ApiEndpoints.SuperAdmin.getOrganization;
    const cleanParams = params
      ? (Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined)
        ) as Record<string, string | number | boolean>)
      : undefined;
    const url = cleanParams ? endpoint.withQuery(cleanParams) : endpoint.url;
    return apiService.getPaginated<AdminOrganization[]>(url);
  }

  async getMembers(
    params?: AdminMembersParams
  ): Promise<PaginatedApiResponse<AdminOrganizationMember[]>> {
    const endpoint = ApiEndpoints.SuperAdmin.getMembers;
    const cleanParams = params
      ? (Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined)
        ) as Record<string, string | number | boolean>)
      : undefined;
    const url = cleanParams ? endpoint.withQuery(cleanParams) : endpoint.url;
    return apiService.getPaginated<AdminOrganizationMember[]>(url);
  }

  async getAllProjects(params?: AdminProjectsParams): Promise<PaginatedApiResponse<Project[]>> {
    const endpoint = ApiEndpoints.SuperAdmin.getAllProjects;
    const cleanParams = params
      ? (Object.fromEntries(
          Object.entries(params).filter(([, value]) => value !== undefined)
        ) as Record<string, string | number | boolean>)
      : undefined;
    const url = cleanParams ? endpoint.withQuery(cleanParams) : endpoint.url;
    return apiService.getPaginated<Project[]>(url);
  }
}

export const userAdminService = new AdminService();
