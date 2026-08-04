import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { SprintDetail, SprintPayload, UpdateSprintPayload } from '@/src/types/project';

class SprintService {
  async getSprints(projectId: string): Promise<ApiResponse<SprintDetail[]>> {
    const url = ApiEndpoints.Sprint.getSprints.withParams({ projectId });
    return apiService.get<SprintDetail[]>(url);
  }

  async createSprint(
    projectId: string,
    payload: SprintPayload
  ): Promise<ApiResponse<SprintDetail[]>> {
    const url = ApiEndpoints.Sprint.createSprint.withParams({ projectId });
    return apiService.post<SprintDetail[]>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Sprint created successfully',
    });
  }

  async getSprintById(projectId: string, sprintId: string): Promise<ApiResponse<SprintDetail>> {
    const url = ApiEndpoints.Sprint.getSprintById.withParams({ projectId, sprintId });
    return apiService.get<SprintDetail>(url);
  }

  async updateSprint(
    projectId: string,
    sprintId: string,
    payload: UpdateSprintPayload
  ): Promise<ApiResponse<SprintDetail>> {
    const url = ApiEndpoints.Sprint.updateSprint.withParams({ projectId, sprintId });
    return apiService.patch<SprintDetail>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Sprint updated successfully',
    });
  }

  async deleteSprint(projectId: string, sprintId: string): Promise<ApiResponse<unknown>> {
    const url = ApiEndpoints.Sprint.deleteSprint.withParams({ projectId, sprintId });
    return apiService.delete<unknown>(url, undefined, {
      showSuccessToast: true,
      successMessage: 'Sprint deleted successfully',
    });
  }
}

export const sprintService = new SprintService();
