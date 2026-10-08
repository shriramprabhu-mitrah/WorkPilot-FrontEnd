// src/modules/tasks/hooks/useBoards.ts
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { BoardQueryParams, BoardStory } from '@/src/types/board';
import { boardService } from '@/src/services/boards';

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

export const useGetBoardStatusTasks = (
  projectId: string,
  userStoryId: string,
  statusId: string,
  enabled = true
) => {
  const query = useInfiniteQuery({
    queryKey: ['board-status-tasks', projectId, userStoryId, statusId],
    queryFn: ({ pageParam }) =>
      boardService.getBoard(projectId, {
        user_story_id: userStoryId,
        status_id: statusId,
        page: pageParam,
        page_size: 3,
      }),
    initialPageParam: 2,
    getNextPageParam: (lastPage) => (lastPage.meta?.has_next ? lastPage.meta.page + 1 : undefined),
    // Only activate when the parent explicitly enables it (user has scrolled near bottom)
    enabled: enabled && !!projectId && !!userStoryId && !!statusId,
  });

  const tasks = useMemo(() => {
    return (
      query.data?.pages.flatMap((page) => {
        const story = Array.isArray(page.data) ? page.data[0] : page.data;
        if (!story) {
          return [];
        }
        const status = story.statuses?.find((item) => item.status_id === statusId);
        return status?.tasks ?? [];
      }) ?? []
    );
  }, [query.data, statusId]);

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
