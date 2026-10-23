import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from '@/src/hooks/useDebounce';
import { BacklogFilters, EMPTY_BACKLOG_FILTERS } from '../components/backlogFilter';

export const useBacklogSection = (resetKey: string, pageSize = 6) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<BacklogFilters>(EMPTY_BACKLOG_FILTERS);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const debouncedSearch = useDebounce(search, 500);

  // Reset during render when the project changes (avoids set-state-in-effect)
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setSearch('');
    setFilters(EMPTY_BACKLOG_FILTERS);
    setPage(1);
  }

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);
  const onFilters = useCallback((next: BacklogFilters) => {
    setFilters(next);
    setPage(1);
  }, []);
  const onSort = useCallback(() => {
    setSortOrder((prev) => (prev === 'DESC' ? 'ASC' : 'DESC'));
    setPage(1);
  }, []);

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: debouncedSearch || undefined,
      sort_order: sortOrder,
      status_id: filters.statuses.length ? filters.statuses.join(',') : undefined,
      priority: filters.priorities.length ? filters.priorities.join(',') : undefined,
    }),
    [page, pageSize, debouncedSearch, sortOrder, filters]
  );

  return {
    search,
    onSearch,
    debouncedSearch,
    filters,
    onFilters,
    page,
    onPage: setPage,
    pageSize,
    sortOrder,
    onSort,
    queryParams,
  };
};
