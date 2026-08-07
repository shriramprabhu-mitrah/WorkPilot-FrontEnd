import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { ApiResponse } from '@/src/types/core';
import { GetUserProjectsResponse, RemoveUserPayload, TeamMember, UpdateRolePayload, User } from '@/src/types/teams';
import { apiService } from '../axios';
import { Project } from '@/src/types/project';

class TeamService {
  async getTeamMembers(page: number, pageSize: number): Promise<ApiResponse<TeamMember[]>> {
    const url = `${ApiEndpoints.Team.getUsers.url}?page=${page}&page_size=${pageSize}`;
    return apiService.get<TeamMember[]>(url, {
      showErrorToast: true,
    });
  }

async removeUser(payload: RemoveUserPayload) {
  return apiService.delete(
    ApiEndpoints.Team.removeUser.url,
    payload
  );
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

 async getProject(userId: string): Promise<ApiResponse<GetUserProjectsResponse>> {
  return apiService.get<GetUserProjectsResponse>(
    ApiEndpoints.Team.getProject.url.replace('{id}', userId),{
      showErrorToast: true,
    }
  );
}
}
export const teamService = new TeamService();
