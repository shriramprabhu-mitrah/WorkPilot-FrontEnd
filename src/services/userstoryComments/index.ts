import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { ApiResponse } from '@/src/types/core';
import {
  CreateUserStoryCommentPayload,
  DeleteUserStoryCommentResponse,
  GetUserStoryCommentsQueryParams,
  GetUserStoryRepliesQueryParams,
  UpdateUserStoryCommentPayload,
  UserStoryCommentResponse,
  UserStoryReplyResponse,
} from '@/src/types/userstories';

class UserStoryCommentService {
  async createComment(
    projectId: string,
    userStoryId: string,
    payload: CreateUserStoryCommentPayload
  ): Promise<ApiResponse<UserStoryCommentResponse>> {
    const url = ApiEndpoints.UserStoryComment.createComment.withParams({
      projectId,
      userStoryId,
    });
    return apiService.post<UserStoryCommentResponse>(url, payload);
  }

  async getComments(
    projectId: string,
    userStoryId: string,
    params?: GetUserStoryCommentsQueryParams
  ): Promise<PaginatedApiResponse<UserStoryCommentResponse[]>> {
    const endpoint = ApiEndpoints.UserStoryComment.getComments.withNamedParams({
      projectId,
      userStoryId,
    });
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      searchParams.append('page_size', String(params.page_size));
    }
    const query = searchParams.toString();
    const url = `${endpoint.url}${query ? `?${query}` : ''}`;
    return apiService.getPaginated<UserStoryCommentResponse[]>(url);
  }

  async getCommentById(
    projectId: string,
    userStoryId: string,
    commentId: string
  ): Promise<ApiResponse<UserStoryCommentResponse>> {
    const url = ApiEndpoints.UserStoryComment.getCommentById.withParams({
      projectId,
      userStoryId,
      commentId,
    });
    return apiService.get<UserStoryCommentResponse>(url);
  }

  async getReplies(
    projectId: string,
    userStoryId: string,
    commentId: string,
    params?: GetUserStoryRepliesQueryParams
  ): Promise<PaginatedApiResponse<UserStoryReplyResponse[]>> {
    const endpoint = ApiEndpoints.UserStoryComment.getReplies.withNamedParams({
      projectId,
      userStoryId,
      commentId,
    });
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      searchParams.append('page_size', String(params.page_size));
    }
    const query = searchParams.toString();
    const url = `${endpoint.url}${query ? `?${query}` : ''}`;
    return apiService.getPaginated<UserStoryReplyResponse[]>(url);
  }

  async updateComment(
    projectId: string,
    userStoryId: string,
    commentId: string,
    payload: UpdateUserStoryCommentPayload
  ): Promise<ApiResponse<UserStoryCommentResponse>> {
    const url = ApiEndpoints.UserStoryComment.updateComment.withParams({
      projectId,
      userStoryId,
      commentId,
    });
    return apiService.patch<UserStoryCommentResponse>(url, payload);
  }

  async deleteComment(
    projectId: string,
    userStoryId: string,
    commentId: string
  ): Promise<ApiResponse<DeleteUserStoryCommentResponse>> {
    const url = ApiEndpoints.UserStoryComment.deleteComment.withParams({
      projectId,
      userStoryId,
      commentId,
    });
    return apiService.delete<DeleteUserStoryCommentResponse>(url);
  }

  async uploadCommentAttachment(
    projectUuid: string,
    storyId: string,
    payload: FormData
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.UserStoryComment.uploadCommentAttachment.withParams({
      project_uuid: projectUuid,
      story_id: storyId,
    });
    return apiService.postFormData<void>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async deleteCommentAttachment(
    projectId: string,
    userStoryId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.UserStoryComment.deleteCommentAttachment.withParams({
      projectId,
      userStoryId,
      attachmentId,
    });
    return apiService.delete<void>(url, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async downloadCommentAttachment(
    projectId: string,
    userStoryId: string,
    attachmentId: string
  ): Promise<Blob> {
    const url = ApiEndpoints.UserStoryComment.downloadCommentAttachment.withParams({
      projectId,
      userStoryId,
      attachmentId,
    });
    return apiService.getBlob(url);
  }
}

export const userStoryCommentService = new UserStoryCommentService();
