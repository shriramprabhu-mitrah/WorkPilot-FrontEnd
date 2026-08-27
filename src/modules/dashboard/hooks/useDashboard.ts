import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

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

// Debounced Global Search Hook
export const useGlobalSearch = (organizationId: string, debounceMs = 500) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, debounceMs]);

  const query = useQuery({
    queryKey: ['globalSearch', organizationId, debouncedQuery],
    queryFn: () => dashboardService.getGlobalSearch(debouncedQuery, organizationId),
    enabled: !!organizationId && debouncedQuery.trim().length >= 2,
    staleTime: 30000, // 30 seconds
  });

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    searchQuery,
    handleSearch,
    clearSearch,
    searchResults: query.data?.data,
    isSearching: query.isFetching,
    isLoadingSearch: query.isLoading,
    hasResults:
      (query.data?.data?.tasks && query.data.data.tasks.length > 0) ||
      (query.data?.data?.projects && query.data.data.projects.length > 0),
    error: query.error,
  };
};
