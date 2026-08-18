import { useEffect, useRef, useState } from 'react';
import { Send, Pencil, Check, X } from 'lucide-react';
import type { ActivityItem } from '@/src/types/board';
import type { Comment } from '@/src/types/task';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../../task';
import { taskService } from '@/src/services/tasks';
import { logger } from '@/src/lib/utils/logger';
import { WpButton } from '../../button';
import WpRichTextEditor from '../../htmlEditor';

type ActivityTab = 'all' | 'comments' | 'history';

interface ActivitySectionProps {
  items: ActivityItem[];
  taskId?: string;
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

export const ActivitySection = ({ items, taskId }: ActivitySectionProps) => {
  const [tab, setTab] = useState<ActivityTab>('all');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loadingRepliesFor, setLoadingRepliesFor] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!taskId || hasFetched.current) return;
    hasFetched.current = true;

    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const res = await taskService.getComments(taskId);
        if (res.data) setComments(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        logger.log('Failed to fetch comments', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [taskId]);

  const submitComment = (content: string, parentId?: string, onDone?: () => void) => {
    if (!taskId || !content.trim()) return;

    const trimmed = content.trim();
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: Comment = {
      id: tempId,
      content: trimmed,
      task_id: taskId,
      user_id: '',
      parent_comment_id: parentId ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optimistically & clear input immediately
    setComments((prev) =>
      parentId
        ? prev.map((c) =>
            c.id === parentId ? { ...c, replies: [...(c.replies ?? []), optimistic] } : c
          )
        : [...prev, optimistic]
    );
    onDone?.();

    setIsSubmitting(true);
    const payload = parentId
      ? { content: trimmed, parent_comment_id: parentId }
      : { content: trimmed };

    taskService
      .createComment(taskId, payload)
      .then(() => {
        // API only returns success message, optimistic comment stays as-is
      })
      .catch((error) => {
        logger.log('Failed to post comment', error);
        setComments((prev) =>
          parentId
            ? prev.map((c) =>
                c.id === parentId
                  ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== tempId) }
                  : c
              )
            : prev.filter((c) => c.id !== tempId)
        );
      })
      .finally(() => setIsSubmitting(false));
  };

  const toggleReplies = (commentId: string) => {
    if (!taskId) return;
    const comment = comments.find((c) => c.id === commentId);

    // If already expanded, just collapse
    if (replyingTo === commentId) {
      setReplyingTo(null);
      return;
    }

    // If replies already loaded, just open reply box
    if (comment?.replies && comment.replies.length > 0) {
      setReplyingTo(commentId);
      return;
    }

    // Fetch replies from API
    setLoadingRepliesFor(commentId);
    taskService
      .getReplies(taskId, commentId)
      .then((res) => {
        const replies = Array.isArray(res.data) ? res.data : [];
        setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replies } : c)));
        setReplyingTo(commentId);
      })
      .catch((error) => logger.log('Failed to fetch replies', error))
      .finally(() => setLoadingRepliesFor(null));
  };

  const saveEdit = async (commentId: string) => {
    if (!taskId || !editContent.trim()) return;
    const trimmed = editContent.trim();
    // Optimistically update content immediately
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) return { ...c, content: trimmed };
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => (r.id === commentId ? { ...r, content: trimmed } : r)),
          };
        }
        return c;
      })
    );
    setEditingId(null);
    try {
      await taskService.updateComment(taskId, commentId, { content: trimmed });
    } catch (error) {
      logger.log('Failed to update comment', error);
      // Revert on failure
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) return { ...c, content: editContent };
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId ? { ...r, content: editContent } : r
              ),
            };
          }
          return c;
        })
      );
    }
  };

  const historyItems = items.filter((i) => i.type === 'history');

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'comments', label: 'Comments' },
    { key: 'history', label: 'History' },
  ];

  const renderComment = (c: Comment, isReply = false) => {
    const name = c.user?.name ?? 'Unknown';
    const initials = getInitials(name);
    const isEditing = editingId === c.id;
    const isTemp = c.id.startsWith('temp-');

    return (
      <div key={c.id} className={`flex gap-3 ${isReply ? 'ml-8 mt-2' : ''}`}>
        <AssigneeAvatar initials={initials} color={colors.avatarBlue} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{name}</span>
            <span className="text-xs text-gray-400">{formatTime(c.created_at)}</span>
            <button
              onClick={() => {
                setEditingId(c.id);
                setEditContent(c.content);
              }}
              disabled={isTemp}
              className="ml-auto p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Pencil size={11} />
            </button>
          </div>
          {isEditing ? (
            <div className="mt-1.5 flex gap-1.5 items-end">
              <textarea
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:border-blue-500"
              />
              <button
                onClick={() => saveEdit(c.id)}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">
              {c.content}
            </p>
          )}
          {!isReply && (
            <button
              onClick={() => toggleReplies(c.id)}
              className="mt-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              {loadingRepliesFor === c.id
                ? 'Loading…'
                : replyingTo === c.id
                  ? 'Cancel'
                  : `Reply${c.replies?.length ? ` (${c.replies.length})` : ''}`}
            </button>
          )}
          {replyingTo === c.id && (
            <div className="mt-2 flex gap-2 items-end">
              <textarea
                autoFocus
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitComment(replyContent, c.id, () => {
                      setReplyContent('');
                      setReplyingTo(null);
                    });
                  }
                }}
                placeholder="Write a reply…"
                rows={2}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 pr-10 resize-none focus:outline-none focus:ring-2 focus:border-blue-500"
              />
              <button
                onClick={() =>
                  submitComment(replyContent, c.id, () => {
                    setReplyContent('');
                    setReplyingTo(null);
                  })
                }
                disabled={!replyContent.trim() || isSubmitting}
                className="p-1 rounded-lg transition-colors disabled:opacity-30"
                style={{ color: colors.primary }}
              >
                <Send size={14} />
              </button>
            </div>
          )}
          {c.replies?.map((r) => renderComment(r, true))}
        </div>
      </div>
    );
  };

  return (
    <section>
      <p className="text-base font-semibold text-gray-800 mb-3">Activity</p>

      <div className="flex items-center gap-1 mb-4 border-b border-gray-300 pb-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
            style={{
              backgroundColor: tab === tabItem.key ? colors.primaryLight : 'transparent',
              color: tab === tabItem.key ? colors.primary : colors.gray500,
              border: `1px solid ${tab === tabItem.key ? colors.primary : 'transparent'}`,
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-5">
        {isLoading && <p className="text-sm text-gray-400">Loading comments…</p>}

        {(tab === 'all' || tab === 'comments') &&
          !isLoading &&
          (comments.length === 0
            ? tab === 'comments' && <p className="text-sm text-gray-400">No comments yet.</p>
            : comments.map((c) => renderComment(c)))}

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

        {tab === 'all' && !isLoading && comments.length === 0 && historyItems.length === 0 && (
          <p className="text-sm text-gray-400">No activity yet.</p>
        )}
      </div>

      {(tab === 'all' || tab === 'comments') && (
        <div className="flex gap-2 items-start">
          <AssigneeAvatar initials="Y" color={colors.avatarIndigo} size="md" />

          <div className="flex-1 min-w-0">
            <WpRichTextEditor
              value={comment}
              onChange={setComment}
              placeholder="Add a comment..."
              minHeight="120px"
            />
            <div className="flex justify-end gap-2 mt-2">
              <WpButton
                type="button"
                variant="secondary"
                onClick={() => setComment('')}
                disabled={!comment}
              >
                Cancel
              </WpButton>
              <WpButton
                type="button"
                variant="primary"
                disabled={!comment.trim() || isSubmitting}
                onClick={() => {
                  submitComment(comment, undefined, () => setComment(''));
                }}
              >
                {isSubmitting ? 'Posting...' : 'Add Comment'}
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
