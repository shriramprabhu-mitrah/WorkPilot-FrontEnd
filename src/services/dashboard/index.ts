import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { DashboardData, DashboardActivitiesResponse } from '@/src/types/dashboard';

class DashboardService {
  async getDashboard(
    organizationId: string,
    sprintId?: string
  ): Promise<ApiResponse<DashboardData>> {
    const url = ApiEndpoints.Dashboard.getDashboard.withParams(organizationId).withQuery({
      sprint_id: sprintId ?? '',
    });

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
}

export const dashboardService = new DashboardService();
