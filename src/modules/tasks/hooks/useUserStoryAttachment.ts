import { userStoryService } from '@/src/services/userstory';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUploadUserStoryAttachment = (projectId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userStoryId, file }: { userStoryId: string; file: File }) =>
      userStoryService.uploadUserStoryAttachment(projectId, userStoryId, file),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-attachments', projectId, variables.userStoryId],
      });
    },
  });

  return {
    uploadUserStoryAttachment: mutation.mutate,
    uploadUserStoryAttachmentAsync: mutation.mutateAsync,
    isUploadingUserStoryAttachment: mutation.isPending,
    uploadUserStoryAttachmentData: mutation?.data,
    uploadUserStoryAttachmentError: mutation.error,
    resetUploadUserStoryAttachment: mutation.reset,
  };
};

export const useGetUserStoryAttachments = (projectId: string, userStoryId: string) => {
  const query = useQuery({
    queryKey: ['user-story-attachments', projectId, userStoryId],
    queryFn: () => userStoryService.getUserStoryAttachments(projectId, userStoryId),
    enabled: Boolean(projectId && userStoryId),
  });

  return {
    attachments: query.data?.data ?? [],
    isLoadingAttachments: query.isPending,
    isFetchingAttachments: query.isFetching,
    isErrorAttachments: query.isError,
    attachmentsError: query.error,
    refetchAttachments: query.refetch,
  };
};

export const useDownloadUserStoryAttachment = (projectId: string, userStoryId: string) => {
  const downloadAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      userStoryService.downloadUserStoryAttachment(projectId, userStoryId, attachmentId),
  });
  return {
    downloadAttachment,
    isDownloadingAttachment: downloadAttachment.isPending,
    downloadAttachmentError: downloadAttachment.error,
    downloadAttachmentData: downloadAttachment.data,
  };
};

export const useDeleteUserStoryAttachment = (projectId: string, userStoryId: string) => {
  const queryClient = useQueryClient();
  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      userStoryService.deleteUserStoryAttachment(projectId, userStoryId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-attachments', projectId, userStoryId],
      });
    },
  });
  return {
    deleteAttachment: deleteAttachment.mutate,
    deleteAttachmentAsync: deleteAttachment.mutateAsync,
    isDeletingAttachment: deleteAttachment.isPending,
    deleteAttachmentData: deleteAttachment.data,
    deleteAttachmentError: deleteAttachment.error,
    resetDeleteAttachment: deleteAttachment.reset,
  };
};
