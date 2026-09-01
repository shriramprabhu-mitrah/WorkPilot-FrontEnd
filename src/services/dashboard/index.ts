import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { DashboardData, DashboardActivitiesResponse } from '@/src/types/dashboard';

class DashboardService {
  async getDashboard(projectId: string, sprintId?: string): Promise<ApiResponse<DashboardData>> {
    const endpoint = ApiEndpoints.Dashboard.getDashboard.withParams(projectId);
    const url = sprintId ? endpoint.withQuery({ sprint_id: sprintId }) : endpoint.url;
    return apiService.get<DashboardData>(url);
  }

  async getRecentActivities(
    page = 1,
    pageSize = 10
  ): Promise<PaginatedApiResponse<DashboardActivitiesResponse>> {
    const url = ApiEndpoints.Audit.getActivities.withQuery({
      page: String(page),
      page_size: String(pageSize),
    });
    return apiService.getPaginated<DashboardActivitiesResponse>(url);
  }

  async getGlobalSearch(
    query: string,
    organizationId: string
  ): Promise<ApiResponse<{ tasks: string[]; projects: string[] }>> {
    const url = ApiEndpoints.Dashboard.globalSearch.withQuery({
      q: query,
      organization_id: organizationId,
    });

    return apiService.get<{ tasks: string[]; projects: string[] }>(url);
  }
}

export const dashboardService = new DashboardService();
