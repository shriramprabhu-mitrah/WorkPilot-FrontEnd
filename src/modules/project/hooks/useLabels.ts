import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { labelService } from '@/src/services/label';
import {
  CreateLabelPayload,
  UpdateLabelPayload,
} from '@/src/types/label';

const labelKeys = {
  all: ['labels'] as const,
  list: (projectId: string) => ['labels', projectId] as const,
};

export const useGetLabels = (projectId: string) => {
  return useQuery({
    queryKey: labelKeys.list(projectId),
    queryFn: () => labelService.getLabels(projectId),
    enabled: !!projectId,
  });
};

export const useCreateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateLabelPayload;
    }) => labelService.createLabel(projectId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.list(variables.projectId),
      });
    },
  });
};

export const useUpdateLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      labelId,
      payload,
    }: {
      projectId: string;
      labelId: string;
      payload: UpdateLabelPayload;
    }) =>
      labelService.updateLabel(
        projectId,
        labelId,
        payload
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.list(variables.projectId),
      });
    },
  });
};

export const useDeleteLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      labelId,
    }: {
      projectId: string;
      labelId: string;
    }) => labelService.deleteLabel(projectId, labelId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.list(variables.projectId),
      });
    },
  });
};