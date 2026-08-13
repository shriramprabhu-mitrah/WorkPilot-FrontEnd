import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';

class CommentAttachmentService {
  async uploadCommentAttachment(
    taskId: string,
    commentId: string,
    payload: FormData
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.CommentAttachment.uploadCommentAttachment.withParams({
      taskId,
      commentId,
    });

    return apiService.post<void>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async listCommentAttachments(taskId: string, commentId: string): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.CommentAttachment.listCommentAttachments.withParams({
      taskId,
      commentId,
    });

    return apiService.get<void>(url, {
      showErrorToast: true,
    });
  }

  async downloadCommentAttachment(
    taskId: string,
    commentId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.CommentAttachment.downloadCommentAttachment.withParams({
      taskId,
      commentId,
      attachmentId,
    });

    return apiService.get<void>(url, {
      showErrorToast: true,
    });
  }

  async deleteCommentAttachment(
    taskId: string,
    commentId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.CommentAttachment.deleteCommentAttachment.withParams({
      taskId,
      commentId,
      attachmentId,
    });

    return apiService.delete<void>(url, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }
}

export const commentAttachmentService = new CommentAttachmentService();
