'use client';

import { userStoryCommentService } from '@/src/services/userstoryComments';
import {
  CreateUserStoryCommentPayload,
  GetUserStoryCommentsQueryParams,
  GetUserStoryRepliesQueryParams,
  UpdateUserStoryCommentPayload,
} from '@/src/types/userstories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCreateUserStoryComment = (projectId: string, userStoryId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateUserStoryCommentPayload) =>
      userStoryCommentService.createComment(projectId, userStoryId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-comments', projectId, userStoryId],
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

export const useGetUserStoryComments = (
  projectId: string,
  userStoryId: string,
  params?: GetUserStoryCommentsQueryParams,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['user-story-comments', projectId, userStoryId, params],
    queryFn: () => userStoryCommentService.getComments(projectId, userStoryId, params),
    enabled: enabled && Boolean(projectId && userStoryId),
  });
  return {
    comments: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoadingComments: query.isPending,
    isFetchingComments: query.isFetching,
    isErrorComments: query.isError,
    commentsError: query.error,
    refetchComments: query.refetch,
  };
};

export const useGetUserStoryCommentById = (
  projectId: string,
  userStoryId: string,
  commentId: string,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['user-story-comment', projectId, userStoryId, commentId],
    queryFn: () => userStoryCommentService.getCommentById(projectId, userStoryId, commentId),
    enabled: enabled && Boolean(projectId && userStoryId && commentId),
  });
  return {
    comment: query.data?.data,
    isLoadingComment: query.isPending,
    isFetchingComment: query.isFetching,
    isErrorComment: query.isError,
    commentError: query.error,
    refetchComment: query.refetch,
  };
};

export const useGetUserStoryReplies = (
  projectId: string,
  userStoryId: string,
  commentId: string,
  params?: GetUserStoryRepliesQueryParams,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['user-story-comment-replies', projectId, userStoryId, commentId, params],
    queryFn: () => userStoryCommentService.getReplies(projectId, userStoryId, commentId, params),
    enabled: enabled && Boolean(projectId && userStoryId && commentId),
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

export const useUpdateUserStoryComment = (
  projectId: string,
  userStoryId: string,
  commentId: string
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateUserStoryCommentPayload) =>
      userStoryCommentService.updateComment(projectId, userStoryId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-comments', projectId, userStoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-story-comment', projectId, userStoryId, commentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-story-comment-replies', projectId, userStoryId],
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

export const useDeleteUserStoryComment = (
  projectId: string,
  userStoryId: string,
  commentId: string
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => userStoryCommentService.deleteComment(projectId, userStoryId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-comments', projectId, userStoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-story-comment', projectId, userStoryId, commentId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-story-comment-replies', projectId, userStoryId],
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

export const useUploadUserStoryCommentAttachment = (
  projectUuid: string,
  storyId: string
) => {
  return useMutation({
    mutationFn: (payload: FormData) =>
      userStoryCommentService.uploadCommentAttachment(
        projectUuid,
        storyId,
        payload
      ),
  });
};

export const useDeleteUserStoryCommentAttachment = (
  projectId: string,
  userStoryId: string
) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (attachmentId: string) =>
      userStoryCommentService.deleteCommentAttachment(projectId, userStoryId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-story-comments', projectId, userStoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-story-comment', projectId, userStoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-story-comment-replies', projectId, userStoryId],
      });
    },
  });
  return {
    deleteCommentAttachment: mutation.mutate,
    deleteCommentAttachmentAsync: mutation.mutateAsync,
    isDeletingCommentAttachment: mutation.isPending,
    deleteCommentAttachmentData: mutation.data,
    deleteCommentAttachmentError: mutation.error,
    resetDeleteCommentAttachment: mutation.reset,
  };
};

export const useDownloadUserStoryCommentAttachment = (
  projectId: string,
  userStoryId: string
) => {
  const mutation = useMutation({
    mutationFn: (attachmentId: string) =>
      userStoryCommentService.downloadCommentAttachment(projectId, userStoryId, attachmentId),
  });

  return {
    downloadCommentAttachment: mutation.mutate,
    downloadCommentAttachmentAsync: mutation.mutateAsync,
    isDownloadingCommentAttachment: mutation.isPending,
    downloadCommentAttachmentError: mutation.error,
  };
};