import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';

class TaskAttachmentService {
  async uploadTaskAttachment(
    projectId: string,
    taskId: string,
    payload: FormData
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.TaskAttachment.uploadTaskAttachment.withParams({
      projectId,
      taskId,
    });

    return apiService.post<void>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async listTaskAttachments(projectId: string, taskId: string): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.TaskAttachment.listTaskAttachments.withParams({
      projectId,
      taskId,
    });

    return apiService.get<void>(url, {
      showErrorToast: true,
    });
  }

  async downloadTaskAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.TaskAttachment.downloadTaskAttachment.withParams({
      projectId,
      taskId,
      attachmentId,
    });

    return apiService.get<void>(url, {
      showErrorToast: true,
    });
  }

  async deleteTaskAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string
  ): Promise<ApiResponse<void>> {
    const url = ApiEndpoints.TaskAttachment.deleteTaskAttachment.withParams({
      projectId,
      taskId,
      attachmentId,
    });

    return apiService.delete<void>(url, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }
}

export const taskAttachmentService = new TaskAttachmentService();
