import { apiService } from '@/src/services/axios';
import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import {
  CustomStatus,
  CreateCustomStatusPayload,
  UpdateCustomStatusPayload,
  AssignColorToTaskPayload,
} from '@/src/types/colors';

export interface AssignColorToTaskResponse {
  success: boolean;
  status_code: number;
  message: string;
}

export const customStatusService = {
  // GET - Get all custom colors/statuses
  getCustomStatuses: async (projectId: string): Promise<CustomStatus[]> => {
    const response = await apiService.get<CustomStatus[]>(
      ApiEndpoints.TaskStatus.getTaskStatuses.withParams(projectId).url
    );

    return response.data ?? [];
  },

  // POST - Create custom color/status
  createCustomStatus: async (
    projectId: string,
    payload: CreateCustomStatusPayload
  ): Promise<CustomStatus> => {
    const response = await apiService.post<CustomStatus>(
      ApiEndpoints.TaskStatus.createTaskStatus(projectId),
      payload
    );

    return response.data!;
  },

  // PATCH - Update custom color/status
  updateCustomStatus: async (
    projectId: string,
    statusId: string,
    payload: UpdateCustomStatusPayload
  ): Promise<CustomStatus> => {
    const response = await apiService.patch<CustomStatus>(
      ApiEndpoints.TaskStatus.updateTaskStatus(projectId, statusId),
      payload
    );

    return response.data!;
  },

  // DELETE - Delete custom color/status
  deleteCustomStatus: async (projectId: string, statusId: string) => {
    const response = await apiService.delete(
      ApiEndpoints.TaskStatus.deleteTaskStatus(projectId, statusId)
    );

    return response.data;
  },

  // POST - Assign custom color/status to task
  assignCustomStatusToTask: async (
    projectId: string,
    payload: AssignColorToTaskPayload
  ): Promise<AssignColorToTaskResponse> => {
    const response = await apiService.post<AssignColorToTaskResponse>(
      ApiEndpoints.TaskStatus.assignTaskStatusToTask(projectId),
      payload
    );

    return response.data!;
  },
};
