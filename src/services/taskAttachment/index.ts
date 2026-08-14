import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { TaskAttachment } from '@/src/types/task';
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

    return apiService.postFormData<void>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async listTaskAttachments(
    projectId: string,
    taskId: string
  ): Promise<ApiResponse<TaskAttachment[]>> {
    const url = ApiEndpoints.TaskAttachment.listTaskAttachments.withParams({
      projectId,
      taskId,
    });

    return apiService.get<TaskAttachment[]>(url, {
      showErrorToast: true,
    });
  }

  async downloadTaskAttachment(
    projectId: string,
    taskId: string,
    attachmentId: string
  ): Promise<Blob> {
    const url = ApiEndpoints.TaskAttachment.downloadTaskAttachment.withParams({
      projectId,
      taskId,
      attachmentId,
    });

    return apiService.getBlob(url, {
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
