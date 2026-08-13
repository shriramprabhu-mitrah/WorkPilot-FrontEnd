'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskAttachmentService } from '@/src/services/taskAttachment';

export const useTaskAttachments = (projectId: string, taskId: string, enabled = true) => {
  const queryClient = useQueryClient();

  const {
    data: attachments,
    isLoading: isLoadingAttachments,
    isFetching: isFetchingAttachments,
    refetch: refetchAttachments,
  } = useQuery({
    queryKey: ['task-attachments', projectId, taskId],
    queryFn: () => taskAttachmentService.listTaskAttachments(projectId, taskId),
    enabled: enabled && !!projectId && !!taskId,
  });

  const uploadAttachment = useMutation({
    mutationFn: (payload: FormData) =>
      taskAttachmentService.uploadTaskAttachment(projectId, taskId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-attachments', projectId, taskId],
      });
    },
  });

  const downloadAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      taskAttachmentService.downloadTaskAttachment(projectId, taskId, attachmentId),
  });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      taskAttachmentService.deleteTaskAttachment(projectId, taskId, attachmentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-attachments', projectId, taskId],
      });
    },
  });

  return {
    attachments,

    isLoadingAttachments,
    isFetchingAttachments,
    refetchAttachments,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  };
};
