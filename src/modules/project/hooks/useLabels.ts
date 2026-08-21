import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { labelService } from '@/src/services/label';
import { customStatusService } from '@/src/services/colors';

import { CreateLabelPayload, UpdateLabelPayload } from '@/src/types/label';

import {
  CreateCustomStatusPayload,
  UpdateCustomStatusPayload,
  AssignColorToTaskPayload,
} from '@/src/types/colors';

const colorsKeys = {
  all: ['colors'] as const,
  list: (projectId: string) => ['colors', projectId] as const,
};

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
    mutationFn: ({ projectId, payload }: { projectId: string; payload: CreateLabelPayload }) =>
      labelService.createLabel(projectId, payload),

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
    }) => labelService.updateLabel(projectId, labelId, payload),

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
    mutationFn: ({ projectId, labelId }: { projectId: string; labelId: string }) =>
      labelService.deleteLabel(projectId, labelId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.list(variables.projectId),
      });
    },
  });
};

export const useGetStatus = (
  projectId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: colorsKeys.list(projectId),
    queryFn: () => customStatusService.getCustomStatuses(projectId),
    enabled: enabled && !!projectId,
  });
};

export const useCreateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateCustomStatusPayload;
    }) => customStatusService.createCustomStatus(projectId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: colorsKeys.list(variables.projectId),
      });
    },
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      statusId,
      payload,
    }: {
      projectId: string;
      statusId: string;
      payload: UpdateCustomStatusPayload;
    }) => customStatusService.updateCustomStatus(projectId, statusId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: colorsKeys.list(variables.projectId),
      });
    },
  });
};

export const useDeleteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, statusId }: { projectId: string; statusId: string }) =>
      customStatusService.deleteCustomStatus(projectId, statusId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: colorsKeys.list(variables.projectId),
      });
    },
  });
};

export const useAssignColorToTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: AssignColorToTaskPayload;
    }) => customStatusService.assignCustomStatusToTask(projectId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: colorsKeys.list(variables.projectId),
      });
    },
  });
};
