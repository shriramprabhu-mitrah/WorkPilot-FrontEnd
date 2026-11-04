'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { FilterState } from '@/src/app/components/common/filter-panel';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useGetLabels } from '@/src/modules/project/hooks/useLabels';
import { taskTypeOptions } from '@/src/app/components/common/enum';
import { BoardQueryParams } from '@/src/types/board';
import { type BoardPageFilters } from '@/src/modules/boards/hooks/useBoards';
import { logger } from '@/src/lib/utils/logger';

interface UseBoardFiltersProps {
  selectedProject: string;
  selectedSprint: string;
}

export const useBoardFilters = ({ selectedProject, selectedSprint }: UseBoardFiltersProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    labels: [],
    types: [],
    statuses: [],
  });
  const [assigneeIdFilter, setAssigneeIdFilter] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterMemberSearch, setFilterMemberSearch] = useState('');
  const debouncedFilterMemberSearch = useDebounce(filterMemberSearch, 500);

  useOutsideClick(filterRef, () => setShowFilter(false));

  // Fetch project members for outer avatar display (always fetch all members, no search)
  const { members: displayMembers } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 50,
      name: '',
    },
    true
  );

  // Fetch project members for assignee filtering with search
  const {
    members: filterMembers,
    isLoadingMembers: isLoadingFilterMembers,
    isFetchingMembers: isFetchingFilterMembers,
  } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 50,
      name: debouncedFilterMemberSearch,
    },
    showFilter
  );

  // Fetch labels for filtering
  const { data: labelsResponse } = useGetLabels(selectedProject);

  const allLabels = useMemo(() => {
    return labelsResponse?.data || [];
  }, [labelsResponse]);

  const allTypes = useMemo(() => {
    return taskTypeOptions.map((option) => option.label);
  }, []);

  // Derive unique assignees from filter members search results
  const allAssignees = useMemo(() => {
    if (!filterMembers || filterMembers.length === 0) return [];

    return filterMembers
      .map((m) => ({
        name: m.full_name || m.user?.full_name || '',
        color: m.color ?? null,
      }))
      .filter((assignee) => assignee.name !== '')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filterMembers]);

  const labelIdFilter = useMemo(() => {
    if (filters.labels.length === 0) return [];
    const ids = filters.labels
      .map((value) => {
        const label = allLabels.find(
          (l: { id: string; name: string }) => l.id === value || l.name === value
        );
        return label?.id;
      })
      .filter((id): id is string => !!id);
    return Array.from(new Set(ids));
  }, [filters.labels, allLabels]);

  // Map assignee names to IDs
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);

      const assigneeIds = newFilters.assignees
        .map((assigneeName) => {
          const member = filterMembers?.find((m) => {
            const name = m.full_name || m.user?.full_name || '';
            return name === assigneeName;
          });
          return member?.user_id || member?.user?.id || member?.id;
        })
        .filter((id): id is string => !!id);

      setAssigneeIdFilter(assigneeIds);
    },
    [filterMembers]
  );

  // Toggle assignee filter
  const toggleAssigneeFilter = useCallback((memberId: string, memberName: string) => {
    logger.log('Toggle assignee filter:', { memberId, memberName });
    setAssigneeIdFilter((prevIds) => {
      const isSelected = prevIds.includes(memberId);
      return isSelected ? prevIds.filter((id) => id !== memberId) : [...prevIds, memberId];
    });

    setFilters((prevFilters) => {
      const isSelected = prevFilters.assignees.includes(memberName);
      const newAssigneeNames = isSelected
        ? prevFilters.assignees.filter((name) => name !== memberName)
        : [...prevFilters.assignees, memberName];
      return { ...prevFilters, assignees: newAssigneeNames };
    });
  }, []);

  // Handle assignee search in filter panel
  const handleAssigneeSearch = useCallback((search: string) => {
    setFilterMemberSearch(search);
  }, []);

  const hasActiveFilter =
    filters.priorities.length > 0 ||
    assigneeIdFilter.length > 0 ||
    filters.labels.length > 0 ||
    filters.types.length > 0 ||
    filters.statuses.length > 0;

  const sharedFilterParams = useMemo(() => {
    const p: Partial<BoardQueryParams> = {};
    if (selectedSprint) p.sprint_id = selectedSprint;
    if (filters.priorities.length > 0)
      p.priority = filters.priorities.map((v) => v.toLowerCase()).join(',');
    if (assigneeIdFilter.length > 0) p.task_assignee_id = assigneeIdFilter.join(',');
    if (labelIdFilter.length > 0) p.label_id = labelIdFilter.join(',');
    if (filters.types.length > 0) p.type = filters.types.map((v) => v.toLowerCase()).join(',');
    if (filters.statuses.length > 0) p.task_status_id = filters.statuses.join(',');
    return p;
  }, [
    selectedSprint,
    filters.priorities,
    filters.types,
    filters.statuses,
    assigneeIdFilter,
    labelIdFilter,
  ]);

  const boardQueryParams = useMemo<BoardQueryParams>(
    () => ({
      page_size: 50,
      tasks_per_status: 3,
      ...sharedFilterParams,
    }),
    [sharedFilterParams]
  );

  // Filters passed to per-status "load more" calls
  const pageFilters = useMemo<BoardPageFilters>(
    () => ({
      sprint_id: boardQueryParams.sprint_id,
      priority: boardQueryParams.priority,
      task_assignee_id: boardQueryParams.task_assignee_id,
      task_label_id: boardQueryParams.label_id,
      type: boardQueryParams.type,
      task_status_id: boardQueryParams.task_status_id,
    }),
    [boardQueryParams]
  );

  // Storyless tasks query params
  const storylessQueryParams = useMemo<BoardQueryParams>(
    () => ({
      page_size: 50,
      tasks_per_status: 3,
      storyless_tasks: true,
      ...sharedFilterParams,
    }),
    [sharedFilterParams]
  );

  return {
    showFilter,
    setShowFilter,
    filterRef,
    filters,
    assigneeIdFilter,
    labelIdFilter,
    displayMembers,
    filterMembers,
    isLoadingFilterMembers,
    isFetchingFilterMembers,
    allLabels,
    allTypes,
    allAssignees,
    handleFilterChange,
    toggleAssigneeFilter,
    handleAssigneeSearch,
    hasActiveFilter,
    boardQueryParams,
    pageFilters,
    storylessQueryParams,
  };
};
