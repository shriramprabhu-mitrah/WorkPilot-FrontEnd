import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/src/services/tasks';
import {
  BulkUpdateTasksPayload,
  ClonePayload,
  GetTasksQueryParams,
  TaskPayload,
  UpdateTaskPayload,
} from '@/src/types/task';
import { userService } from '@/src/services/user';

export const useGetTasks = (projectId: string, params?: GetTasksQueryParams, enabled = true) => {
  const query = useQuery({
    queryKey: ['tasks', projectId, params],
    queryFn: () => taskService.getTasks(projectId, params),
    enabled: enabled && !!projectId,
  });

  return {
    tasksList: query.data?.data || [],
    // pagination: query.data?.pagination,
    isLoadingTasks: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchTasks: query.refetch,
  };
};

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: TaskPayload) => taskService.createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
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
    queryKey: ['task', projectId, taskId],
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

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ projectId, taskId }: { projectId: string; taskId: string }) =>
      taskService.deleteTask(projectId, taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId],
      });
      queryClient.removeQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
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
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
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
        queryKey: ['tasks', variables.projectId],
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
        queryKey: ['tasks', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
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
        queryKey: ['tasks', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
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
        queryKey: ['tasks', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['task', variables.projectId, variables.taskId],
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
        queryKey: ['tasks', variables.projectId],
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
