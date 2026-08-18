import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { ApiResponse } from '@/src/types/core';
import {
  TaskPayload,
  TaskResponse,
  GetTasksQueryParams,
  UpdateTaskPayload,
  BulkUpdateTasksPayload,
  ClonePayload,
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '@/src/types/task';
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
    if (params?.fields) {
      searchParams.append('fields', params.fields);
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

  async getTaskById(projectId: string, taskId: string): Promise<ApiResponse<TaskResponse>> {
    const url = ApiEndpoints.Task.getTaskbyId.withParams({ projectId, taskId });
    return apiService.get<TaskResponse>(url);
  }

  async deleteTask(projectId: string, taskIds: string[]): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Task.deleteTask.withParams({
      projectId,
    });
    return apiService.delete<unknown>(url, {
      task_ids: taskIds,
    });
  }

  async updateTask(
    projectId: string,
    taskId: string,
    payload: UpdateTaskPayload
  ): Promise<ApiResponse<TaskResponse>> {
    const url = ApiEndpoints.Task.updateTaskbyId.withParams({
      projectId,
      taskId,
    });
    return apiService.patch<TaskResponse>(url, payload, {
      showSuccessToast: false,
      showErrorToast: true,
    });
  }

  async bulkUpdateTasks(
    projectId: string,
    payload: BulkUpdateTasksPayload
  ): Promise<ApiResponse<TaskResponse[]>> {
    const url = ApiEndpoints.Task.bulkUpdate.withParams({
      projectId,
    });
    return apiService.patch<TaskResponse[]>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Tasks updated successfully',
    });
  }

  async cloneTask(
    projectId: string,
    taskId: string,
    payload: ClonePayload
  ): Promise<ApiResponse<TaskResponse>> {
    const url = ApiEndpoints.Task.cloneTask.withParams({
      projectId,
      taskId,
    });
    return apiService.post<TaskResponse>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Task cloned successfully',
    });
  }

  async attachLabel(
    projectId: string,
    taskId: string,
    labelId: string
  ): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Task.attachLabel.withParams({
      projectId,
      taskId,
      labelId,
    });
    return apiService.post<unknown>(url, undefined, {
      showSuccessToast: true,
      successMessage: 'Label attached successfully',
    });
  }

  async removeLabel(
    projectId: string,
    taskId: string,
    labelId: string
  ): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Task.removeLabel.withParams({
      projectId,
      taskId,
      labelId,
    });
    return apiService.delete<unknown>(url, {
      showSuccessToast: true,
      successMessage: 'Label removed successfully',
    });
  }

  async restoreTask(projectId: string, taskId: string): Promise<ApiResponse<TaskResponse>> {
    const url = ApiEndpoints.Task.restoreTask.withParams({
      projectId,
      taskId,
    });
    return apiService.post<TaskResponse>(
      url,
      {},
      {
        showSuccessToast: true,
        successMessage: 'Task restored successfully',
      }
    );
  }

  async getReplies(
    taskId: string,
    commentId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedApiResponse<Comment[]>> {
    const url = ApiEndpoints.Task.getReplies
      .withNamedParams({ taskId, commentId })
      .withQuery({ page, page_size: pageSize });
    return apiService.getPaginated<Comment[]>(url);
  }

  async getComments(
    taskId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedApiResponse<Comment[]>> {
    const url = ApiEndpoints.Task.getComments
      .withNamedParams({ taskId })
      .withQuery({ page, page_size: pageSize });
    return apiService.getPaginated<Comment[]>(url);
  }

  async createComment(
    taskId: string,
    payload: CreateCommentPayload
  ): Promise<ApiResponse<Comment>> {
    const url = ApiEndpoints.Task.createComment.withParams({ taskId });
    return apiService.post<Comment>(url, payload);
  }

  async updateComment(
    taskId: string,
    commentId: string,
    payload: UpdateCommentPayload
  ): Promise<ApiResponse<Comment>> {
    const url = ApiEndpoints.Task.updateComment.withParams({ taskId, commentId });
    return apiService.patch<Comment>(url, payload);
  }

  async deleteComment(
    taskId: string,
    commentId: string,
    payload: UpdateCommentPayload
  ): Promise<ApiResponse<Comment>> {
    const url = ApiEndpoints.Task.updateComment.withParams({ taskId, commentId });
    return apiService.delete<Comment>(url, payload);
  }
}

export const taskService = new TaskService();
