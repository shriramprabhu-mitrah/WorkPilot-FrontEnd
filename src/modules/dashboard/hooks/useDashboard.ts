import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/src/services/dashboard';

export const useGetDashboard = (projectId: string, sprintId?: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['dashboard', projectId, sprintId ?? 'all'],
    queryFn: () => dashboardService.getDashboard(projectId, sprintId),
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000, // 30 seconds cache
  });

  return {
    dashboard: query.data?.data,
    isLoadingDashboard: query.isLoading,
    isFetchingDashboard: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchDashboard: query.refetch,
  };
};

export const useGetRecentActivities = (page = 1, pageSize = 10, projectId?: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['recentActivities', page, pageSize, projectId],
    queryFn: () => dashboardService.getRecentActivities(page, pageSize, projectId),
    enabled: enabled && !!projectId, // Only fetch when enabled and projectId exists
    staleTime: 30 * 1000, // 30 seconds cache
  });

  return {
    activities: query.data?.data?.activities ?? [],
    activityUser: query.data?.data?.user,
    meta: query.data?.meta,
    isLoadingActivities: query.isLoading,
    isFetchingActivities: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchActivities: query.refetch,
  };
};

export const useGetUpcomingDeadlines = (
  projectId: string,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['upcomingDeadlines', projectId],
    queryFn: () => dashboardService.getUpcomingDeadlines(projectId),
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000, // 30 seconds cache
  });

  return {
    upcomingDeadlines: query.data?.data ?? [],
    isLoadingUpcomingDeadlines: query.isLoading,
    isFetchingUpcomingDeadlines: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchUpcomingDeadlines: query.refetch,
  };
};
// Re-export useGlobalSearch for convenience
export { useGlobalSearch } from '@/src/hooks/useGlobalSearch';
