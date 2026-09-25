import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService, PaginatedApiResponse } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { DashboardData, DashboardActivitiesResponse, UpcomingDeadline } from '@/src/types/dashboard';

class DashboardService {
  async getDashboard(projectId: string, sprintId?: string): Promise<ApiResponse<DashboardData>> {
    const endpoint = ApiEndpoints.Dashboard.getDashboard.withParams(projectId);
    const url = sprintId ? endpoint.withQuery({ sprint_id: sprintId }) : endpoint.url;
    return apiService.get<DashboardData>(url);
  }

  async getRecentActivities(
    page = 1,
    pageSize = 10,
    projectId?: string
  ): Promise<PaginatedApiResponse<DashboardActivitiesResponse>> {
    const queryParams: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
    };
    
    if (projectId) {
      queryParams.project_id = projectId;
    }
    
    const url = ApiEndpoints.Audit.getActivities.withQuery(queryParams);
    return apiService.getPaginated<DashboardActivitiesResponse>(url);
  }

  async getGlobalSearch(
    query: string
  ): Promise<ApiResponse<import('@/src/types/search').GlobalSearchData>> {
    const url = ApiEndpoints.Search.globalSearch.withQuery({
      q: query,
    });

    return apiService.get<import('@/src/types/search').GlobalSearchData>(url, {
      showErrorToast: false,
    });
  }

    async getUpcomingDeadlines(
    projectId: string
  ): Promise<ApiResponse<UpcomingDeadline[]>> {
    const endpoint =
      ApiEndpoints.Dashboard.getUpcomingDeadlines.withParams(projectId);
    return apiService.get<UpcomingDeadline[]>(endpoint.url);
  }
}

export const dashboardService = new DashboardService();
