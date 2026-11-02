import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetUserStories, useGetUserStoryStatuses } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetTasks, useGetCustomStatuses } from '@/src/modules/tasks/hooks/useTask';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { useBacklogSection } from './useBacklogSection';
import { SprintStatusTab, toStatusOptions } from '../utils/backlogUtils';

export const SPRINTS_PAGE_SIZE = 7;

interface Perms {
  canViewUserStories: boolean;
  canViewTasks: boolean;
  canViewSprints: boolean;
}

export const useBacklogLists = (projectId: string, perms: Perms) => {
  const enabled = !!projectId;
  const storiesState = useBacklogSection(projectId);
  const tasksState = useBacklogSection(projectId);

  const [sprintStatus, setSprintStatus] = useState<SprintStatusTab>('all');
  const [sprintsSearch, setSprintsSearch] = useState('');
  const [sprintsPage, setSprintsPage] = useState(1);
  const debouncedSprintsSearch = useDebounce(sprintsSearch, 500);
  const [prevProject, setPrevProject] = useState(projectId);
  if (prevProject !== projectId) {
    setPrevProject(projectId);
    setSprintsSearch('');
    setSprintsPage(1);
  }

  // Changing the tab or the search always goes back to page 1
  const handleSetSprintStatus = useCallback((next: SprintStatusTab) => {
    setSprintStatus(next);
    setSprintsPage(1);
  }, []);
  const handleSetSprintsSearch = useCallback((value: string) => {
    setSprintsSearch(value);
    setSprintsPage(1);
  }, []);

  const { userStoryStatuses, isLoadingUserStoryStatuses } = useGetUserStoryStatuses(
    projectId,
    enabled
  );
  const { customStatuses, isLoadingCustomStatuses } = useGetCustomStatuses(projectId, enabled);

  const { userStories, userStoriesMeta, isLoadingUserStories, isFetchingUserStories } =
    useGetUserStories(
      projectId,
      { is_unassigned_story: true, ...storiesState.queryParams },
      enabled && perms.canViewUserStories
    );
  const { tasksList, tasksMeta, isLoadingTasks, isFetchingTasks } = useGetTasks(
    projectId,
    { unassigned_task: true, ...tasksState.queryParams },
    enabled && perms.canViewTasks
  );
  const { sprints, sprintsMeta, isLoadingSprints, isFetchingSprints } = useGetSprints(
    projectId,
    {
      page: sprintsPage,
      page_size: SPRINTS_PAGE_SIZE,
      status: sprintStatus === 'all' ? undefined : sprintStatus,
      search: debouncedSprintsSearch || undefined,
    },
    enabled && perms.canViewSprints,
    true // keep the previous page on screen while the next one loads
  );

  const storyItems = useMemo(() => userStories ?? [], [userStories]);
  const taskItems = useMemo(() => tasksList ?? [], [tasksList]);
  const sprintItems = useMemo(() => sprints ?? [], [sprints]);
  const storyStatusOptions = useMemo(() => toStatusOptions(userStoryStatuses), [userStoryStatuses]);
  const taskStatusOptions = useMemo(() => toStatusOptions(customStatuses), [customStatuses]);

  const sprintsTotal = sprintsMeta?.total_items ?? sprintItems.length;
  const sprintsTotalPages =
    sprintsMeta?.total_pages ?? Math.max(1, Math.ceil(sprintsTotal / SPRINTS_PAGE_SIZE));

  // If the last page empties (a sprint was completed or deleted), step back one page
  if (sprintsPage > sprintsTotalPages) {
    setSprintsPage(sprintsTotalPages);
  }

  return {
    userStoryStatuses,
    stories: {
      ...storiesState,
      items: storyItems,
      meta: userStoriesMeta,
      isLoading: isLoadingUserStories,
      isFetching: isFetchingUserStories,
      statusOptions: storyStatusOptions,
      isLoadingStatuses: isLoadingUserStoryStatuses,
    },
    tasks: {
      ...tasksState,
      items: taskItems,
      meta: tasksMeta,
      isLoading: isLoadingTasks,
      isFetching: isFetchingTasks,
      statusOptions: taskStatusOptions,
      isLoadingStatuses: isLoadingCustomStatuses,
    },
    sprints: {
      items: sprintItems,
      meta: sprintsMeta,
      isLoading: isLoadingSprints,
      isFetching: isFetchingSprints,
      status: sprintStatus,
      setStatus: handleSetSprintStatus,
      search: sprintsSearch,
      setSearch: handleSetSprintsSearch,
      page: sprintsPage,
      setPage: setSprintsPage,
      total: sprintsTotal,
      totalPages: sprintsTotalPages,
    },
  };
};

export type BacklogLists = ReturnType<typeof useBacklogLists>;
export type StoriesSection = BacklogLists['stories'];
export type TasksSection = BacklogLists['tasks'];
export type SprintsSection = BacklogLists['sprints'];
