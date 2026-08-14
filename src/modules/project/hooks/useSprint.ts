import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sprintService } from '@/src/services/sprint';
import { SprintPayload, UpdateSprintPayload } from '@/src/types/project';

export const useGetSprints = (projectId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintService.getSprints(projectId),
    enabled: enabled && !!projectId,
  });

  return {
    sprints: query.data?.data,
    isLoadingSprints: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchSprints: query.refetch,
  };
};

export const useCreateSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SprintPayload) => sprintService.createSprint(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectDetail', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects-with-sprints'] });
    },
  });

  return {
    createSprint: mutation.mutate,
    createSprintAsync: mutation.mutateAsync,
    isCreatingSprint: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useUpdateSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ sprintId, payload }: { sprintId: string; payload: UpdateSprintPayload }) =>
      sprintService.updateSprint(projectId, sprintId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectDetail', projectId] });
    },
  });

  return {
    updateSprint: mutation.mutate,
    updateSprintAsync: mutation.mutateAsync,
    isUpdatingSprint: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useGetSprintById = (projectId: string, sprintId: string) => {
  const query = useQuery({
    queryKey: ['sprint', projectId, sprintId],
    queryFn: () => sprintService.getSprintById(projectId, sprintId),
    enabled: !!projectId && !!sprintId,
  });

  return {
    sprint: query.data?.data,
    isLoadingSprint: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useDeleteSprint = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (sprintId: string) => sprintService.deleteSprint(projectId, sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectDetail', projectId] });
    },
  });

  return {
    deleteSprint: mutation.mutate,
    deleteSprintAsync: mutation.mutateAsync,
    isDeletingSprint: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};
