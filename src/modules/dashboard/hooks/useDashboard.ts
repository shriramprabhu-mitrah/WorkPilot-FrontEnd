import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/src/services/dashboard';
import { WeeklyProgressParams } from '@/src/types/dashboard';

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

export const useGetRecentActivities = (
  page = 1,
  pageSize = 10,
  projectId?: string,
  sprintId?: string,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['recentActivities', page, pageSize, projectId, sprintId],
    queryFn: () => dashboardService.getRecentActivities(page, pageSize, projectId, sprintId),
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000,
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

export const useGetUpcomingDeadlines = (projectId: string, sprintId?: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['upcomingDeadlines', projectId, sprintId],
    queryFn: () => dashboardService.getUpcomingDeadlines(projectId, sprintId),
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000,
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

export const useGetTeamWorkload = (projectId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['teamWorkload', projectId],
    queryFn: () => dashboardService.getTeamWorkload(projectId),
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000,
  });
  return {
    teamWorkload: query.data?.data ?? [],
    isLoadingTeamWorkload: query.isLoading,
    isFetchingTeamWorkload: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchTeamWorkload: query.refetch,
  };
};

export const useGetSprintBurndown = (
  projectId: string,
  sprintId?: string,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['sprintBurndown', projectId, sprintId ?? 'all'],
    queryFn: () => dashboardService.getSprintBurndown(projectId, sprintId),
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000,
  });
  return {
    sprintBurndown: query.data?.data?.sprint_burndown ?? [],
    isLoadingSprintBurndown: query.isLoading,
    isFetchingSprintBurndown: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchSprintBurndown: query.refetch,
  };
};

export const useGetWeeklyProgress = (
  projectId: string,
  params: WeeklyProgressParams = {},
  enabled = true,
) => {
  const query = useQuery({
    queryKey: ['weeklyProgress', projectId, params],
    queryFn: () => dashboardService.getWeeklyProgress(projectId, params),
    enabled: enabled && Boolean(projectId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    weeklyProgress: query.data?.data,
    isLoadingWeeklyProgress: query.isLoading,
    isFetchingWeeklyProgress: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchWeeklyProgress: query.refetch,
  };
};

// Re-export useGlobalSearch for convenience
export { useGlobalSearch } from '@/src/hooks/useGlobalSearch';
