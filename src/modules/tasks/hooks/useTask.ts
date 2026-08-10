import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/src/services/tasks';
import { GetTasksQueryParams, TaskPayload } from '@/src/types/task';

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