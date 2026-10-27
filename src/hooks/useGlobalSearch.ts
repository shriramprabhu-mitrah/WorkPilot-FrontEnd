import { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchService } from '@/src/services/search';
import {
  SearchCategory,
  SearchTaskItem,
  SearchUserStoryItem,
  SearchProjectItem,
  SearchMemberItem,
  SearchSprintItem,
} from '@/src/types/search';

const PAGE_SIZE = 10;

type DataCategory = Exclude<SearchCategory, 'all'>;

const DATA_KEYS: DataCategory[] = ['tasks', 'user_stories', 'projects', 'members', 'sprints'];

export type UnifiedSearchResultItem =
  | { itemType: 'task'; data: SearchTaskItem }
  | { itemType: 'user_story'; data: SearchUserStoryItem }
  | { itemType: 'project'; data: SearchProjectItem }
  | { itemType: 'member'; data: SearchMemberItem }
  | { itemType: 'sprint'; data: SearchSprintItem };

const ITEM_TYPE: Record<DataCategory, UnifiedSearchResultItem['itemType']> = {
  tasks: 'task',
  user_stories: 'user_story',
  projects: 'project',
  members: 'member',
  sprints: 'sprint',
};

type SearchPage = Awaited<ReturnType<typeof searchService.globalSearch>>;

// Does this category still have more rows on the server?
function categoryHasMore(pages: SearchPage[], key: DataCategory): boolean {
  const last = pages[pages.length - 1];
  const lastCount = last?.data?.[key]?.length ?? 0;
  if (lastCount < PAGE_SIZE) return false; // short page = no more data

  const loaded = pages.reduce((sum, p) => sum + (p.data?.[key]?.length ?? 0), 0);
  const meta = last?.meta as Record<string, number | undefined> | undefined;
  const total = meta?.[`total_${key}`];
  if (total !== undefined && loaded >= total) return false;

  return true;
}

export const useGlobalSearch = (debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), debounceMs);
    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  const hasQuery = debouncedQuery.length > 0;
  const isCategoryTab = activeCategory !== 'all';

  // "All" tab: infinite, 10 per category per page. Stays enabled so tab counts stay available.
  const allQuery = useInfiniteQuery({
    queryKey: ['globalSearchAll', debouncedQuery, PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      searchService.globalSearch({
        query: debouncedQuery,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (_last, allPages) =>
      DATA_KEYS.some((key) => categoryHasMore(allPages, key)) ? allPages.length + 1 : undefined,
    enabled: hasQuery,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  // Category tabs: infinite, 10 per page
  const categoryQuery = useInfiniteQuery({
    queryKey: ['globalSearchCategory', debouncedQuery, activeCategory, PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      searchService.globalSearch({
        query: debouncedQuery,
        category: activeCategory,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (_last, allPages) =>
      categoryHasMore(allPages, activeCategory as DataCategory) ? allPages.length + 1 : undefined,
    enabled: hasQuery && isCategoryTab,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const activeQuery = isCategoryTab ? categoryQuery : allQuery;

  // One flat, ordered, de-duplicated list (also used for keyboard navigation)
  const flatResults = useMemo((): UnifiedSearchResultItem[] => {
    const pages = activeQuery.data?.pages ?? [];
    const keys = isCategoryTab ? [activeCategory as DataCategory] : DATA_KEYS;
    const seen = new Set<string>();
    const list: UnifiedSearchResultItem[] = [];

    pages.forEach((page) => {
      keys.forEach((key) => {
        const items = (page.data?.[key] as { id: string | number }[] | undefined) ?? [];
        items.forEach((item) => {
          const uid = `${key}-${item.id}`;
          if (seen.has(uid)) return;
          seen.add(uid);
          list.push({ itemType: ITEM_TYPE[key], data: item } as UnifiedSearchResultItem);
        });
      });
    });

    return list;
  }, [activeQuery.data, isCategoryTab, activeCategory]);

  const counts = useMemo(() => {
    const meta = allQuery.data?.pages?.[0]?.meta;
    return {
      all: meta?.total ?? 0,
      tasks: meta?.total_tasks ?? 0,
      user_stories: meta?.total_user_stories ?? 0,
      projects: meta?.total_projects ?? 0,
      members: meta?.total_members ?? 0,
      sprints: meta?.total_sprints ?? 0,
    };
  }, [allQuery.data?.pages]);

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
    flatResults,
    counts,
    isLoading: hasQuery && activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    isError: activeQuery.isError,
    error: activeQuery.error,
    clearSearch,
    refetch: activeQuery.refetch,
    hasNextPage: !!activeQuery.hasNextPage,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
  };
};
