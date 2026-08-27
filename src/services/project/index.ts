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
  GetProjectMembersParams,
  Activity,
  ActivityFilters,
} from '@/src/types/project';
import { UpdateProjectRolePayload } from '@/src/modules/project/types/project';

export interface UserProjectRole {
  project_id: string;
  project_name: string;
  project_key: string;
  role_id: string;
  role: string;
}

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

    if (params?.fields) {
      searchParams.append('fields', params.fields);
    }

    if (params?.include_sprints) {
      searchParams.append('include_sprints', 'true');
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

  async getProjectMembers(projectId: string, params?: GetProjectMembersParams) {
    const url = ApiEndpoints.Project.getProjectMembers.withParams({
      projectId,
    });
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) {
      searchParams.append('page', String(params.page));
    }
    if (params?.page_size !== undefined) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params?.name?.trim()) {
      searchParams.append('name', params.name.trim());
    }
    const query = searchParams.toString();
    return apiService.get<ProjectMember[]>(query ? `${url}?${query}` : url);
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
        role_id: payload.role_id ?? payload.project_role,
      },
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }

  async getActivities(
    projectId: string,
    params: ActivityFilters
  ): Promise<PaginatedApiResponse<Activity[]>> {
    const url = ApiEndpoints.Project.getProjectActivity.withNamedParams({ 
      projectId, 
      type: String(params.type) 
    }).url;

    const searchParams = new URLSearchParams();
    if (params.page !== undefined) {
      searchParams.append('page', String(params.page));
    }
    if (params.page_size !== undefined) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params.action) {
      searchParams.append('action', params.action);
    }
    if (params.resource_type) {
      searchParams.append('resource_type', params.resource_type);
    }
    if (params.resource_id) {
      searchParams.append('resource_id', params.resource_id);
    }
    if (params.task_id) {
      searchParams.append('task_id', params.task_id);
    }
    if (params.user_story_id) {
      searchParams.append('user_story_id', params.user_story_id);
    }
    if (params.sprint_id) {
      searchParams.append('sprint_id', params.sprint_id);
    }
    if (params.user_id) {
      searchParams.append('user_id', params.user_id);
    }
    if (params.activity_type) {
      searchParams.append('activity_type', params.activity_type);
    }
    if (params.start_date) {
      searchParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      searchParams.append('end_date', params.end_date);
    }

    const query = searchParams.toString();
    const finalUrl = query ? `${url}?${query}` : url;

    return apiService.getPaginated<Activity[]>(finalUrl);
  }

  async getUserProjectRole(projectId: string): Promise<ApiResponse<UserProjectRole>> {
    const url = ApiEndpoints.Project.getUserProjectRole.withParams({ projectId });
    return apiService.get<UserProjectRole>(url);
  }
}

export const projectService = new ProjectService();
