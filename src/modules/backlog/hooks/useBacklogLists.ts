import { useMemo, useState } from 'react';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetUserStories, useGetUserStoryStatuses } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetTasks, useGetCustomStatuses } from '@/src/modules/tasks/hooks/useTask';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { useBacklogSection } from './useBacklogSection';
import { SprintStatusTab, toStatusOptions } from '../utils/backlogUtils';

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
  const debouncedSprintsSearch = useDebounce(sprintsSearch, 500);
  const [prevProject, setPrevProject] = useState(projectId);
  if (prevProject !== projectId) {
    setPrevProject(projectId);
    setSprintsSearch('');
  }

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
  const { sprints, isLoadingSprints } = useGetSprints(
    projectId,
    {
      status: sprintStatus === 'all' ? undefined : sprintStatus,
      search: debouncedSprintsSearch || undefined,
    },
    enabled && perms.canViewSprints
  );

  const storyItems = useMemo(() => userStories ?? [], [userStories]);
  const taskItems = useMemo(() => tasksList ?? [], [tasksList]);
  const sprintItems = useMemo(() => sprints ?? [], [sprints]);
  const storyStatusOptions = useMemo(() => toStatusOptions(userStoryStatuses), [userStoryStatuses]);
  const taskStatusOptions = useMemo(() => toStatusOptions(customStatuses), [customStatuses]);

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
      isLoading: isLoadingSprints,
      status: sprintStatus,
      setStatus: setSprintStatus,
      search: sprintsSearch,
      setSearch: setSprintsSearch,
    },
  };
};

export type BacklogLists = ReturnType<typeof useBacklogLists>;
export type StoriesSection = BacklogLists['stories'];
export type TasksSection = BacklogLists['tasks'];
export type SprintsSection = BacklogLists['sprints'];
