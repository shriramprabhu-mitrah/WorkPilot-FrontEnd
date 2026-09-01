import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { SprintDetail, SprintPayload, UpdateSprintPayload } from '@/src/types/project';
import { StartSprintPayload } from '@/src/modules/sprint/types/sprint';
class SprintService {
  async getSprints(
    projectId: string,
    params?: {
      page?: number;
      page_size?: number;
      status?: string;
      search?: string;
      sort_by?: string;
      sort_order?: 'ASC' | 'DESC';
      fields?: string;
    }
  ): Promise<ApiResponse<SprintDetail[]>> {
    const endpoint = ApiEndpoints.Sprint.getSprints.withNamedParams({ projectId });
    const url = params ? endpoint.withQuery(params) : endpoint.url;
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

  async startSprint(
    projectId: string,
    sprintId: string,
    payload: StartSprintPayload
  ): Promise<ApiResponse<SprintDetail>> {
    const endpoint = ApiEndpoints.Sprint.startSprint.withNamedParams({
      projectId,
    });

    const url = endpoint.withQuery({
      sprint_id: sprintId,
    });

    return apiService.post<SprintDetail>(url, payload, {
      showSuccessToast: true,
      successMessage: 'Sprint started successfully',
    });
  }

  async completeSprint(projectId: string, sprintId: string): Promise<ApiResponse<unknown>> {
    const endpoint = ApiEndpoints.Sprint.completeSprint.withNamedParams({
      projectId,
    });

    const url = endpoint.withQuery({
      sprint_id: sprintId,
    });

    return apiService.post<unknown>(url, undefined, {
      showSuccessToast: true,
      successMessage: 'Sprint completed successfully',
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
