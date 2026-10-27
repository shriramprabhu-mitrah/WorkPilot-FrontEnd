import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/src/services/search';
import { GlobalSearchData, SearchCategory } from '@/src/types/search';

const emptyData: GlobalSearchData = {
  tasks: [],
  user_stories: [],
  projects: [],
  members: [],
  sprints: [],
};

export const useGlobalSearch = (debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs]);

  const {
    data: responseData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: false,
  });

  const searchData: GlobalSearchData = responseData?.data ?? emptyData;

  const tasks = searchData.tasks ?? [];
  const userStories = searchData.user_stories ?? [];
  const projects = searchData.projects ?? [];
  const members = searchData.members ?? [];
  const sprints = searchData.sprints ?? [];

  const counts = useMemo(() => {
    const meta = responseData?.meta;
    return {
      all: meta?.total ?? 0,
      tasks: meta?.total_tasks ?? 0,
      user_stories: meta?.total_user_stories ?? 0,
      projects: meta?.total_projects ?? 0,
      members: meta?.total_members ?? 0,
      sprints: meta?.total_sprints ?? 0,
    };
  }, [responseData?.meta]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setActiveCategory('all');
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    activeCategory,
    setActiveCategory,
    searchData: {
      tasks,
      user_stories: userStories,
      projects,
      members,
      sprints,
    },
    counts,
    isLoading: isLoading && debouncedQuery.length > 0,
    isFetching,
    isError,
    error,
    clearSearch,
    refetch,
  };
};
