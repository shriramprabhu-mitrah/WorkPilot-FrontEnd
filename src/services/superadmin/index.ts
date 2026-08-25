import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { AdminMembersParams, AdminOrganization, AdminOrganizationMember, AdminProjectsParams, Project } from '@/src/types/superadmin';

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

  async updateOrganization(
    organizationId: string,
    is_active: boolean
  ): Promise<PaginatedApiResponse<AdminOrganization[]>> {
    const url = ApiEndpoints.SuperAdmin.activeOrganization.withParams({
      organizationId: organizationId,
    });

    return apiService.patch<AdminOrganization[]>(url, {
      is_active,
    });
  }
}

export const userAdminService = new AdminService();
