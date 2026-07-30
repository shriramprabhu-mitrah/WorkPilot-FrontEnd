import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectMember,
  AddProjectMembersPayload,
  GetProjectQueryParams,
} from '@/src/types/project';

class ProjectService {
  async createProject(payload: CreateProjectPayload): Promise<ApiResponse<Project>> {
    const url = ApiEndpoints.Project.createProject.url;

    return apiService.post<Project>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Project created successfully',
    });
  }

  async getProject(): Promise<ApiResponse<Project>> {
    const url = ApiEndpoints.Project.getProject.url;

    return apiService.get<Project>(url);
  }

  async updateProject(
    projectId: string,
    payload: UpdateProjectPayload
  ): Promise<ApiResponse<Project>> {
    const url = ApiEndpoints.Project.updateProject.withParams({ projectId });

    return apiService.patch<Project>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Project updated successfully',
    });
  }

  async addMembers(payload: AddProjectMembersPayload): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Project.addMembers.url;

    return apiService.post<unknown>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Members added successfully',
    });
  }

  async getProjectMembers(projectId: string): Promise<ApiResponse<ProjectMember[]>> {
    const url = ApiEndpoints.Project.getProjectMembers.withParams({ projectId });

    return apiService.get<ProjectMember[]>(url);
  }

  async removeMember(projectId: string, userId: string): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Project.removeMember.withParams({ projectId, userId });

    return apiService.delete<unknown>(url, undefined, {
      showSuccessToast: true,
      successMessage: 'Member removed successfully',
    });
  }
}

export const projectService = new ProjectService();
