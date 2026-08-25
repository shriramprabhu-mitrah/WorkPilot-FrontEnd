import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { ApiResponse } from '@/src/types/core';
import {
  GetUserProjectsResponse,
  ProjectMember,
  RemoveUserPayload,
  TeamMember,
  UpdateRolePayload,
  User,
} from '@/src/types/teams';
import { apiService } from '../axios';
import { Project } from '@/src/types/project';
import { AddProjectMembersPayload } from '@/src/types/project';
class TeamService {
  async getTeamMembers(page: number, pageSize: number): Promise<ApiResponse<TeamMember[]>> {
    const url = `${ApiEndpoints.Team.getUsers.url}?page=${page}&page_size=${pageSize}&is_active=true`;
    return apiService.get<TeamMember[]>(url, {
      showErrorToast: true,
    });
  }

  async getProjectMembers(
    projectId: string,
    page: number,
    pageSize: number
  ): Promise<ApiResponse<ProjectMember[]>> {
    const url = `${ApiEndpoints.Project.getProjectMembers.withParams({
      projectId,
    })}?page=${page}&page_size=${pageSize}`;

    return apiService.get<ProjectMember[]>(url, {
      showErrorToast: true,
    });
  }

  async addProjectMembers(payload: AddProjectMembersPayload) {
    return apiService.post(ApiEndpoints.Project.addMembers.url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async removeProjectMember(projectId: string, userId: string) {
    const url = ApiEndpoints.Project.removeMember.withParams({
      projectId,
      userId,
    });

    return apiService.delete(url, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async removeUser(payload: RemoveUserPayload) {
    const url = ApiEndpoints.Team.removeUser.url.replace('{user_id}', payload.user_id);
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

  async getProject(userId: string): Promise<ApiResponse<GetUserProjectsResponse>> {
    return apiService.get<GetUserProjectsResponse>(
      ApiEndpoints.Team.getProject.url.replace('{id}', userId),
      {
        showErrorToast: true,
      }
    );
  }
}
export const teamService = new TeamService();
