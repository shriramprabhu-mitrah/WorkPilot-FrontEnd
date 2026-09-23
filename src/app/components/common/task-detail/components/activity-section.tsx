import { useState } from 'react';
import { CornerDownRight, Pencil, Trash2 } from 'lucide-react';
import type { ActivityItem } from '@/src/types/board';
import type { Comment } from '@/src/types/task';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../../task';
import { logger } from '@/src/lib/utils/logger';
import { WpButton } from '../../button';
import WpRichTextEditor from '../../htmlEditor';
import {
  useGetTaskComments,
  useCreateTaskComment,
  useUpdateTaskComment,
  useDeleteTaskComment,
} from '@/src/modules/tasks/hooks/useTask';
import toast from 'react-hot-toast';
import { useGetProjectActivities } from '@/src/modules/project/hooks/useProject';

import { usePermissions } from '@/src/hooks/usePermissions';
import {
  useDownloadAttachment,
  useUploadCommentAttachment,
} from '@/src/modules/tasks/hooks/useCommentAttachment';
import { RichContentViewer } from '../../rich-content-viewer';

type ActivityTab = 'all' | 'comments' | 'history';

interface ActivitySectionProps {
  items: ActivityItem[];
  taskId?: string;
  projectId?: string;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

const AVATAR_COLORS = [
  colors.avatarBlue,
  colors.avatarGreen,
  colors.avatarPink,
  colors.avatarAmber,
  colors.avatarIndigo,
];
const getMemberColor = (userId: string) =>
  userId ? AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length] : colors.avatarBlue;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export const ActivitySection = ({ taskId, projectId }: ActivitySectionProps) => {
  const { canViewComments, canAddComments, canEditComments, canDeleteComments } = usePermissions();
  const canCreateComment = canAddComments;
  const [tab, setTab] = useState<ActivityTab>(canViewComments ? 'comments' : 'history');
  const [comment, setComment] = useState('');
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const { mutateAsync: downloadAttachment } = useDownloadAttachment();

  const handleDownloadImage = async (attachmentId: string, commentId: string) => {
    if (!taskId || !commentId || !attachmentId) {
      logger.log('Download attempted with missing parameters:', {
        taskId,
        commentId,
        attachmentId,
      });
      toast.error('Missing required information to download attachment');
      return;
    }

    logger.log('Attempting to download attachment:', { taskId, commentId, attachmentId });

    try {
      const blob = await downloadAttachment({ taskId, commentId, attachmentId });

      logger.log('Download response received:', blob);

      if (!(blob instanceof Blob)) {
        throw new Error('Download response is not a Blob');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attachment-${attachmentId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Attachment downloaded successfully');
    } catch (error) {
      logger.log('Failed to download attachment', error);
      toast.error('Failed to download attachment');
    }
  };
  // Hooks for activities
  const { activities, isLoadingActivities } = useGetProjectActivities(
    projectId ?? '',
    {
      type: 'activity',
      resource_type: 'task',
      resource_id: taskId,
      task_id: taskId,
      page: 1,
      page_size: 50,
    },
    tab === 'history' && !!projectId && !!taskId
  );

  // Hooks for comments
  const { comments, isLoadingComments } = useGetTaskComments(
    taskId ?? '',
    1,
    50,
    !!taskId && canViewComments
  );
  const { createCommentAsync, isCreatingComment } = useCreateTaskComment(taskId ?? '');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { updateCommentAsync, isUpdatingComment } = useUpdateTaskComment(
    taskId ?? '',
    editingId ?? ''
  );
  const { mutateAsync: uploadCommentAttachment } = useUploadCommentAttachment(taskId ?? '');

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadCommentAttachment(formData);

    const raw = result as unknown as Record<string, unknown>;
    const dataField = raw?.data as Record<string, unknown> | undefined;

    const attachments = (dataField?.data ?? dataField) as
      Array<Record<string, string | undefined>> | undefined;

    const attachment = Array.isArray(attachments) ? attachments[0] : undefined;

    if (!attachment) {
      throw new Error('No attachment returned from upload API');
    }

    const imageUrl =
      attachment.url ?? attachment.file_url ?? attachment.file_path ?? attachment.path;

    const attachmentId = attachment.id ?? attachment.attachment_id ?? attachment.uuid;

    if (!imageUrl) {
      throw new Error('Uploaded attachment does not contain an image URL');
    }
    if (attachmentId) {
      return imageUrl.includes('?')
        ? `${imageUrl}&attachment_id=${attachmentId}`
        : `${imageUrl}?attachment_id=${attachmentId}`;
    }
    return imageUrl;
  };

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { deleteCommentAsync } = useDeleteTaskComment(taskId ?? '', deletingId ?? '');

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showRepliesForComment, setShowRepliesForComment] = useState<Set<string>>(new Set());
  const [repliesMap, setRepliesMap] = useState<Map<string, Comment[]>>(new Map());

  // Comment handlers
  const submitComment = async (content: string, parentId?: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const hasContent = textContent.trim().length > 0 || tempDiv.querySelector('img') !== null;
    if (!taskId || !hasContent) {
      return;
    }
    try {
      await createCommentAsync({
        content,
        parent_comment_id: parentId,
      });
      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
        const { taskService } = await import('@/src/services/tasks');
        const res = await taskService.getReplies(taskId, parentId);
        if (res.data) {
          setRepliesMap(new Map(repliesMap.set(parentId, res.data)));
        }

        toast.success('Reply added successfully');
      } else {
        setComment('');
        setShowCommentEditor(false);
        toast.success('Comment added successfully');
      }
    } catch (error) {
      toast.error('Failed to add comment');
      logger.log('Failed to post comment', error);
    }
  };

  const toggleReplies = async (commentId: string, userName: string) => {
    const newShowReplies = new Set(showRepliesForComment);

    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId);
      setReplyingTo(null);
      setReplyContent('');
    } else {
      newShowReplies.add(commentId);
      setReplyingTo(commentId);

      // Set initial mention
      const mention = `<span class="mention" data-type="mention" data-id="${userName}">@${userName}</span>&nbsp;`;
      setReplyContent(mention);

      // Fetch replies if not already fetched
      if (!repliesMap.has(commentId) && taskId) {
        try {
          const { taskService } = await import('@/src/services/tasks');
          const res = await taskService.getReplies(taskId, commentId);
          if (res.data) {
            setRepliesMap(new Map(repliesMap.set(commentId, res.data)));
          }
        } catch (error) {
          logger.log('Failed to fetch replies', error);
          toast.error('Failed to load replies');
        }
      }
    }
    setShowRepliesForComment(newShowReplies);
  };

  const saveEdit = async (commentId: string, parentCommentId?: string) => {
    if (!taskId || !editContent.trim()) return;

    try {
      await updateCommentAsync({ content: editContent.trim() });
      setEditingId(null);
      setEditContent('');

      // Refetch replies if it's a reply
      if (parentCommentId) {
        const { taskService } = await import('@/src/services/tasks');
        const res = await taskService.getReplies(taskId, parentCommentId);
        if (res.data) {
          setRepliesMap(new Map(repliesMap.set(parentCommentId, res.data)));
        }
      }

      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error('Failed to update comment');
      logger.log('Failed to update comment', error);
    }
  };

  const handleDeleteComment = async (commentId: string, parentCommentId?: string) => {
    if (!taskId) return;

    try {
      setDeletingId(commentId);
      await deleteCommentAsync();

      // Refetch replies if it's a reply
      if (parentCommentId) {
        const { taskService } = await import('@/src/services/tasks');
        const res = await taskService.getReplies(taskId, parentCommentId);
        if (res.data) {
          setRepliesMap(new Map(repliesMap.set(parentCommentId, res.data)));
        }
      }

      toast.success('Comment deleted successfully');
      setDeletingId(null);
    } catch (error) {
      toast.error('Failed to delete comment');
      logger.log('Failed to delete comment', error);
      setDeletingId(null);
    }
  };

  const tabs: Array<{
    key: ActivityTab;
    label: string;
  }> = [
    ...(canViewComments
      ? [
          {
            key: 'comments' as ActivityTab,
            label: 'Comments',
          },
        ]
      : []),
    {
      key: 'history' as ActivityTab,
      label: 'History',
    },
  ];

  const renderComment = (c: Comment, isReply = false, parentCommentId?: string) => {
    const name = c.user_name || c.full_name || c.user?.name || 'Unknown';
    const initials = getInitials(name);
    const isEditing = editingId === c.id;
    const userColor = c.color;

    return (
      <div key={c.id} className={`${isReply ? '' : 'mb-4'}`}>
        <div className="flex gap-3 group">
          <AssigneeAvatar
            initials={initials}
            color={userColor || ''}
            size={isReply ? 'xs' : 'sm'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-xs text-gray-900">{name}</span>
              <span className="text-xs text-gray-400">{formatTime(c.created_at)}</span>
              {(canEditComments || canDeleteComments) && !isEditing && (
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEditComments && (
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditContent(c.content);
                      }}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                      title="Edit comment"
                    >
                      <Pencil
                        size={isReply ? 11 : 13}
                        className="text-gray-500 dark:text-slate-400"
                      />
                    </button>
                  )}
                  {canDeleteComments && (
                    <button
                      onClick={() => handleDeleteComment(c.id, parentCommentId)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete comment"
                      disabled={deletingId === c.id}
                    >
                      <Trash2 size={isReply ? 11 : 13} className="text-red-500 dark:text-red-400" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 mt-2">
                <WpRichTextEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Edit comment..."
                  minHeight="100px"
                  onImageUpload={handleEditorImageUpload}
                />
                <div className="flex items-center gap-2">
                  <WpButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isUpdatingComment || !editContent.trim()}
                    onClick={() => saveEdit(c.id, parentCommentId)}
                  >
                    {isUpdatingComment ? 'Saving...' : 'Save'}
                  </WpButton>
                  <WpButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </WpButton>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`${
                    isReply
                      ? 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
                      : 'bg-gray-50 dark:bg-slate-800'
                  } rounded-lg px-3 py-2`}
                >
                  <RichContentViewer
                    content={c.content}
                    className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-700`}
                    canDownload={true}
                    onDownloadImage={(attachmentId) => handleDownloadImage(attachmentId, c.id)}
                  />
                </div>

                {!isReply && canCreateComment && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleReplies(c.id, name)}
                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <CornerDownRight size={14} />
                      <span>Reply</span>
                      {c.replies_count && c.replies_count > 0 && (
                        <span className="text-xs font-semibold text-blue-600">
                          ({c.replies_count})
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Replies Section */}
        {showRepliesForComment.has(c.id) && (
          <div className="mt-4 ml-8 border-l-2 border-gray-200 pl-4 space-y-4">
            {/* Display Replies */}
            {repliesMap.get(c.id) && repliesMap.get(c.id)!.length > 0 && (
              <div className="space-y-3">
                {repliesMap.get(c.id)!.map((reply: Comment) => renderComment(reply, true, c.id))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === c.id && canCreateComment && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <CornerDownRight size={12} />
                  <span>
                    Replying to <span className="font-semibold text-gray-700">{name}</span>
                  </span>
                </div>
                <WpRichTextEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder="Write a reply..."
                  minHeight="80px"
                  onImageUpload={handleEditorImageUpload}
                />
                <div className="flex items-center gap-2">
                  <WpButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isCreatingComment}
                    onClick={() => submitComment(replyContent, c.id)}
                  >
                    {isCreatingComment ? 'Replying...' : 'Reply'}
                  </WpButton>
                  <WpButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </WpButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section>
      <p className="text-base font-semibold text-gray-800 dark:text-white mb-3">Activity</p>

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              tab === t.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{
              borderBottom: tab === t.key ? `2px solid ${colors.primary}` : undefined,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Comment Input - Moved to Top */}
      {(tab === 'all' || tab === 'comments') && canCreateComment && (
        <div className="flex gap-2 items-start mb-5">
          <AssigneeAvatar initials="Y" color={colors.avatarIndigo} size="md" />

          <div className="flex-1 min-w-0">
            {showCommentEditor ? (
              <div className="space-y-2">
                <WpRichTextEditor
                  value={comment}
                  onChange={setComment}
                  placeholder="Add a comment..."
                  minHeight="120px"
                  onImageUpload={handleEditorImageUpload}
                />

                <div className="flex justify-end gap-2">
                  <WpButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setComment('');
                      setShowCommentEditor(false);
                    }}
                  >
                    Cancel
                  </WpButton>

                  <WpButton
                    type="button"
                    variant="primary"
                    disabled={isCreatingComment}
                    onClick={() => submitComment(comment)}
                  >
                    {isCreatingComment ? 'Posting...' : 'Add Comment'}
                  </WpButton>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCommentEditor(true)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500"
              >
                Write a comment...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments / History */}
      <div className="space-y-4 mb-5">
        {(tab === 'all' || tab === 'comments') && (
          <>
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              tab === 'comments' && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 dark:text-slate-100">No comments yet</p>
                  <p className="text-xs text-gray-400 mt-1  dark:text-slate-100">
                    Be the first to comment
                  </p>
                </div>
              )
            ) : (
              comments.map((c) => renderComment(c))
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="relative space-y-0">
                {/* Timeline Line */}
                <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-gray-200 dark:from-blue-800 dark:via-purple-800 dark:to-slate-700" />

                {activities.map((activity, index) => {
                  const activityDate = new Date(activity.timestamp);
                  const formattedDate = activityDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = activityDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  const userName = activity.user?.name || 'Unknown User';
                  const userInitials = getInitials(userName);
                  const userColor = activity.user?.color;

                  let titleAction = `${activity.action} the ${activity.resource_type.replace('_', ' ')}`;
                  let changeText: React.ReactNode = null;
                  let activityIcon: React.ReactNode = null;
                  let badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

                  // Determine activity type and icon
                  const resourceType = activity.resource_type;
                  const action = activity.action.toLowerCase();

                  if (action === 'created') {
                    activityIcon = <CornerDownRight size={12} className="text-green-600 dark:text-green-400" />;
                    badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
                  } else if (action === 'updated' || action === 'changed') {
                    activityIcon = <Pencil size={12} className="text-blue-600 dark:text-blue-400" />;
                    badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                  } else if (action === 'deleted') {
                    activityIcon = <Trash2 size={12} className="text-red-600 dark:text-red-400" />;
                    badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                  } else if (resourceType === 'comment') {
                    activityIcon = <CornerDownRight size={12} className="text-purple-600 dark:text-purple-400" />;
                    badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
                  } else if (resourceType === 'user_story_attachment' || resourceType === 'task_attachment') {
                    activityIcon = <CornerDownRight size={12} className="text-amber-600 dark:text-amber-400" />;
                    badgeColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
                  } else {
                    activityIcon = <CornerDownRight size={12} className="text-gray-600 dark:text-gray-400" />;
                  }

                  if (activity.details) {
                    const changeMatch = activity.details.match(
                      /:\s*(.+) changed from (.+) to (.+)$/
                    );
                    if (changeMatch) {
                      const field = changeMatch[1];
                      const fromVal = changeMatch[2].replace(/'/g, '');
                      const toVal = changeMatch[3].replace(/'/g, '');
                      titleAction = `changed the ${field.charAt(0).toUpperCase() + field.slice(1)}`;

                      const formatVal = (val: string) => (val === 'nil' ? 'None' : val);
                      changeText = (
                        <div className="flex items-center gap-2 mt-2.5 p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                          <span className="text-sm text-gray-600 dark:text-slate-400 px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                            {formatVal(fromVal)}
                          </span>
                          <span className="text-gray-400 dark:text-slate-500">→</span>
                          <span className="text-sm text-gray-900 dark:text-slate-200 px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 font-medium">
                            {formatVal(toVal)}
                          </span>
                        </div>
                      );
                    } else if (activity.details.includes('details updated')) {
                      titleAction = `updated the details`;
                    } else if (activity.details.includes('created by')) {
                      titleAction = `created the ${activity.resource_type.replace('_', ' ')}`;
                    } else if (activity.resource_type === 'comment') {
                      titleAction = `commented`;
                      const commentMatch = activity.details.match(/ as (.*)$/);
                      if (commentMatch) {
                        changeText = (
                          <div className="mt-2.5 p-2.5 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30">
                            <div
                              className="text-sm text-gray-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{
                                __html: commentMatch[1],
                              }}
                            />
                          </div>
                        );
                      } else {
                        changeText = (
                          <div className="mt-2.5 p-2.5 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30 text-sm text-gray-700 dark:text-slate-300">
                            {activity.details}
                          </div>
                        );
                      }
                    } else if (
                      activity.resource_type === 'user_story_attachment' ||
                      activity.resource_type === 'task_attachment'
                    ) {
                      titleAction = `uploaded an attachment`;
                      changeText = (
                        <div className="mt-2.5 p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30 text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                          <CornerDownRight size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate">{activity.details}</span>
                        </div>
                      );
                    } else {
                      changeText = (
                        <div className="mt-2.5 p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-300">
                          {activity.details}
                        </div>
                      );
                    }
                  }

                  return (
                    <div 
                      key={activity.id} 
                      className="relative flex gap-4 pb-6 group"
                    >
                      {/* Timeline Node */}
                      <div className="relative z-10 flex items-center justify-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md ring-4 ring-white dark:ring-slate-900 transition-all group-hover:shadow-lg group-hover:scale-105"
                          style={{
                            backgroundColor: userColor,
                          }}
                        >
                          {userInitials}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 min-w-0 -mt-0.5">
                        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 p-3.5 shadow-sm hover:shadow-md transition-all group-hover:border-gray-300 dark:group-hover:border-slate-600">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                                {userName}
                              </span>
                              <span className="text-gray-700 dark:text-slate-300 text-sm">
                                {titleAction}
                              </span>
                            </div>
                            {/* Activity Type Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${badgeColor}`}>
                              {action}
                            </span>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mb-1">
                            <span>{formattedDate}</span>
                            <span className="text-gray-300 dark:text-slate-600">•</span>
                            <span>{formattedTime}</span>
                          </div>

                          {/* Change Details */}
                          {changeText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <CornerDownRight size={28} className="text-gray-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">No history yet</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  Changes will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
