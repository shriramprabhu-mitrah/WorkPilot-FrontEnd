import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import {
  InviteUsersPayload,
  OrganizationPaylaod,
  OrganizationResponse,
  OrganizationUpdatePaylaod,
} from '@/src/types/organization';

class OrganizationService {
  async createOrganization(
    payload: OrganizationPaylaod
  ): Promise<ApiResponse<OrganizationResponse>> {
    const url = ApiEndpoints.Organization.createOrganization.url;

    return apiService.post<OrganizationResponse>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
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

    return apiService.patch<OrganizationResponse>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async deleteOrganization(): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.Organization.deleteOrganization.url;

    return apiService.delete<void>(url, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }
}

export const organizationService = new OrganizationService();
