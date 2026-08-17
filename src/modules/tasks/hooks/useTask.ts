
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
          queryKey: ['user-story', projectId, variables.user_story_id],
        });
        
        // Also invalidate the user stories list to update counters
        queryClient.invalidateQueries({
          queryKey: ['user-stories', projectId],
        });
        
        queryClient.invalidateQueries({
          queryKey: ['task-story-relationship', projectId, variables.user_story_id],
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
        queryKey: ['user-stories', projectId],
      });
      
      // Invalidate all user story details (we don't know which specific ones were affected)
      queryClient.invalidateQueries({
        queryKey: ['user-story', projectId],
        exact: false,
      });
      
      // Invalidate task-story-relationship queries (covers all user stories)
      queryClient.invalidateQueries({
        queryKey: ['task-story-relationship', projectId],
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
      // Invalidate all task queries for this project
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.tasks, variables.projectId],
      });
      
      // Invalidate the specific task
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.task, variables.projectId, variables.taskId],
      });
      
      // Invalidate user stories to update task counts and lists
      queryClient.invalidateQueries({
        queryKey: ['user-stories', variables.projectId],
      });
      
      // If task has a user story association, invalidate that specific user story
      if (variables.payload.user_story_id) {
        queryClient.invalidateQueries({
          queryKey: ['user-story', variables.projectId, variables.payload.user_story_id],
        });
      }
      
      // Invalidate task-story-relationship queries (covers all user stories)
      queryClient.invalidateQueries({
        queryKey: ['task-story-relationship', variables.projectId],
      });
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
