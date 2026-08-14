import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { ApiResponse } from '@/src/types/core';

import {
  CreateTaskUnderStoryPayload,
  TaskRelationshipResponse,
  TaskStoryRelationshipItem,
} from '@/src/types/taskStoryRelationship';

class TaskStoryRelationshipService {
  async createTaskUnderStory(
    projectId: string,
    payload: CreateTaskUnderStoryPayload
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.TaskStoryRelationship.createTaskUnderStory.withParams({
      projectId,
    });

    return apiService.post<void>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async assignTaskToStory(
    projectId: string,
    taskId: string,
    userStoryId: string
  ): Promise<ApiResponse<TaskRelationshipResponse>> {
    const url = ApiEndpoints.TaskStoryRelationship.assignTaskToStory.withParams({
      projectId,
      taskId,
    });

    return apiService.patch<TaskRelationshipResponse>(
      url,
      {
        user_story_id: userStoryId,
      },
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }

  async removeTaskFromStory(
    projectId: string,
    taskId: string
  ): Promise<ApiResponse<TaskRelationshipResponse>> {
    const url = ApiEndpoints.TaskStoryRelationship.removeTaskFromStory.withParams({
      projectId,
      taskId,
    });

    return apiService.patch<TaskRelationshipResponse>(
      url,
      {
        user_story_id: null,
      },
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }

  async getTasksByStory(
    projectId: string,
    userStoryId: string
  ): Promise<PaginatedApiResponse<TaskStoryRelationshipItem[]>> {
    const endpoint = ApiEndpoints.TaskStoryRelationship.getTasksByStory.withNamedParams({
      projectId,
    });

    const url = endpoint.withQuery({
      user_story_id: userStoryId,
    });

    return apiService.getPaginated<TaskStoryRelationshipItem[]>(url);
  }
}

export const taskStoryRelationshipService = new TaskStoryRelationshipService();
