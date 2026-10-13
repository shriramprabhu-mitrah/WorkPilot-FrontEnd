import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { BoardQueryParams, BoardStory, BoardStatusColumn } from '@/src/types/board';
import { boardService } from '@/src/services/boards';

const STORYLESS_IDS = ['direct-sprint-tasks', 'no-story'];

type BoardPageData = BoardStory | BoardStory[] | BoardStatusColumn[];

export type BoardPageFilters = Pick<
  BoardQueryParams,
  'sprint_id' | 'priority' | 'task_assignee_id' | 'type' | 'task_status_id'
>;

export const useGetBoard = (projectId: string, params: BoardQueryParams = {}, enabled = true) => {
  const { page: _page, ...filterParams } = params;

  const query = useInfiniteQuery({
    queryKey: ['board', projectId, filterParams],
    queryFn: ({ pageParam }) =>
      boardService.getBoard(projectId, {
        ...filterParams,
        page: pageParam,
        page_size: filterParams.page_size ?? 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta?.has_next ? lastPage.meta.page + 1 : undefined),
    enabled: !!projectId && enabled,
  });

  const boardStories: BoardStory[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [query.data]
  );
  return {
    boardStories,
    isLoadingBoard: query.isLoading,
    isFetchingBoard: query.isFetching,
    refetchBoard: query.refetch,
    fetchNextBoardPage: query.fetchNextPage,
    hasNextBoardPage: !!query.hasNextPage,
    isFetchingNextBoardPage: query.isFetchingNextPage,
  };
};

const getStatusColumn = (
  data: BoardPageData | undefined,
  statusId: string
): BoardStatusColumn | undefined => {
  if (!data) return undefined;
  const items = (Array.isArray(data) ? data : [data]) as Array<BoardStory | BoardStatusColumn>;
  for (const item of items) {
    if ('statuses' in item && Array.isArray(item.statuses)) {
      const col = item.statuses.find((c) => c.status_id === statusId);
      if (col) return col;
    } else if ('status_id' in item && (item as BoardStatusColumn).status_id === statusId) {
      return item as BoardStatusColumn;
    }
  }
  return undefined;
};

export const useGetBoardStatusTasks = (
  projectId: string,
  userStoryId: string,
  statusId: string,
  enabled = true,
  filters: BoardPageFilters = {}
) => {
  const isStoryless = STORYLESS_IDS.includes(userStoryId);

  const query = useInfiniteQuery({
    queryKey: ['board-status-tasks', projectId, userStoryId, statusId, filters],
    queryFn: ({ pageParam }) =>
      boardService.getBoard(projectId, {
        ...filters,
        ...(isStoryless ? { storyless_tasks: true } : { user_story_id: userStoryId }),
        status_id: statusId,
        page: pageParam,
        page_size: 3,
        tasks_per_status: 3,
      }),
    initialPageParam: 2,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const col = getStatusColumn(lastPage.data as BoardPageData, statusId);
      const hasNext = lastPage.meta?.has_next ?? col?.meta?.has_next ?? false;
      return hasNext ? (lastPageParam as number) + 1 : undefined;
    },
    enabled: enabled && !!projectId && !!userStoryId && !!statusId,
  });

  const tasks = useMemo(
    () =>
      query.data?.pages.flatMap(
        (page) => getStatusColumn(page.data as BoardPageData, statusId)?.tasks ?? []
      ) ?? [],
    [query.data, statusId]
  );

  return {
    tasks,
    isLoadingTasks: query.isLoading,
    isFetchingTasks: query.isFetching,
    isFetchingNextTasks: query.isFetchingNextPage,
    fetchNextTasks: query.fetchNextPage,
    hasNextTasks: !!query.hasNextPage,
    refetchTasks: query.refetch,
  };
};
