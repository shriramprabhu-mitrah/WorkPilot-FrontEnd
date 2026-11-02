import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { logger } from '@/src/lib/utils/logger';
import { userStoryCommentService } from '@/src/services/userstoryComments';
import { UserStoryReplyResponse } from '@/src/types/userstories';
import {
  useCreateUserStoryComment,
  useGetUserStoryComments,
  useUpdateUserStoryComment,
  useDeleteUserStoryComment,
  useUploadUserStoryCommentAttachment,
  useDeleteUserStoryCommentAttachment,
  useDownloadUserStoryCommentAttachment,
} from '@/src/modules/tasks/hooks/useUserStoryComments';

interface UseStoryCommentsParams {
  projectId: string;
  storyId: string;
  canViewComments: boolean;
}

type UploadResponseItem = Record<string, string | undefined>;

const appendAttachmentId = (url: string, id?: string) => {
  if (!id) return url;
  return url.includes('?') ? `${url}&attachment_id=${id}` : `${url}?attachment_id=${id}`;
};

export const useStoryComments = ({
  projectId,
  storyId,
  canViewComments,
}: UseStoryCommentsParams) => {
  const [showCommentEditor, setShowCommentEditor] = useState(true);
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showRepliesForComment, setShowRepliesForComment] = useState<Set<string>>(new Set());
  const [repliesMap, setRepliesMap] = useState<Map<string, UserStoryReplyResponse[]>>(new Map());
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);

  const { mutateAsync: uploadCommentAttachmentAsync } = useUploadUserStoryCommentAttachment(
    projectId,
    storyId
  );
  const { createCommentAsync, isCreatingComment } = useCreateUserStoryComment(projectId, storyId);
  const { comments, isLoadingComments } = useGetUserStoryComments(
    projectId,
    storyId,
    { page: 1, page_size: 50 },
    !!projectId && !!storyId && canViewComments
  );
  const { deleteCommentAttachmentAsync } = useDeleteUserStoryCommentAttachment(projectId, storyId);
  const { downloadCommentAttachmentAsync } = useDownloadUserStoryCommentAttachment(
    projectId,
    storyId
  );
  const { updateCommentAsync, isUpdatingComment } = useUpdateUserStoryComment(
    projectId,
    storyId,
    editingCommentId ?? ''
  );
  const { deleteCommentAsync } = useDeleteUserStoryComment(
    projectId,
    storyId,
    deletingCommentId ?? ''
  );
  const { updateCommentAsync: updateReplyAsync, isUpdatingComment: isUpdatingReply } =
    useUpdateUserStoryComment(projectId, storyId, editingReplyId ?? '');
  const { deleteCommentAsync: deleteReplyAsync } = useDeleteUserStoryComment(
    projectId,
    storyId,
    deletingReplyId ?? ''
  );

  const handleAddComment = useCallback(async () => {
    if (!comment.trim()) return;
    try {
      await createCommentAsync({ content: comment });
      setComment('');
      setShowCommentEditor(false);
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
      logger.log('Failed to add comment', error);
    }
  }, [comment, createCommentAsync]);

  const handleUpdateComment = useCallback(
    async (_commentId: string) => {
      if (!editingCommentContent.trim()) return;
      try {
        await updateCommentAsync({ content: editingCommentContent });
        setEditingCommentId(null);
        setEditingCommentContent('');
        toast.success('Comment updated successfully');
      } catch (error) {
        toast.error('Failed to update comment');
        logger.log('Failed to update comment', error);
      }
    },
    [editingCommentContent, updateCommentAsync]
  );

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      try {
        setDeletingCommentId(commentId);
        await deleteCommentAsync();
        toast.success('Comment deleted successfully');
        setDeletingCommentId(null);
      } catch (error) {
        toast.error('Failed to delete comment');
        logger.log('Failed to delete comment', error);
        setDeletingCommentId(null);
      }
    },
    [deleteCommentAsync]
  );

  const fetchReplies = useCallback(
    async (commentId: string) => {
      const response = await userStoryCommentService.getReplies(projectId, storyId, commentId, {
        page: 1,
        page_size: 50,
      });
      setRepliesMap((prev) => new Map(prev).set(commentId, response.data ?? []));
    },
    [projectId, storyId]
  );

  const handleToggleReplies = useCallback(
    async (commentId: string, userName: string) => {
      const newShowReplies = new Set(showRepliesForComment);
      if (newShowReplies.has(commentId)) {
        newShowReplies.delete(commentId);
        setReplyingToCommentId(null);
        setReplyContent('');
      } else {
        newShowReplies.add(commentId);
        setReplyingToCommentId(commentId);

        const mention = `<span class="mention" data-type="mention" data-id="${userName}">@${userName}</span>&nbsp;`;
        setReplyContent(mention);

        if (!repliesMap.has(commentId)) {
          try {
            await fetchReplies(commentId);
          } catch (error) {
            logger.log('Failed to fetch replies', error);
            toast.error('Failed to load replies');
          }
        }
      }
      setShowRepliesForComment(newShowReplies);
    },
    [showRepliesForComment, repliesMap, fetchReplies]
  );

  const refreshReplies = useCallback(
    async (parentCommentId: string) => {
      try {
        await fetchReplies(parentCommentId);
      } catch (error) {
        logger.log('Failed to refresh replies', error);
      }
    },
    [fetchReplies]
  );

  const handleAddReply = useCallback(
    async (parentCommentId: string) => {
      if (!replyContent.trim()) return;
      try {
        await createCommentAsync({ content: replyContent, parent_comment_id: parentCommentId });
        setReplyContent('');
        setReplyingToCommentId(null);
        toast.success('Reply added successfully');
        await refreshReplies(parentCommentId);
      } catch (error) {
        toast.error('Failed to add reply');
        logger.log('Failed to add reply', error);
      }
    },
    [replyContent, createCommentAsync, refreshReplies]
  );

  const handleUpdateReply = useCallback(
    async (_replyId: string, parentCommentId: string) => {
      if (!editingReplyContent.trim()) return;
      try {
        await updateReplyAsync({ content: editingReplyContent });
        setEditingReplyId(null);
        setEditingReplyContent('');
        toast.success('Reply updated successfully');
        await refreshReplies(parentCommentId);
      } catch (error) {
        toast.error('Failed to update reply');
        logger.log('Failed to update reply', error);
      }
    },
    [editingReplyContent, updateReplyAsync, refreshReplies]
  );

  const handleDeleteReply = useCallback(
    async (replyId: string, parentCommentId: string) => {
      try {
        setDeletingReplyId(replyId);
        await deleteReplyAsync();
        toast.success('Reply deleted successfully');
        setDeletingReplyId(null);
        await refreshReplies(parentCommentId);
      } catch (error) {
        toast.error('Failed to delete reply');
        logger.log('Failed to delete reply', error);
        setDeletingReplyId(null);
      }
    },
    [deleteReplyAsync, refreshReplies]
  );

  // ---------- Comment attachment handlers ----------
  const handleDeleteCommentAttachment = useCallback(
    async (attachmentId: string) => {
      if (!attachmentId) return;
      try {
        await deleteCommentAttachmentAsync(attachmentId);
        toast.success('Image deleted successfully');
      } catch (error) {
        toast.error('Failed to delete image');
        logger.log('Failed to delete comment attachment', error);
      }
    },
    [deleteCommentAttachmentAsync]
  );

  const handleDownloadCommentAttachment = useCallback(
    async (attachmentId: string) => {
      if (!attachmentId) return;
      try {
        const blob = await downloadCommentAttachmentAsync(attachmentId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attachment-${attachmentId}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Image downloaded successfully');
      } catch (error) {
        toast.error('Failed to download image');
        logger.log('Failed to download comment attachment', error);
      }
    },
    [downloadCommentAttachmentAsync]
  );

  const handleCommentImageUpload = useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadCommentAttachmentAsync(formData);

      const raw = result as unknown as Record<string, unknown>;
      const dataField = raw?.data as Record<string, unknown> | undefined;
      const list = (dataField?.data ?? dataField) as UploadResponseItem[] | undefined;
      const attachment = Array.isArray(list) ? list[0] : undefined;
      if (!attachment) throw new Error('No attachment returned from upload API');

      const imageUrl =
        attachment.url ?? attachment.file_url ?? attachment.file_path ?? attachment.path;
      const attachmentId = attachment.id ?? attachment.attachment_id ?? attachment.uuid;
      if (!imageUrl) throw new Error('Uploaded attachment does not contain an image URL');

      return appendAttachmentId(imageUrl, attachmentId);
    },
    [uploadCommentAttachmentAsync]
  );

  return {
    commentState: {
      showCommentEditor,
      setShowCommentEditor,
      comment,
      setComment,
      handleAddComment,
      isCreatingComment,
      handleCommentImageUpload,
      comments,
      isLoadingComments,
      editingCommentId,
      setEditingCommentId,
      editingCommentContent,
      setEditingCommentContent,
      handleUpdateComment,
      isUpdatingComment,
      handleDeleteComment,
      deletingCommentId,
      handleDownloadCommentAttachment,
      handleDeleteCommentAttachment,
    },
    replyState: {
      handleToggleReplies,
      showRepliesForComment,
      repliesMap,
      replyingToCommentId,
      setReplyingToCommentId,
      replyContent,
      setReplyContent,
      handleAddReply,
      editingReplyId,
      setEditingReplyId,
      editingReplyContent,
      setEditingReplyContent,
      isUpdatingReply,
      handleUpdateReply,
      handleDeleteReply,
      deletingReplyId,
    },
  };
};
