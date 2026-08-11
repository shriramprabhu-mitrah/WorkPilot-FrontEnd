import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { Label, LabelListItem, CreateLabelPayload, UpdateLabelPayload } from '@/src/types/label';

class LabelService {
  async getLabels(projectId: string): Promise<ApiResponse<LabelListItem[]>> {
    const endpoint = ApiEndpoints.Label.getLabels.withNamedParams({
      projectId,
    });

    return apiService.get<LabelListItem[]>(endpoint.url);
  }
  async createLabel(projectId: string, payload: CreateLabelPayload): Promise<ApiResponse<Label>> {
    const url = ApiEndpoints.Label.createLabel.withParams({
      projectId,
    });

    return apiService.post<Label>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Label created successfully',
    });
  }

  async updateLabel(
    projectId: string,
    labelId: string,
    payload: UpdateLabelPayload
  ): Promise<ApiResponse<Label>> {
    const url = ApiEndpoints.Label.updateLabel.withParams({
      projectId,
      labelId,
    });

    return apiService.patch<Label>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Label updated successfully',
    });
  }

  async deleteLabel(projectId: string, labelId: string): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Label.deleteLabel.withParams({
      projectId,
      labelId,
    });

    return apiService.delete<unknown>(url, {
      showSuccessToast: true,
      successMessage: 'Label deleted successfully',
    });
  }
}

export const labelService = new LabelService();
