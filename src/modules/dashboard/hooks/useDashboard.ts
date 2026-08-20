import { useQuery } from '@tanstack/react-query';

import { dashboardService } from '@/src/services/dashboard';

export const useGetDashboard = (organizationId: string, sprintId?: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['dashboard', organizationId, sprintId],
    queryFn: () => dashboardService.getDashboard(organizationId, sprintId),
    enabled: enabled && !!organizationId,
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

export const useGetRecentActivities = (page = 1, pageSize = 10, enabled = true) => {
  const query = useQuery({
    queryKey: ['recentActivities', page, pageSize],

    queryFn: () => dashboardService.getRecentActivities(page, pageSize),

    enabled,
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
