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
import { useTaskAttachments } from '@/src/modules/tasks/hooks/useTaskAttachment';

type ActivityTab = 'all' | 'comments' | 'history';
interface UploadedAttachment {
  url?: string;
  file_url?: string;
  file_path?: string;
  path?: string;
}
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

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export const ActivitySection = ({ items, taskId, projectId }: ActivitySectionProps) => {
  const [tab, setTab] = useState<ActivityTab>('all');
  const [comment, setComment] = useState('');
  const [showCommentEditor, setShowCommentEditor] = useState(false);

  // Hooks for comments
  const { comments, isLoadingComments, isErrorComments, commentsError } = useGetTaskComments(
    taskId ?? '',
    1,
    50,
    !!taskId
  );
  const { createCommentAsync, isCreatingComment } = useCreateTaskComment(taskId ?? '');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { updateCommentAsync, isUpdatingComment } = useUpdateTaskComment(
    taskId ?? '',
    editingId ?? ''
  );
  const { uploadAttachment } = useTaskAttachments(projectId ?? '', taskId ?? '');

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadAttachment.mutateAsync(formData);
    const attachment = result?.data?.[0] as UploadedAttachment | undefined;
    if (!attachment) {
      throw new Error('No attachment returned from upload API');
    }
    const imageUrl =
      attachment.url ?? attachment.file_url ?? attachment.file_path ?? attachment.path;
    if (!imageUrl) {
      throw new Error('Uploaded attachment does not contain an image URL');
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
    // Strip HTML tags for validation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (!taskId || !textContent.trim()) {
      return;
    }

    try {
      await createCommentAsync({
        content: content,
        parent_comment_id: parentId,
      });

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
        // Refetch replies
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

  const historyItems = items.filter((i) => i.type === 'history');

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'comments', label: 'Comments' },
    { key: 'history', label: 'History' },
  ];

  const renderComment = (c: Comment, isReply = false, parentCommentId?: string) => {
    const name = c.user_name || c.full_name || c.user?.name || 'Unknown';
    const initials = getInitials(name);
    const isEditing = editingId === c.id;

    return (
      <div key={c.id} className={`${isReply ? '' : 'mb-4'}`}>
        <div className="flex gap-3">
          <AssigneeAvatar
            initials={initials}
            color={colors.avatarBlue}
            size={isReply ? 'xs' : 'sm'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`${isReply ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>
                {name}
              </span>
              <span className="text-xs text-gray-500">{formatTime(c.created_at)}</span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <WpRichTextEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Edit comment..."
                  minHeight={isReply ? '80px' : '100px'}
                  onImageUpload={handleEditorImageUpload}
                />
                <div className="flex items-center gap-2">
                  <WpButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!editContent.trim() || isUpdatingComment}
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
                  className={`${isReply ? 'bg-white border border-gray-200' : 'bg-gray-50'} rounded-lg px-3 py-2 relative group`}
                >
                  <div
                    className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-700 prose prose-sm max-w-none`}
                    dangerouslySetInnerHTML={{ __html: c.content }}
                  />

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setEditContent(c.content);
                      }}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Edit comment"
                    >
                      <Pencil size={isReply ? 12 : 14} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c.id, parentCommentId)}
                      className="p-1 rounded hover:bg-red-100 transition-colors"
                      title="Delete comment"
                      disabled={deletingId === c.id}
                    >
                      <Trash2 size={isReply ? 12 : 14} className="text-red-600" />
                    </button>
                  </div>
                </div>

                {!isReply && (
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
            {replyingTo === c.id && (
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
      <p className="text-base font-semibold text-gray-800 mb-3">Activity</p>

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

      <div className="space-y-4 mb-5">
        {(tab === 'all' || tab === 'comments') && (
          <>
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              </div>
            ) : isErrorComments ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-500">Failed to load comments</p>
                <p className="text-xs text-gray-400 mt-1">
                  {commentsError?.message || 'Unknown error'}
                </p>
              </div>
            ) : comments.length === 0 ? (
              tab === 'comments' && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No comments yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to comment</p>
                </div>
              )
            ) : (
              comments.map((c) => renderComment(c))
            )}
          </>
        )}

        {(tab === 'all' || tab === 'history') &&
          historyItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <AssigneeAvatar initials={item.userInitials} color={item.userColor} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{item.user}</span>
                  <span className="text-xs text-gray-500">{item.action}</span>
                  {item.target && (
                    <span className="text-xs font-semibold text-gray-700">{item.target}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.timestamp}</p>
                <span
                  className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.gray100, color: colors.gray500 }}
                >
                  HISTORY
                </span>
              </div>
            </div>
          ))}
      </div>

      {(tab === 'all' || tab === 'comments') && (
        <div className="flex gap-2 items-start">
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
    </section>
  );
};
