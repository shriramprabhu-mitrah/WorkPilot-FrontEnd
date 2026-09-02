import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/src/services/dashboard';

export const useGetDashboard = (projectId: string, sprintId?: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['dashboard', projectId, sprintId ?? 'all'],
    queryFn: () => dashboardService.getDashboard(projectId, sprintId),
    enabled: enabled && !!projectId,
    staleTime: 0,
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

// Re-export useGlobalSearch for convenience
export { useGlobalSearch } from '@/src/hooks/useGlobalSearch';
