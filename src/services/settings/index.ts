import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';

import {
  Role,
  CreateRolePayload,
  UpdateRolePayload,
} from '@/src/types/settings';

class RoleService {
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const url = ApiEndpoints.Role.getRoles.url;

    return apiService.get<Role[]>(url);
  }

  async createRole(
    payload: CreateRolePayload
  ): Promise<ApiResponse<Role>> {
    const url = ApiEndpoints.Role.createRole.url;

    return apiService.post<Role>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Role created successfully',
    });
  }

  async getRoleById(
    roleId: string
  ): Promise<ApiResponse<Role>> {
    const endpoint = ApiEndpoints.Role.getRoleById.withNamedParams({
      roleId,
    });

    return apiService.get<Role>(endpoint.url);
  }

  async updateRole(
    roleId: string,
    payload: UpdateRolePayload
  ): Promise<ApiResponse<Role>> {
    const url = ApiEndpoints.Role.updateRole.withParams({
      roleId,
    });

    return apiService.patch<Role>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Role updated successfully',
    });
  }

  async deleteRole(
    roleId: string
  ): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Role.deleteRole.withParams({
      roleId,
    });

    return apiService.delete<unknown>(url, {
      showSuccessToast: true,
      successMessage: 'Role deleted successfully',
    });
  }
}

export const roleService = new RoleService();