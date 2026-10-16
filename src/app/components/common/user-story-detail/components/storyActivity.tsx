'use client';

import { CornerDownRight, FileText, Pencil, Plus, Trash2, User } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import WpRichTextEditor from '../../htmlEditor';
import { RichContentViewer } from '../../rich-content-viewer';
import type { UserStoryReplyResponse } from '@/src/types/userstories';
import type { useGetUserStoryComments } from '@/src/modules/tasks/hooks/useUserStoryComments';
import type { useGetProjectActivities } from '@/src/modules/project/hooks/useProject';
import { WpButton } from '../../button';
import { AssigneeAvatar } from '../../task';

export type ActivityTab = 'all' | 'comments' | 'history' | 'childTickets';
type StoryComment = ReturnType<typeof useGetUserStoryComments>['comments'][number];
type StoryActivityItem = ReturnType<typeof useGetProjectActivities>['activities'][number];

// Same helpers the parent has (copied unchanged)
const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const AVATAR_COLORS = [
  colors.avatarBlue,
  colors.avatarGreen,
  colors.avatarPink,
  colors.avatarAmber,
  colors.avatarIndigo,
];

const getMemberColor = (userId: string) =>
  AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

export interface StoryActivityProps {
  tab: ActivityTab;
  setTab: (tab: ActivityTab) => void;
  tabs: Array<{ key: ActivityTab; label: string }>;

  permissions: {
    canCreateComment: boolean;
    canEditComments: boolean;
    canDeleteComments: boolean;
  };

  commentState: {
    showCommentEditor: boolean;
    setShowCommentEditor: (v: boolean) => void;
    comment: string;
    setComment: (v: string) => void;
    handleAddComment: () => void;
    isCreatingComment: boolean;
    handleCommentImageUpload: (file: File) => Promise<string>;
    comments: StoryComment[];
    isLoadingComments: boolean;
    reporterInitials: string;
    reporterColor: string;
    editingCommentId: string | null;
    setEditingCommentId: (id: string | null) => void;
    editingCommentContent: string;
    setEditingCommentContent: (v: string) => void;
    handleUpdateComment: (commentId: string) => void;
    isUpdatingComment: boolean;
    handleDeleteComment: (commentId: string) => void;
    deletingCommentId: string | null;
    handleDownloadCommentAttachment: (attachmentId: string) => void;
    handleDeleteCommentAttachment: (attachmentId: string) => void;
  };

  replyState: {
    handleToggleReplies: (commentId: string, userName: string) => void;
    showRepliesForComment: Set<string>;
    repliesMap: Map<string, UserStoryReplyResponse[]>;
    replyingToCommentId: string | null;
    setReplyingToCommentId: (id: string | null) => void;
    replyContent: string;
    setReplyContent: (v: string) => void;
    handleAddReply: (parentCommentId: string) => void;
    editingReplyId: string | null;
    setEditingReplyId: (id: string | null) => void;
    editingReplyContent: string;
    setEditingReplyContent: (v: string) => void;
    isUpdatingReply: boolean;
    handleUpdateReply: (replyId: string, parentCommentId: string) => void;
    handleDeleteReply: (replyId: string, parentCommentId: string) => void;
    deletingReplyId: string | null;
  };

  history: {
    activities?: StoryActivityItem[];
    isLoadingActivities: boolean;
  };
}

export const StoryActivity = ({
  tab,
  setTab,
  tabs,
  permissions,
  commentState,
  replyState,
  history,
}: StoryActivityProps) => {
  const { canCreateComment, canEditComments, canDeleteComments } = permissions;

  const {
    showCommentEditor,
    setShowCommentEditor,
    comment,
    setComment,
    handleAddComment,
    isCreatingComment,
    handleCommentImageUpload,
    comments,
    isLoadingComments,
    reporterInitials,
    reporterColor,
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
  } = commentState;

  const {
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
  } = replyState;

  const { activities, isLoadingActivities } = history;

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-3">Activity</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              tab === t.key
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
            style={{
              borderBottom: tab === t.key ? `2px solid ${colors.primary}` : undefined,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'comments' && (
        <div className="space-y-4">
          {/* Show editor only when true */}
          {showCommentEditor && canCreateComment && (
            <>
              <WpRichTextEditor
                value={comment}
                onChange={setComment}
                placeholder="Write a comment..."
                minHeight="120px"
                onImageUpload={handleCommentImageUpload}
              />

              <div className="flex items-center justify-end gap-2">
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
                  disabled={!comment.trim() || isCreatingComment}
                  onClick={handleAddComment}
                >
                  {isCreatingComment ? 'Adding...' : 'Add Comment'}
                </WpButton>
              </div>
            </>
          )}

          {/* Show this when editor is hidden */}
          {!showCommentEditor && canCreateComment && (
            <button
              type="button"
              onClick={() => setShowCommentEditor(true)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-3 text-left text-sm text-gray-400 dark:text-slate-500 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-500 dark:hover:text-slate-400"
            >
              Write a comment...
            </button>
          )}

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-slate-200">No comments yet</p>
              <p className="text-xs text-gray-400 dark:text-slate-200 mt-1">
                Be the first to comment
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {comments.map((commentItem) => (
                <div key={commentItem.id}>
                  <div className="flex gap-3 group">
                    <AssigneeAvatar initials={reporterInitials} color={reporterColor} size="sm" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {commentItem.user_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(commentItem.created_at).toLocaleString()}
                        </span>
                        {(canEditComments || canDeleteComments) &&
                          editingCommentId !== commentItem.id && (
                            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canEditComments && (
                                <button
                                  onClick={() => {
                                    setEditingCommentId(commentItem.id);
                                    setEditingCommentContent(commentItem.content);
                                  }}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                  title="Edit comment"
                                >
                                  <Pencil size={13} className="text-gray-500 dark:text-slate-400" />
                                </button>
                              )}
                              {canDeleteComments && (
                                <button
                                  onClick={() => handleDeleteComment(commentItem.id)}
                                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete comment"
                                  disabled={deletingCommentId === commentItem.id}
                                >
                                  <Trash2 size={13} className="text-red-500 dark:text-red-400" />
                                </button>
                              )}
                            </div>
                          )}
                      </div>

                      {editingCommentId === commentItem.id ? (
                        <div className="space-y-2">
                          <WpRichTextEditor
                            value={editingCommentContent}
                            onChange={setEditingCommentContent}
                            placeholder="Edit comment..."
                            minHeight="100px"
                            onImageUpload={handleCommentImageUpload}
                          />
                          <div className="flex items-center gap-2">
                            <WpButton
                              type="button"
                              variant="primary"
                              size="sm"
                              disabled={!editingCommentContent.trim() || isUpdatingComment}
                              onClick={() => handleUpdateComment(commentItem.id)}
                            >
                              {isUpdatingComment ? 'Saving...' : 'Save'}
                            </WpButton>
                            <WpButton
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingCommentContent('');
                              }}
                            >
                              Cancel
                            </WpButton>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2 relative group">
                            <RichContentViewer
                              content={commentItem.content}
                              className="text-sm text-gray-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
                              canDownload={true}
                              canDelete={canDeleteComments}
                              onDownloadImage={handleDownloadCommentAttachment}
                              onDeleteImage={handleDeleteCommentAttachment}
                            />
                          </div>

                          {/* Reply Button */}
                          {canCreateComment && (
                            <div className="mt-2">
                              <button
                                onClick={() =>
                                  handleToggleReplies(
                                    commentItem.id,
                                    commentItem.user_name || 'User'
                                  )
                                }
                                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                <CornerDownRight size={14} />
                                <span>Reply</span>
                                {commentItem.replies_count > 0 && (
                                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    ({commentItem.replies_count})
                                  </span>
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Replies Section */}
                      {showRepliesForComment.has(commentItem.id) && (
                        <div className="mt-4 ml-4 border-l-2 border-gray-200 dark:border-slate-700 pl-4 space-y-4">
                          {/* Display Replies First */}
                          {repliesMap.get(commentItem.id) &&
                            repliesMap.get(commentItem.id)!.length > 0 && (
                              <div className="space-y-3">
                                {repliesMap
                                  .get(commentItem.id)!
                                  .map((reply: UserStoryReplyResponse) => (
                                    <div key={reply.id} className="flex gap-2">
                                      <AssigneeAvatar
                                        initials={
                                          reply.user_name
                                            ? reply.user_name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)
                                            : 'UN'
                                        }
                                        color={getMemberColor(reply.user_id)}
                                        size="md"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                                            {reply.user_name || 'Unknown User'}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-slate-400">
                                            {new Date(reply.created_at).toLocaleString()}
                                          </span>
                                        </div>

                                        {editingReplyId === reply.id ? (
                                          <div className="space-y-2">
                                            <WpRichTextEditor
                                              value={editingReplyContent}
                                              onChange={setEditingReplyContent}
                                              placeholder="Edit reply..."
                                              minHeight="80px"
                                              onImageUpload={handleCommentImageUpload}
                                            />
                                            <div className="flex items-center gap-2">
                                              <WpButton
                                                type="button"
                                                variant="primary"
                                                size="sm"
                                                disabled={
                                                  !editingReplyContent.trim() || isUpdatingReply
                                                }
                                                onClick={() =>
                                                  handleUpdateReply(reply.id, commentItem.id)
                                                }
                                              >
                                                {isUpdatingReply ? 'Saving...' : 'Save'}
                                              </WpButton>
                                              <WpButton
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                  setEditingReplyId(null);
                                                  setEditingReplyContent('');
                                                }}
                                              >
                                                Cancel
                                              </WpButton>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-slate-700 relative group">
                                            <RichContentViewer
                                              content={reply.content}
                                              className="text-xs text-gray-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
                                              canDownload={true}
                                              canDelete={canDeleteComments}
                                              onDownloadImage={handleDownloadCommentAttachment}
                                              onDeleteImage={handleDeleteCommentAttachment}
                                            />
                                            {(canEditComments || canDeleteComments) && (
                                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                {canEditComments && (
                                                  <button
                                                    onClick={() => {
                                                      setEditingReplyId(reply.id);
                                                      setEditingReplyContent(reply.content);
                                                    }}
                                                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                    title="Edit reply"
                                                  >
                                                    <Pencil size={12} className="text-gray-600" />
                                                  </button>
                                                )}
                                                {canDeleteComments && (
                                                  <button
                                                    onClick={() =>
                                                      handleDeleteReply(reply.id, commentItem.id)
                                                    }
                                                    className="p-1 rounded hover:bg-red-100 transition-colors"
                                                    title="Delete reply"
                                                    disabled={deletingReplyId === reply.id}
                                                  >
                                                    <Trash2 size={12} className="text-red-600" />
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                          {/* Reply Input After existing replies */}
                          {replyingToCommentId === commentItem.id && canCreateComment && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <CornerDownRight size={12} />
                                <span>
                                  Replying to{' '}
                                  <span className="font-semibold text-gray-700">
                                    {commentItem.user_name || 'User'}
                                  </span>
                                </span>
                              </div>
                              <WpRichTextEditor
                                value={replyContent}
                                onChange={setReplyContent}
                                placeholder="Write a reply..."
                                minHeight="80px"
                                onImageUpload={handleCommentImageUpload}
                              />
                              <div className="flex items-center gap-2">
                                <WpButton
                                  type="button"
                                  variant="primary"
                                  size="sm"
                                  disabled={!replyContent.trim() || isCreatingComment}
                                  onClick={() => handleAddReply(commentItem.id)}
                                >
                                  {isCreatingComment ? 'Replying...' : 'Reply'}
                                </WpButton>
                                <WpButton
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingToCommentId(null);
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {isLoadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="relative space-y-0">
              {/* Timeline Line */}
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-gray-200 dark:from-blue-800 dark:via-purple-800 dark:to-slate-700" />

              {activities.map((activity) => {
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
                  activityIcon = <Plus size={12} className="text-green-600 dark:text-green-400" />;
                  badgeColor =
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
                } else if (action === 'updated' || action === 'changed') {
                  activityIcon = <Pencil size={12} className="text-blue-600 dark:text-blue-400" />;
                  badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                } else if (action === 'deleted') {
                  activityIcon = <Trash2 size={12} className="text-red-600 dark:text-red-400" />;
                  badgeColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                } else if (resourceType === 'comment') {
                  activityIcon = (
                    <FileText size={12} className="text-purple-600 dark:text-purple-400" />
                  );
                  badgeColor =
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
                } else if (
                  resourceType === 'user_story_attachment' ||
                  resourceType === 'task_attachment'
                ) {
                  activityIcon = (
                    <FileText size={12} className="text-amber-600 dark:text-amber-400" />
                  );
                  badgeColor =
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
                } else {
                  activityIcon = <User size={12} className="text-gray-600 dark:text-gray-400" />;
                }

                if (activity.details) {
                  const changeMatch = activity.details.match(/:\s*(.+) changed from (.+) to (.+)$/);
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
                            dangerouslySetInnerHTML={{ __html: commentMatch[1] }}
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
                  } else if (activity.resource_type === 'user_story_attachment') {
                    titleAction = `uploaded an attachment`;
                    changeText = (
                      <div className="mt-2.5 p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30 text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                        <FileText
                          size={14}
                          className="text-amber-600 dark:text-amber-400 shrink-0"
                        />
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
                  <div key={activity.id} className="relative flex gap-4 pb-6 group">
                    {/* Timeline Node */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md ring-4 ring-white dark:ring-slate-900 transition-all group-hover:shadow-lg group-hover:scale-105"
                        style={{ backgroundColor: userColor }}
                      >
                        {userInitials}
                      </div>
                      {/* Action Badge */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-slate-900">
                        <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                          {activityIcon}
                        </div>
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
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shrink-0 ${badgeColor}`}
                          >
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
                <FileText size={28} className="text-gray-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                No history yet
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Changes will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
