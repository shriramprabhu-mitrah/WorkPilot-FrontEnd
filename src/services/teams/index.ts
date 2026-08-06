import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { ApiResponse } from '@/src/types/core';
import { RemoveUserPayload, TeamMember, UpdateRolePayload, User } from '@/src/types/teams';
import { apiService } from '../axios';

class TeamService {
  async getTeamMembers(page: number, pageSize: number): Promise<ApiResponse<TeamMember[]>> {
    const url = `${ApiEndpoints.Team.getUsers.url}?page=${page}&page_size=${pageSize}`;
    return apiService.get<TeamMember[]>(url, {
      showErrorToast: true,
    });
  }

  async removeUser(payload: RemoveUserPayload) {
    const url = `${ApiEndpoints.Team.removeUser.url}?user_id=${payload.user_id}`;
    return apiService.delete(url);
  }

  async updateRole(payload: UpdateRolePayload) {
    return apiService.patch(ApiEndpoints.Team.updateRole.url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(ApiEndpoints.Team.getUserById.url.replace('{id}', id), {
      showErrorToast: true,
    });
  }
}
export const teamService = new TeamService();
