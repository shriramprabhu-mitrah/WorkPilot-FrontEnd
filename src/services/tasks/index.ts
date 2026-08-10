import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { ApiResponse } from '@/src/types/core';
import { TaskPayload, TaskResponse, GetTasksQueryParams } from '@/src/types/task';
import { apiService, PaginatedApiResponse } from '../axios';

class TaskService {
  async getTasks(
    projectId: string,
    params?: GetTasksQueryParams
  ): Promise<PaginatedApiResponse<TaskResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params?.sprint_id) {
      searchParams.append('sprint_id', params.sprint_id);
    }
    if (params?.fieldName) {
      searchParams.append('fieldName', params.fieldName);
    }

    const query = searchParams.toString();
    const endpoint = ApiEndpoints.Task.getTasks.withNamedParams({ projectId });
    const url = `${endpoint.url}${query ? `?${query}` : ''}`;
    return apiService.getPaginated<TaskResponse[]>(url);
  }

  async createTask(projectId: string, payload: TaskPayload): Promise<ApiResponse<TaskPayload[]>> {
    const url = ApiEndpoints.Task.createTasks.withParams({ projectId });
    return apiService.post<TaskPayload[]>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Task created successfully',
    });
  }

  async getTaskById(projectId: string, sprintId: string): Promise<ApiResponse<TaskResponse>> {
    const url = ApiEndpoints.Task.createTasks.withParams({ projectId, sprintId });
    return apiService.get<TaskResponse>(url);
  }
}

export const taskService = new TaskService();
