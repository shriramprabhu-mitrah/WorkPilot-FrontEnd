import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { ApiResponse } from '@/src/types/core';
import {
  InviteUsersPayload,
  OrganizationPaylaod,
  OrganizationResponse,
  OrganizationUpdatePaylaod,
} from '@/src/types/organization';

export interface OrganizationUser {
  id: string;
  name?: string;
  email: string;
  role?: string;
  status?: string;
}

export interface GetUsersParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

class OrganizationService {
  async createOrganization(payload: FormData): Promise<ApiResponse<OrganizationResponse>> {
    const url = ApiEndpoints.Organization.createOrganization.url;

    return apiService.post<OrganizationResponse>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async inviteUsers(payload: InviteUsersPayload): Promise<ApiResponse<OrganizationResponse>> {
    const url = ApiEndpoints.Organization.inviteUsers.url;

    return apiService.post<OrganizationResponse>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async getOrganization(): Promise<ApiResponse<OrganizationResponse>> {
    const url = ApiEndpoints.Organization.getOrganization.url;

    return apiService.get<OrganizationResponse>(url, {
      showErrorToast: true,
    });
  }

  async updateOrganization(
    payload: OrganizationUpdatePaylaod
  ): Promise<ApiResponse<OrganizationResponse>> {
    const url = ApiEndpoints.Organization.updateOrganization.url;
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.domain) formData.append('domain', payload.domain);
    if (payload.industry) formData.append('industry', payload.industry);
    if (payload.team_size) formData.append('team_size', payload.team_size);
    if (payload.country_id) formData.append('country_id', payload.country_id);
    if (payload.logo) formData.append('logo', payload.logo);
    return apiService.patch<OrganizationResponse>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteOrganization(): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.Organization.deleteOrganization.url;

    return apiService.delete<void>(url, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async getUsers(params: GetUsersParams = {}): Promise<PaginatedApiResponse<OrganizationUser[]>> {
    const { page = 1, page_size = 10, is_active } = params;

    const queryParams: Record<string, string | number | boolean> = {
      page,
      page_size,
    };

    if (is_active !== undefined) {
      queryParams.is_active = is_active;
    }

    const url = ApiEndpoints.Organization.getUsers.withQuery(queryParams);

    return apiService.get<OrganizationUser[]>(url, {
      showErrorToast: true,
    });
  }
}

export const organizationService = new OrganizationService();
