import { userStoryService } from '@/src/services/userstory';
import {
  CreateUserStoryStatusPayload,
  GetUserStoriesQueryParams,
  ReorderUserStoriesPayload,
  UpdateUserStoryPayload,
  UpdateUserStoryStatusPayload,
  UserStoryPayload,
} from '@/src/types/userstories';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

export const useGetUserStories = (
  projectId: string,
  params?: GetUserStoriesQueryParams,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['user-stories', projectId, params],
    queryFn: () => userStoryService.getUserStories(projectId, params),
    enabled: enabled && !!projectId,
  });
  return {
    userStories: query.data?.data ?? [],
    isLoadingUserStories: query.isLoading,
    isFetchingUserStories: query.isFetching,
    isErrorUserStories: query.isError,
    error: query.error,
    refetchUserStories: query.refetch,
  };
};

const SPRINT_PAGE_SIZE = 5;

export const useGetSprintUserStories = (
  projectId: string,
  sprintId: string,
  enabled = true
) => {
  const query = useInfiniteQuery({
    queryKey: ['sprint-user-stories', projectId, sprintId],
    queryFn: ({ pageParam = 1 }) =>
      userStoryService.getUserStories(projectId, {
        sprint_id: sprintId,
        page: pageParam,
        page_size: SPRINT_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const items = lastPage?.data ?? [];
      // If no items returned or less than page size, no more pages exist
      if (items.length === 0 || items.length < SPRINT_PAGE_SIZE) {
        return undefined;
      }
      const meta = lastPage?.meta;
      if (meta) {
        const hasNext = meta.has_next ?? meta.has_next_page ?? meta.hasNextPage;
        if (hasNext === false) return undefined;
        const totalPages = meta.total_pages ?? meta.totalPages;
        const currentPage = meta.page ?? allPages.length;
        if (totalPages && Number(currentPage) >= Number(totalPages)) return undefined;
        return Number(currentPage) + 1;
      }
      return allPages.length + 1;
    },
    enabled: enabled && !!projectId && !!sprintId,
  });

  const allUserStories = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const totalItems = query.data?.pages[0]?.meta?.total_items ?? query.data?.pages[0]?.meta?.totalItems;

  return {
    userStories: allUserStories,
    totalItems,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: query.fetchNextPage,
    isError: query.isError,
    error: query.error,
  };
};
export const useCreateUserStory = (projectId: string) => {
  const mutation = useMutation({
    mutationFn: (payload: UserStoryPayload) => userStoryService.createUserStory(projectId, payload),
  });
  return {
    createUserStory: mutation.mutate,
    createUserStoryAsync: mutation.mutateAsync,
    isCreatingUserStory: mutation.isPending,
    createUserStoryError: mutation.error,
  };
};

export const useGetUserStoryById = (projectId: string, userStoryId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['user-story', projectId, userStoryId],
    queryFn: () => userStoryService.getUserStoryById(projectId, userStoryId),
    enabled: enabled && !!projectId && !!userStoryId,
  });
  return {
    userStory: query.data?.data,
    isLoadingUserStory: query.isLoading,
    isFetchingUserStory: query.isFetching,
    refetchUserStory: query.refetch,
    error: query.error,
    isError: query.isError,
  };
};

export const useUpdateUserStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      userStoryId,
      payload,
    }: {
      projectId: string;
      userStoryId: string;
      payload: UpdateUserStoryPayload;
    }) => userStoryService.updateUserStory(projectId, userStoryId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-story', variables.projectId, variables.userStoryId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-stories', variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['sprint-user-stories', variables.projectId],
      });
    },
  });
};

export const useDeleteUserStory = () => {
  return useMutation({
    mutationFn: ({ projectId, userStoryId }: { projectId: string; userStoryId: string }) =>
      userStoryService.deleteUserStory(projectId, userStoryId),
  });
};

export const useReorderUserStories = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: ReorderUserStoriesPayload;
    }) => userStoryService.reorderUserStories(projectId, payload),
  });
};

// Get User Story statuses
export const useGetUserStoryStatuses = (projectId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['user-story-statuses', projectId],
    queryFn: () => userStoryService.getUserStoryStatuses(projectId),
    enabled: enabled && !!projectId,
  });

  return {
    userStoryStatuses: query.data?.data ?? [],
    isLoadingUserStoryStatuses: query.isLoading,
    isFetchingUserStoryStatuses: query.isFetching,
    isErrorUserStoryStatuses: query.isError,
    userStoryStatusesError: query.error,
    refetchUserStoryStatuses: query.refetch,
  };
};

// Create User Story status
export const useCreateUserStoryStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateUserStoryStatusPayload;
    }) => userStoryService.createUserStoryStatus(projectId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-statuses', variables.projectId],
      });
    },
  });

  return {
    createUserStoryStatus: mutation.mutate,
    createUserStoryStatusAsync: mutation.mutateAsync,
    isCreatingUserStoryStatus: mutation.isPending,
    createUserStoryStatusError: mutation.error,
  };
};

// Update User Story status
export const useUpdateUserStoryStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      projectId,
      statusId,
      payload,
    }: {
      projectId: string;
      statusId: string;
      payload: UpdateUserStoryStatusPayload;
    }) => userStoryService.updateUserStoryStatus(projectId, statusId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-statuses', variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-stories', variables.projectId],
      });
    },
  });

  return {
    updateUserStoryStatus: mutation.mutate,
    updateUserStoryStatusAsync: mutation.mutateAsync,
    isUpdatingUserStoryStatus: mutation.isPending,
    updateUserStoryStatusError: mutation.error,
  };
};

// Delete User Story status
export const useDeleteUserStoryStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ projectId, statusId }: { projectId: string; statusId: string }) =>
      userStoryService.deleteUserStoryStatus(projectId, statusId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-statuses', variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-stories', variables.projectId],
      });
    },
  });

  return {
    deleteUserStoryStatus: mutation.mutate,
    deleteUserStoryStatusAsync: mutation.mutateAsync,
    isDeletingUserStoryStatus: mutation.isPending,
    deleteUserStoryStatusError: mutation.error,
  };
};

// Option A - Change User Story status
export const useChangeUserStoryStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      projectId,
      userStoryId,
      statusId,
    }: {
      projectId: string;
      userStoryId: string;
      statusId: string;
    }) => userStoryService.changeUserStoryStatus(projectId, userStoryId, { status_id: statusId }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-story', variables.projectId, variables.userStoryId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-stories', variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ['sprint-user-stories', variables.projectId],
      });
    },
  });

  return {
    changeUserStoryStatus: mutation.mutate,
    changeUserStoryStatusAsync: mutation.mutateAsync,
    isChangingUserStoryStatus: mutation.isPending,
    changeUserStoryStatusError: mutation.error,
  };
};
