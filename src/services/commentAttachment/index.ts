import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';

class CommentAttachmentService {
  async uploadCommentAttachment(taskUuid: string, payload: FormData): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.CommentAttachment.uploadCommentAttachment.withParams({
      task_uuid: taskUuid,
    });

    return apiService.postFormData<void>(url, payload, {
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
  ): Promise<ApiResponse<Blob>> {
    const url = ApiEndpoints.CommentAttachment.downloadCommentAttachment.withParams({
      taskId,
      commentId,
      attachmentId,
    });

    return apiService.get<Blob>(url, {
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

  async downloadAttachment(projectId: string, taskId: string, attachmentId: string): Promise<Blob> {
    const url = ApiEndpoints.CommentAttachment.downloadAttachment.withParams({
      projectId,
      taskId,
      attachmentId,
    });
    return apiService.getBlob(url);
  }
}

export const commentAttachmentService = new CommentAttachmentService();
