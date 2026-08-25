import { useMemo } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { taskService } from '@/src/services/tasks';

import {
  BulkUpdateTasksPayload,
  ClonePayload,
  GetTasksQueryParams,
  TaskPayload,
  UpdateTaskPayload,
} from '@/src/types/task';
const QUERY_KEYS = {
  tasks: 'tasks',
  task: 'task',
  userStory: 'user-story',
  userStories: 'user-stories',
  storyRelationship: 'task-story-relationship',
};

export const useGetTasks = (projectId: string, params?: GetTasksQueryParams, enabled = true) => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.tasks, projectId, params],
    queryFn: () => taskService.getTasks(projectId, params),
    enabled: enabled && !!projectId,
  });
  return {
    tasksList: query.data?.data,
    // pagination: query.data?.pagination,
    isLoadingTasks: query.isPending,
    isFetchingTasks: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetchTasks: query.refetch,
  };
};

const SPRINT_PAGE_SIZE = 5;

export const useGetSprintOrphanTasks = (projectId: string, sprintId: string, enabled = true) => {
  const query = useInfiniteQuery({
    queryKey: ['sprint-orphan-tasks', projectId, sprintId],
    queryFn: ({ pageParam = 1 }) =>
      taskService.getTasks(projectId, {
        sprint_id: sprintId,
        user_story_id: null,
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

  const allTasks = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const totalItems =
    query.data?.pages[0]?.meta?.total_items ?? query.data?.pages[0]?.meta?.totalItems;

  return {
    tasks: allTasks,
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

const PAGE_SIZE_CHILD = 4;

export const useGetChildTasks = (projectId: string, userStoryId: string, enabled = true) => {
  const query = useInfiniteQuery({
    queryKey: [QUERY_KEYS.tasks, projectId, 'child', userStoryId],
    queryFn: ({ pageParam = 1 }) =>
      taskService.getTasks(projectId, {
        page: pageParam as number,
        page_size: PAGE_SIZE_CHILD,
        user_story_id: userStoryId,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const items = (lastPage as { data?: unknown[] })?.data ?? [];

      // If the server returned fewer items than we asked for, we've
      // reached the end — don't fetch further.
      if (items.length < PAGE_SIZE_CHILD) {
        return undefined;
      }
      return allPages.length + 1;
    },
    enabled: enabled && !!projectId && !!userStoryId,
  });

  const tasks = useMemo(
    () => query.data?.pages.flatMap((p) => (p as { data?: unknown[] })?.data ?? []) ?? [],
    [query.data]
  );

  // Try to read a real total from common response shapes; fall back to
  // "how many we've loaded so far" if the API doesn't expose one.
  const total = useMemo(() => {
    const firstPage = query.data?.pages[0] as
      { count?: number; pagination?: { total?: number; total_count?: number } } | undefined;

    return (
      firstPage?.count ??
      firstPage?.pagination?.total ??
      firstPage?.pagination?.total_count ??
      tasks.length
    );
  }, [query.data, tasks.length]);

  return {
    childTasks: tasks,
    totalChildTasks: total,
    isLoadingChildTasks: query.isPending,
    isFetchingChildTasks: query.isFetching,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetchChildTasks: query.refetch,
  };
};

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: TaskPayload) => taskService.createTask(projectId, payload),
    onSuccess: (_, variables) => {
      // Invalidate all task queries for this project
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, projectId],
        exact: false,
      });

      // If task was created under a user story, invalidate user story and task-story-relationship queries
      if (variables.user_story_id) {
        // Invalidate the specific user story to refresh its tasks array
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.userStory, projectId, variables.user_story_id],
        });

        // Also invalidate the user stories list to update counters
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.userStories, projectId],
        });

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.storyRelationship, projectId, variables.user_story_id],
        });
      }
    },
  });
  return {
    createTask: mutation.mutate,
    createTaskAsync: mutation.mutateAsync,
    isCreatingTask: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useGetTaskById = (projectId?: string, taskId?: string) => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.task, projectId, taskId],
    queryFn: () => taskService.getTaskById(projectId!, taskId!),
    enabled: !!projectId && !!taskId,
  });
  return {
    task: query.data?.data,
    isLoadingTask: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchTask: query.refetch,
  };
};

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (taskIds: string[]) => taskService.deleteTask(projectId, taskIds),
    onSuccess: (_, taskIds) => {
      // Invalidate all task queries for this project
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, projectId],
      });

      // Invalidate user stories to update task counts and lists
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.userStories, projectId],
      });

      // Invalidate all user story details (we don't know which specific ones were affected)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.userStory, projectId],
        exact: false,
      });

      // Invalidate task-story-relationship queries (covers all user stories)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.storyRelationship, projectId],
      });

      // Remove individual task queries
      taskIds.forEach((taskId) => {
        queryClient.removeQueries({
          queryKey: [QUERY_KEYS.task, projectId, taskId],
        });
      });
    },
  });

  return {
    deleteTask: mutation.mutate,
    deleteTaskAsync: mutation.mutateAsync,
    isDeletingTask: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      projectId,
      taskId,
      payload,
    }: {
      projectId: string;
      taskId: string;
      payload: UpdateTaskPayload;
    }) => taskService.updateTask(projectId, taskId, payload),
    onSuccess: (_, variables) => {
      // Invalidate task queries for this project
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });

      // Invalidate the specific task
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.task, variables.projectId, variables.taskId],
      });

      // Invalidate the specific sprint's orphan tasks if sprint_id is present
      if (variables.payload.sprint_id) {
        queryClient.invalidateQueries({
          queryKey: ['sprint-orphan-tasks', variables.projectId, variables.payload.sprint_id],
        });
      }

      // Only invalidate user story related queries when user_story_id is explicitly changed
      if (variables.payload.user_story_id) {
        queryClient.invalidateQueries({
          queryKey: ['user-stories', variables.projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ['user-story', variables.projectId, variables.payload.user_story_id],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'task-story-relationship',
            variables.projectId,
            variables.payload.user_story_id,
          ],
        });
      }
    },
  });
  return {
    updateTask: mutation.mutate,
    updateTaskAsync: mutation.mutateAsync,
    isUpdatingTask: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useCloneTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      projectId,
      taskId,
      payload,
    }: {
      projectId: string;
      taskId: string;
      payload: ClonePayload;
    }) => taskService.cloneTask(projectId, taskId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });
      // Invalidate user stories to update task counts and lists
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.userStories, variables.projectId],
      });

      // Invalidate all user story details (we don't know which specific ones were affected)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.userStory, variables.projectId],
        exact: false,
      });

      // Invalidate task-story-relationship queries (covers all user stories)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.storyRelationship, variables.projectId],
      });
    },
  });
  return {
    cloneTask: mutation.mutate,
    cloneTaskAsync: mutation.mutateAsync,
    isCloningTask: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useAttachLabel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      projectId,
      taskId,
      labelId,
    }: {
      projectId: string;
      taskId: string;
      labelId: string;
    }) => taskService.attachLabel(projectId, taskId, labelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.task, variables.projectId, variables.taskId],
      });
    },
  });
  return {
    attachLabel: mutation.mutate,
    attachLabelAsync: mutation.mutateAsync,
    isAttachingLabel: mutation.isPending,
  };
};

export const useRemoveLabel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      projectId,
      taskId,
      labelId,
    }: {
      projectId: string;
      taskId: string;
      labelId: string;
    }) => taskService.removeLabel(projectId, taskId, labelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.task, variables.projectId, variables.taskId],
      });
    },
  });
  return {
    removeLabel: mutation.mutate,
    removeLabelAsync: mutation.mutateAsync,
    isRemovingLabel: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useRestoreTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      taskService.restoreTask(projectId, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.task, variables.projectId, variables.taskId],
      });
    },
  });
  return {
    restoreTask: mutation.mutate,
    restoreTaskAsync: mutation.mutateAsync,
    isRestoringTask: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: BulkUpdateTasksPayload }) =>
      taskService.bulkUpdateTasks(projectId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });
    },
  });
  return {
    bulkUpdateTasks: mutation.mutate,
    bulkUpdateTasksAsync: mutation.mutateAsync,
    isBulkUpdatingTasks: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

// Task Comments Hooks
export const useGetTaskComments = (taskId: string, page = 1, pageSize = 10, enabled = true) => {
  const query = useQuery({
    queryKey: ['task-comments', taskId, page, pageSize],
    queryFn: () => taskService.getComments(taskId, page, pageSize),
    enabled: enabled && !!taskId,
    retry: false,
  });

  return {
    comments: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoadingComments: enabled && !!taskId ? query.isPending : false,
    isFetchingComments: query.isFetching,
    isErrorComments: query.isError,
    commentsError: query.error,
    refetchComments: query.refetch,
  };
};

export const useGetTaskReplies = (
  taskId: string,
  commentId: string,
  page = 1,
  pageSize = 10,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['task-comment-replies', taskId, commentId, page, pageSize],
    queryFn: () => taskService.getReplies(taskId, commentId, page, pageSize),
    enabled: enabled && !!taskId && !!commentId,
  });
  return {
    replies: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoadingReplies: query.isPending,
    isFetchingReplies: query.isFetching,
    isErrorReplies: query.isError,
    repliesError: query.error,
    refetchReplies: query.refetch,
  };
};

export const useCreateTaskComment = (taskId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: { content: string; parent_comment_id?: string }) =>
      taskService.createComment(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-comments', taskId],
      });
    },
  });
  return {
    createComment: mutation.mutate,
    createCommentAsync: mutation.mutateAsync,
    isCreatingComment: mutation.isPending,
    createCommentData: mutation.data,
    createCommentError: mutation.error,
    resetCreateComment: mutation.reset,
  };
};

export const useUpdateTaskComment = (taskId: string, commentId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: { content: string }) =>
      taskService.updateComment(taskId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-comments', taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task-comment-replies', taskId],
      });
    },
  });
  return {
    updateComment: mutation.mutate,
    updateCommentAsync: mutation.mutateAsync,
    isUpdatingComment: mutation.isPending,
    updateCommentData: mutation.data,
    updateCommentError: mutation.error,
    resetUpdateComment: mutation.reset,
  };
};

export const useDeleteTaskComment = (taskId: string, commentId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => taskService.deleteComment(taskId, commentId, { content: '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-comments', taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task-comment-replies', taskId],
      });
    },
  });
  return {
    deleteComment: mutation.mutate,
    deleteCommentAsync: mutation.mutateAsync,
    isDeletingComment: mutation.isPending,
    deleteCommentData: mutation.data,
    deleteCommentError: mutation.error,
    resetDeleteComment: mutation.reset,
  };
};
