'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentAttachmentService } from '@/src/services/commentAttachment';

export const useCommentAttachments = (taskId: string, commentId: string, enabled = true) => {
  const queryClient = useQueryClient();

  const {
    data: attachments,
    isLoading: isLoadingAttachments,
    isFetching: isFetchingAttachments,
    refetch: refetchAttachments,
  } = useQuery({
    queryKey: ['comment-attachments', taskId, commentId],
    queryFn: () => commentAttachmentService.listCommentAttachments(taskId, commentId),
    enabled: enabled && !!taskId && !!commentId,
  });

const uploadAttachment = useMutation({
  mutationFn: (payload: FormData) =>
    commentAttachmentService.uploadCommentAttachment(taskId, payload),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['comment-attachments', taskId, commentId],
    });
  },
});

  const downloadAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      commentAttachmentService.downloadCommentAttachment(taskId, commentId, attachmentId),
  });

  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      commentAttachmentService.deleteCommentAttachment(taskId, commentId, attachmentId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comment-attachments', taskId, commentId],
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

export const useUploadCommentAttachment = (taskUuid: string) => {
  return useMutation({
    mutationFn: (payload: FormData) =>
      commentAttachmentService.uploadCommentAttachment(
        taskUuid,
        payload
      ),
  });
};


export const useDownloadAttachment = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      taskId,
      attachmentId,
    }: {
      projectId: string;
      taskId: string;
      attachmentId: string;
    }) =>
      commentAttachmentService.downloadAttachment(
        projectId,
        taskId,
        attachmentId
      ),
  });
};
