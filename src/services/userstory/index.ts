import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { PaginatedApiResponse } from '../axios';
import { apiService } from '../axios';
import {
  GetUserStoriesQueryParams,
  ReorderUserStoriesPayload,
  UpdateUserStoryPayload,
  UserStoryAttachment,
  UserStoryAttachmentResponse,
  UserStoryPayload,
  UserStoryResponse,
} from '@/src/types/userstories';
import { ApiResponse } from '@/src/types/core';
import { axiosInstance } from '@/src/lib/config/axios-client';
class UserStoryService {
  async getUserStories(
    projectId: string,
    params?: GetUserStoriesQueryParams
  ): Promise<PaginatedApiResponse<UserStoryResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params?.sort_by) {
      searchParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      searchParams.append('sort_order', params.sort_order);
    }
    if (params?.status) {
      searchParams.append('status', params.status);
    }
    if (params?.assignee_id) {
      searchParams.append('assignee_id', params.assignee_id);
    }
    if (params?.reporter_id) {
      searchParams.append('reporter_id', params.reporter_id);
    }
    if (params?.sprint_id) {
      searchParams.append('sprint_id', params.sprint_id);
    }
    if (params?.priority) {
      searchParams.append('priority', params.priority);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }
    const query = searchParams.toString();
    const endpoint = ApiEndpoints.UserStory.getUserStories.withNamedParams({
      projectId,
    });
    const url = `${endpoint.url}${query ? `?${query}` : ''}`;
    return apiService.getPaginated<UserStoryResponse[]>(url);
  }

  async createUserStory(
    projectId: string,
    payload: UserStoryPayload
  ): Promise<ApiResponse<UserStoryResponse>> {
    const url = ApiEndpoints.UserStory.createUserStory.withParams({
      projectId,
    });
    return apiService.post<UserStoryResponse>(url, payload, {
      showSuccessToast: true,
      successMessage: 'User story created successfully',
    });
  }

  async getUserStoryById(
    projectId: string,
    userStoryId: string
  ): Promise<ApiResponse<UserStoryResponse>> {
    const endpoint = ApiEndpoints.UserStory.getUserStoryById.withNamedParams({
      projectId,
      userStoryId,
    });
    return apiService.get<UserStoryResponse>(endpoint.url);
  }

  async updateUserStory(
    projectId: string,
    userStoryId: string,
    payload: UpdateUserStoryPayload
  ): Promise<ApiResponse<UserStoryResponse>> {
    const url = ApiEndpoints.UserStory.updateUserStory.withParams({
      projectId,
      userStoryId,
    });
    return apiService.patch<UserStoryResponse>(url, payload, {
      showSuccessToast: true,
    });
  }

  async deleteUserStory(projectId: string, userStoryId: string): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.UserStory.deleteUserStory.withParams({
      projectId,
      userStoryId,
    });
    return apiService.delete<unknown>(url, {
      showSuccessToast: true,
      successMessage: 'User story deleted successfully',
    });
  }

  async reorderUserStories(
    projectId: string,
    payload: ReorderUserStoriesPayload
  ): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.UserStory.reorderUserStories.withParams({
      projectId,
    });
    return apiService.patch<unknown>(url, payload, {
      showSuccessToast: true,
      successMessage: 'User stories reordered successfully',
    });
  }

  async uploadUserStoryAttachment(
    projectId: string,
    userStoryId: string,
    file: File
  ): Promise<ApiResponse<UserStoryAttachmentResponse>> {
    const url = ApiEndpoints.UserStoryAttachment.uploadUserStoryAttachment.withParams({
      projectId,
      userStoryId,
    });
    const formData = new FormData();
    formData.append('file', file);
    return apiService.postFormData<UserStoryAttachmentResponse>(url, formData);
  }

  async getUserStoryAttachments(
    projectId: string,
    userStoryId: string
  ): Promise<ApiResponse<UserStoryAttachment[]>> {
    const url = ApiEndpoints.UserStoryAttachment.getUserStoryAttachments.withParams({
      projectId,
      userStoryId,
    });
    return apiService.get<UserStoryAttachment[]>(url);
  }

  async downloadUserStoryAttachment(
    projectId: string,
    userStoryId: string,
    attachmentId: string
  ): Promise<Blob> {
    const url = ApiEndpoints.UserStoryAttachment.downloadUserStoryAttachment.withParams({
      projectId,
      userStoryId,
      attachmentId,
    });
    const response = await axiosInstance.get<Blob>(url, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteUserStoryAttachment(
    projectId: string,
    userStoryId: string,
    attachmentId: string
  ): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.UserStoryAttachment.deleteUserStoryAttachment.withParams({
      projectId,
      userStoryId,
      attachmentId,
    });
    return apiService.delete<unknown>(url, {
      showSuccessToast: true,
      successMessage: 'Attachment deleted successfully',
    });
  }
}

export const userStoryService = new UserStoryService();
