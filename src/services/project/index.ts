import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import {
  Project,
  ProjectDetail,
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

  async getProject(params?: GetProjectQueryParams): Promise<ApiResponse<Project>> {
    const searchParams = new URLSearchParams();
    if (params?.name) {
      searchParams.append('name', params.name);
    }
    if (params?.status) {
      searchParams.append('status', params.status);
    }
    const query = searchParams.toString();
    const url = `${ApiEndpoints.Project.getProject.url}${query ? `?${query}` : ''}`;
    return apiService.get<Project>(url);
  }

  async getProjectDetail(projectId: string): Promise<ApiResponse<ProjectDetail>> {
    const url = ApiEndpoints.Project.getProjectDetail.withParams({ projectId });

    return apiService.get<ProjectDetail>(url);
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

  async deleteProject(projectId: string): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Project.deleteProject.withParams({ projectId });

    return apiService.delete<unknown>(url, undefined, {
      showSuccessToast: true,
      successMessage: 'Project deleted successfully',
    });
  }
}

export const projectService = new ProjectService();
