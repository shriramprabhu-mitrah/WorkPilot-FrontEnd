import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
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
import { UpdateProjectRolePayload } from '@/src/modules/project/types/project';

class ProjectService {
  async createProject(payload: CreateProjectPayload): Promise<ApiResponse<Project>> {
    const url = ApiEndpoints.Project.createProject.url;

    return apiService.post<Project>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Project created successfully',
    });
  }

  async getProject(params?: GetProjectQueryParams): Promise<PaginatedApiResponse<Project[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', String(params.page));
    }

    if (params?.page_size) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params?.name) {
      searchParams.append('name', params.name);
    }

    if (params?.status) {
      searchParams.append('status', params.status);
    }

    if (params?.fieldName) {
      searchParams.append('fieldName', params.fieldName);
    }

    const query = searchParams.toString();
    const url = `${ApiEndpoints.Project.getProject.url}${query ? `?${query}` : ''}`;
    return apiService.getPaginated<Project[]>(url);
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

  async updateProjectRole(payload: UpdateProjectRolePayload) {
    const url = ApiEndpoints.Project.updateProjectRole.url
      .replace('{projectId}', payload.project_id)
      .replace('{userId}', payload.user_id);
    return apiService.patch(
      url,
      {
        project_role: payload.project_role,
      },
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }
}

export const projectService = new ProjectService();
