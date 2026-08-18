'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ChevronDown,
  Check,
  FileText,
  X,
  User,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  CornerDownRight,
} from 'lucide-react';
import type { Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../task';
import { DetailRow } from '../task-detail/components/detail-row';
import {
  EditableDate,
  EditableNumber,
  EditablePriority,
} from '../task-detail/components/editable-fields';
import { useResize } from '@/src/hooks/useResize';
import { userStoryService } from '@/src/services/userstory';
import { logger } from '@/src/lib/utils/logger';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useGetUserStoryById } from '@/src/modules/tasks/hooks/useUserStory';
import { WpButton } from '../button';
import { WpInput } from '../input';
import { UserStoryResponse, UserStoryReplyResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { TaskDetailDrawer } from '../task-detail';
import { KanbanTask, ColumnId } from '@/src/types/board';
import WpRichTextEditor from '../htmlEditor';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { useGetStatus, useDeleteStatus } from '@/src/modules/project/hooks/useLabels';
import StatusModal from '../task-detail/components/StatusModal';
import { CustomStatus } from '@/src/types/colors';
import {
  useCreateUserStoryComment,
  useGetUserStoryComments,
  useUpdateUserStoryComment,
  useDeleteUserStoryComment,
  useGetUserStoryReplies,
} from '@/src/modules/tasks/hooks/useUserStoryComments';
import { userStoryCommentService } from '@/src/services/userstoryComments';
import toast from 'react-hot-toast';
import {
  useUploadUserStoryAttachment,
  useGetUserStoryAttachments,
  useDownloadUserStoryAttachment,
  useDeleteUserStoryAttachment,
} from '@/src/modules/tasks/hooks/useUserStoryAttachment';

import { useUpdateTask } from '@/src/modules/tasks/hooks/useTask';
// import WorkflowModal from '../task-detail/components/WorkflowModal';
export interface UserStoryDetailDrawerProps {
  userStory: UserStoryResponse;
  onClose: () => void;
  onUpdate?: () => void;
  onCreateTask?: () => void;
  onDelete?: () => void;
}

type ActivityTab = 'all' | 'comments' | 'history' | 'childTickets';

// const STATUS_OPTIONS = [
//   {
//     value: 'todo',
//     label: 'To Do',
//     color: colors.colTodo,
//     bg: colors.colTodoBg,
//     dot: colors.colTodo,
//   },
//   {
//     value: 'in_progress',
//     label: 'In Progress',
//     color: colors.colInProgress,
//     bg: colors.colInProgressBg,
//     dot: colors.colInProgress,
//   },
//   {
//     value: 'in_review',
//     label: 'In Review',
//     color: colors.colInReview,
//     bg: colors.colInReviewBg,
//     dot: colors.colInReview,
//   },
//   {
//     value: 'testing',
//     label: 'Testing',
//     color: colors.colTesting,
//     bg: colors.colTestingBg,
//     dot: colors.colTesting,
//   },
//   {
//     value: 'done',
//     label: 'Done',
//     color: colors.colDone,
//     bg: colors.colDoneBg,
//     dot: colors.colDone,
//   },
//   {
//     value: 'blocked',
//     label: 'Blocked',
//     color: colors.colBlocked,
//     bg: colors.colBlockedBg,
//     dot: colors.colBlocked,
//   },
// ];

// const STATUS_CONFIG = Object.fromEntries(STATUS_OPTIONS.map((opt) => [opt.value, opt]));

const useResizable = (initial: number, min: number, max: number) => {
  const [width, setWidth] = useState(initial);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      dragging.current = true;
      const startX = event.clientX;
      const startWidth = width;

      const onMove = (moveEvent: MouseEvent) => {
        if (!dragging.current) return;
        const delta = startX - moveEvent.clientX;
        setWidth(Math.min(max, Math.max(min, startWidth + delta)));
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [width, min, max]
  );

  return { width, onMouseDown };
};

export const UserStoryDetailDrawer = ({
  userStory: initialUserStory,
  onClose,
  onUpdate,
  onCreateTask,
  onDelete,
}: UserStoryDetailDrawerProps) => {
  const [tab, setTab] = useState<ActivityTab>('all');
  const [showCommentEditor, setShowCommentEditor] = useState(true);

  // Use the hook to fetch user story data - this will auto-refresh when query is invalidated
  const { userStory: fetchedUserStory, isLoadingUserStory } = useGetUserStoryById(
    initialUserStory.project_id ?? '',
    initialUserStory.id
  );

  // Use fetched data if available, otherwise fall back to initial prop
  const currentUserStory = fetchedUserStory || initialUserStory;
  const projectId = currentUserStory.project_id ?? '';
  const userStoryId = currentUserStory.id;

  const { attachments, isLoadingAttachments } = useGetUserStoryAttachments(projectId, userStoryId);

  const { uploadUserStoryAttachmentAsync, isUploadingUserStoryAttachment } =
    useUploadUserStoryAttachment(projectId);
  const { downloadAttachment, isDownloadingAttachment } = useDownloadUserStoryAttachment(
    projectId,
    userStoryId
  );

  const { deleteAttachmentAsync, isDeletingAttachment } = useDeleteUserStoryAttachment(
    projectId,
    userStoryId
  );
  // Only keep editable fields in local state to avoid cascading renders
  const [editableFields, setEditableFields] = useState({
    title: currentUserStory.title,
    description: currentUserStory.description ?? '',
  });

  

  // Derive non-editable fields directly from currentUserStory - no state needed
  const userStoryData = useMemo(() => {
    const assigneeName = currentUserStory.assignee_name ?? currentUserStory.reporter_name ?? '';
    const assigneeInitials = assigneeName
      ? assigneeName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

    return {
      ...editableFields, // Use local state for editable fields
      priority: currentUserStory.priority
        ? ((currentUserStory.priority.charAt(0).toUpperCase() +
            currentUserStory.priority.slice(1).toLowerCase()) as Priority)
        : ('Medium' as Priority),
      status: currentUserStory.status ?? '',
      storyPoints: currentUserStory.story_points ?? 0,
      assigneeId: currentUserStory.assignee_id ?? '',
      assigneeName: assigneeName,
      assigneeInitials: assigneeInitials,
      sprintId: currentUserStory.sprint_id ?? '',
      due_date: currentUserStory.due_date ?? currentUserStory.tasks?.[0]?.due_date ?? '',
      start_date: currentUserStory.start_date ?? currentUserStory.tasks?.[0]?.created_at ?? '',
    };
  }, [currentUserStory, editableFields]);

  // Update editable fields only when the user story ID changes (new user story loaded)
  const userStoryIdRef = useRef(currentUserStory.id);
  useEffect(() => {
    if (userStoryIdRef.current !== currentUserStory.id) {
      userStoryIdRef.current = currentUserStory.id;
      setEditableFields({
        title: currentUserStory.title,
        description: currentUserStory.description ?? '',
      });
    }
  }, [currentUserStory.id, currentUserStory.title, currentUserStory.description]);

  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [childAssigneeTaskId, setChildAssigneeTaskId] = useState<string | null>(null);
  const [childAssigneeSearch, setChildAssigneeSearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [sprintSearch, setSprintSearch] = useState('');
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [selectedSprintName, setSelectedSprintName] = useState('');

  const debouncedSprintSearch = useDebounce(sprintSearch, 500);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 500);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const debouncedChildAssigneeSearch = useDebounce(childAssigneeSearch, 500);
  const [statusModalMode, setStatusModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedStatus, setSelectedStatus] = useState<CustomStatus | null>(null);
  const [childStatusTaskId, setChildStatusTaskId] = useState<string | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  
  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    { page: 1, page_size: 10, name: debouncedAssigneeSearch },
    showAssigneeMenu
  );

  const { data: customStatuses = [] } = useGetStatus(currentUserStory.project_id ?? '');
  const {
    mutateAsync: deleteStatus,
    isPending: isDeletingStatus,
  } = useDeleteStatus();

  // Comment hooks
  const { createCommentAsync, isCreatingComment } = useCreateUserStoryComment(
    currentUserStory.project_id ?? '',
    currentUserStory.id
  );
  const { comments, isLoadingComments } = useGetUserStoryComments(
    currentUserStory.project_id ?? '',
    currentUserStory.id,
    { page: 1, page_size: 50 },
    true
  );
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const { updateCommentAsync, isUpdatingComment } = useUpdateUserStoryComment(
    currentUserStory.project_id ?? '',
    currentUserStory.id,
    editingCommentId ?? ''
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const { deleteCommentAsync, isDeletingComment } = useDeleteUserStoryComment(
    currentUserStory.project_id ?? '',
    currentUserStory.id,
    deletingCommentId ?? ''
  );

  // Reply functionality
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showRepliesForComment, setShowRepliesForComment] = useState<Set<string>>(new Set());
  const [repliesMap, setRepliesMap] = useState<Map<string, UserStoryReplyResponse[]>>(new Map());
  
  // Reply edit/delete state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  
  // Hooks for reply update/delete
  const { updateCommentAsync: updateReplyAsync, isUpdatingComment: isUpdatingReply } = useUpdateUserStoryComment(
    currentUserStory.project_id ?? '',
    currentUserStory.id,
    editingReplyId ?? ''
  );
  const { deleteCommentAsync: deleteReplyAsync, isDeletingComment: isDeletingReply } = useDeleteUserStoryComment(
    currentUserStory.project_id ?? '',
    currentUserStory.id,
    deletingReplyId ?? ''
  );

  const { sprints, isLoadingSprints, isFetchingSprints } = useGetSprints(
    currentUserStory.project_id ?? '',
    {
      page: 1,
      page_size: 10,
      search: debouncedSprintSearch,
    },
    true
  );

  const assigneeMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const sprintMenuRef = useRef<HTMLDivElement>(null);
  const childAssigneeMenuRef = useRef<HTMLDivElement>(null);
  const {
    members: childAssigneeMembers,
    isLoadingMembers: isLoadingChildAssignees,
    isFetchingMembers: isFetchingChildAssignees,
  } = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    {
      page: 1,
      page_size: 10,
      name: debouncedChildAssigneeSearch,
    },
    !!childAssigneeTaskId
  );

  const { updateTaskAsync, isUpdatingTask } = useUpdateTask();

  const { width: screenWidth } = useResize();
  const isMobile = screenWidth < 640;
  const [mobileTab, setMobileTab] = useState<'content' | 'details'>('content');
  const { width: rightWidth, onMouseDown: onDividerMouseDown } = useResizable(320, 240, 480);

  const handleUpdate = useCallback(
    async (patch: Partial<typeof userStoryData>) => {
      if (!currentUserStory.project_id || !currentUserStory.id) return;

      const previousEditableFields = { ...editableFields };

      // Update local editable fields immediately for optimistic updates
      if (patch.title !== undefined || patch.description !== undefined) {
        setEditableFields((prev) => ({
          ...prev,
          ...(patch.title !== undefined && { title: patch.title }),
          ...(patch.description !== undefined && { description: patch.description }),
        }));
      }

      const payload: Record<string, unknown> = {};
      if (patch.title !== undefined) payload.title = patch.title;
      if (patch.description !== undefined) payload.description = patch.description;
      if (patch.priority !== undefined) payload.priority = patch.priority.toLowerCase();
      if (patch.status !== undefined) payload.status_id = patch.status;
      if (patch.storyPoints !== undefined) payload.story_points = patch.storyPoints;
      if (patch.assigneeId !== undefined) payload.assignee_id = patch.assigneeId || undefined;
      if (patch.sprintId !== undefined) payload.sprint_id = patch.sprintId || null;
      if (patch.start_date !== undefined) {
        payload.start_date = patch.start_date || null;
      }
      if (patch.due_date !== undefined) {
        payload.due_date = patch.due_date || null;
      }

      try {
        setIsSaving(true);
        await userStoryService.updateUserStory(
          currentUserStory.project_id,
          currentUserStory.id,
          payload
        );
        onUpdate?.();
      } catch (error) {
        logger.log('Failed to update user story', error);
        // Revert editable fields on error
        setEditableFields(previousEditableFields);
      } finally {
        setIsSaving(false);
      }
    },
    [currentUserStory.project_id, currentUserStory.id, onUpdate, editableFields]
  );

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target as Node)) {
        setShowAssigneeMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
  const handleDeleteStatus = async (status: CustomStatus) => {
    if (!status.id) return;

    try {
      await deleteStatus({
        projectId: currentUserStory.project_id ?? '',
        statusId: status.id,
      });

      setShowStatusMenu(false);
      onUpdate?.();
    } catch (error) {
      logger.log('Failed to delete custom status', error);
    }
  };
  const getMemberColor = (userId: string) =>
    AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

  // Comment handlers
  const handleAddComment = async () => {
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
  };

  const handleUpdateComment = async (commentId: string) => {
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
  };

  const handleDeleteComment = async (commentId: string) => {
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
  };

  // Reply handlers
  const handleToggleReplies = async (commentId: string, userName: string) => {
    const newShowReplies = new Set(showRepliesForComment);
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId);
      setReplyingToCommentId(null);
      setReplyContent(''); // Clear mention when closing
    } else {
      newShowReplies.add(commentId);
      setReplyingToCommentId(commentId);
      
      // Set initial mention with @username
      const mention = `<span class="mention" data-type="mention" data-id="${userName}">@${userName}</span>&nbsp;`;
      setReplyContent(mention);
      
      // Fetch replies for this comment if not already fetched
      if (!repliesMap.has(commentId)) {
        try {
          const response = await userStoryCommentService.getReplies(
            currentUserStory.project_id ?? '',
            currentUserStory.id,
            commentId,
            { page: 1, page_size: 50 }
          );
          setRepliesMap(new Map(repliesMap.set(commentId, response.data ?? [])));
        } catch (error) {
          logger.log('Failed to fetch replies', error);
          toast.error('Failed to load replies');
        }
      }
    }
    setShowRepliesForComment(newShowReplies);
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      await createCommentAsync({ 
        content: replyContent,
        parent_comment_id: parentCommentId 
      });
      setReplyContent('');
      setReplyingToCommentId(null); // Close the reply editor
      toast.success('Reply added successfully');
      
      // Refetch replies for this comment
      try {
        const response = await userStoryCommentService.getReplies(
          currentUserStory.project_id ?? '',
          currentUserStory.id,
          parentCommentId,
          { page: 1, page_size: 50 }
        );
        setRepliesMap(new Map(repliesMap.set(parentCommentId, response.data ?? [])));
      } catch (error) {
        logger.log('Failed to refresh replies', error);
      }
    } catch (error) {
      toast.error('Failed to add reply');
      logger.log('Failed to add reply', error);
    }
  };

  const handleCancelReply = () => {
    setReplyContent('');
    setReplyingToCommentId(null);
  };

  // Reply edit/delete handlers
  const handleUpdateReply = async (replyId: string, parentCommentId: string) => {
    if (!editingReplyContent.trim()) return;
    
    try {
      await updateReplyAsync({ content: editingReplyContent });
      setEditingReplyId(null);
      setEditingReplyContent('');
      toast.success('Reply updated successfully');
      
      // Refetch replies for this comment
      try {
        const response = await userStoryCommentService.getReplies(
          currentUserStory.project_id ?? '',
          currentUserStory.id,
          parentCommentId,
          { page: 1, page_size: 50 }
        );
        setRepliesMap(new Map(repliesMap.set(parentCommentId, response.data ?? [])));
      } catch (error) {
        logger.log('Failed to refresh replies', error);
      }
    } catch (error) {
      toast.error('Failed to update reply');
      logger.log('Failed to update reply', error);
    }
  };

  const handleDeleteReply = async (replyId: string, parentCommentId: string) => {
    try {
      setDeletingReplyId(replyId);
      await deleteReplyAsync();
      toast.success('Reply deleted successfully');
      setDeletingReplyId(null);
      
      // Refetch replies for this comment
      try {
        const response = await userStoryCommentService.getReplies(
          currentUserStory.project_id ?? '',
          currentUserStory.id,
          parentCommentId,
          { page: 1, page_size: 50 }
        );
        setRepliesMap(new Map(repliesMap.set(parentCommentId, response.data ?? [])));
      } catch (error) {
        logger.log('Failed to refresh replies', error);
      }
    } catch (error) {
      toast.error('Failed to delete reply');
      logger.log('Failed to delete reply', error);
      setDeletingReplyId(null);
    }
  };

  const mapTaskToDrawerTask = (task: TaskResponse): KanbanTask => ({
    id: task.key ?? '',
    taskId: task.id ?? '',
    projectId: task.project_id ?? '',
    title: task.title ?? '',
    status: task.status ?? '',
    columnId: (task.status ?? 'todo') as ColumnId,
    description: task.description ?? '',
    priority: task.priority
      ? ((task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
      : 'Medium',
    labels: [],
    dueDate: task.due_date ?? '',
    startDate: task.start_date ?? '',
    storyPoints: task.story_points ?? 0,
    sprint: task.sprint_name ?? '',
    parent: '',
    subtasks: [],
    assigneeInitials: task.assignee_name ? task.assignee_name.substring(0, 2).toUpperCase() : 'UN',
    assigneeColor: '#3B82F6',
    reporter: '',
    reporterInitials: '',
    reporterColor: undefined,
    activity: [],
  });

  const tasks = currentUserStory.tasks ?? [];
  const totalTasks = currentUserStory.total_tasks ?? 0;
  const completedTasks = currentUserStory.completed_tasks ?? 0;

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'comments', label: 'Comments' },
    { key: 'history', label: 'History' },
  ];
  const allStatusOptions = [...customStatuses]
    .sort((a, b) => a.display_order - b.display_order)
    .map((status) => ({
      value: status.id,
      label: status.name,
      color: status.color,
      bg: `${status.color}18`,
      dot: status.color,
      display_order: status.display_order,
    }));

  const allStatusConfig = Object.fromEntries(
    allStatusOptions.map((option) => [option.value, option])
  );
  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await uploadUserStoryAttachmentAsync({ userStoryId, file });
    } catch (error) {
      logger.log('Failed to upload user story attachment', error);
    } finally {
      event.target.value = '';
    }
  };
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-3"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      >
        <div
          className="relative bg-white w-full sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
          style={{ maxWidth: '1100px', height: 'min(860px, 94vh)' }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <FileText size={13} className="text-white" />
              </span>
              <span className="text-base font-bold text-blue-600">User Story</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Three-dot menu */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <MoreHorizontal size={17} />
                </button>
                {showMoreMenu && (
                  <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        setEditingTitle(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Pencil size={14} />
                      Update
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Mobile tab switcher */}
          <div className="flex sm:hidden border-b border-gray-200 shrink-0">
            <button
              onClick={() => setMobileTab('content')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileTab === 'content'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setMobileTab('details')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Details
            </button>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {isLoadingUserStory && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              </div>
            )}

            {/* Left Column - Content */}
            <div
              className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 border-r border-gray-200 ${
                mobileTab === 'details' ? 'hidden sm:block' : 'block'
              }`}
            >
              {editingTitle ? (
                <div className="mb-5">
                  <input
                    autoFocus
                    value={userStoryData.title}
                    onChange={(event) =>
                      setEditableFields((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="w-full text-2xl font-bold text-gray-900 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:border-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingTitle(false);
                        handleUpdate({ title: userStoryData.title });
                      }}
                      disabled={isSaving}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditableFields((prev) => ({ ...prev, title: currentUserStory.title }));
                        setEditingTitle(false);
                      }}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 mb-5 leading-snug">
                  {userStoryData.title}
                </h1>
              )}

              {/* Description Section */}
              <section className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-base font-semibold text-gray-800 mb-2">Description</p>
                {editingDesc ? (
                  <div>
                    <WpRichTextEditor
                      value={userStoryData.description}
                      onChange={(value) =>
                        setEditableFields((prev) => ({
                          ...prev,
                          description: value,
                        }))
                      }
                      placeholder="Add a description..."
                      minHeight="180px"
                    />

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingDesc(false);
                          handleUpdate({
                            description: userStoryData.description,
                          });
                        }}
                        disabled={isSaving}
                        className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditableFields((prev) => ({
                            ...prev,
                            description: currentUserStory.description ?? '',
                          }));
                          setEditingDesc(false);
                        }}
                        className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingDesc(true)}
                    className="text-sm text-gray-600 leading-relaxed cursor-text rounded-lg px-3 py-2.5 -mx-3 hover:bg-gray-50 transition-colors min-h-[48px]"
                  >
                    {userStoryData.description ? (
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: userStoryData.description,
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">Add a description…</span>
                    )}
                  </div>
                )}
              </section>

              {/* Attachments Section - Placeholder */}
              {/* Attachments Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Attachments</p>

                  <label
                    htmlFor="user-story-attachment"
                    className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors ${
                      isUploadingUserStoryAttachment ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    <Plus size={14} />
                    {isUploadingUserStoryAttachment ? 'Uploading...' : 'Add'}
                  </label>

                  <input
                    id="user-story-attachment"
                    type="file"
                    className="hidden"
                    onChange={handleAttachmentUpload}
                    disabled={isUploadingUserStoryAttachment}
                  />
                </div>

                {isLoadingAttachments ? (
                  <div className="border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center">
                    <p className="text-sm text-gray-500">Loading attachments...</p>
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center bg-white">
                    <p className="text-sm text-gray-500">No attachments</p>

                    <p className="text-xs text-gray-400 mt-1">Add files to this user story</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText size={18} className="text-blue-600 shrink-0" />

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {attachment.original_filename}
                            </p>

                            <p className="text-xs text-gray-400">
                              {attachment.file_size
                                ? `${Math.round(attachment.file_size / 1024)} KB`
                                : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isDownloadingAttachment}
                            onClick={async () => {
                              try {
                                const blob = await downloadAttachment.mutateAsync(attachment.id);

                                const url = window.URL.createObjectURL(blob);

                                const link = document.createElement('a');
                                link.href = url;
                                link.download = attachment.original_filename;
                                document.body.appendChild(link);
                                link.click();
                                link.remove();

                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                logger.log('Failed to download attachment', error);
                              }
                            }}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          >
                            Download
                          </button>

                          <button
                            type="button"
                            disabled={isDeletingAttachment}
                            onClick={async () => {
                              try {
                                await deleteAttachmentAsync(attachment.id);
                              } catch (error) {}
                            }}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Child Tickets Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Child Tickets ({totalTasks})
                  </p>
                  {onCreateTask && (
                    <button
                      onClick={onCreateTask}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center bg-white">
                    <p className="text-sm text-gray-500">No tasks associated</p>
                    <p className="text-xs text-gray-400 mt-1">Create tasks to track work</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-visible bg-white">
                    {' '}
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                            Work
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                            Assignee
                          </th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tasks.map((task) => (
                          <tr
                            key={task.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            {/* Work Column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="shrink-0 text-blue-600 hover:underline font-medium"
                                  onClick={() => setSelectedTask(mapTaskToDrawerTask(task))}
                                >
                                  {task.key}
                                </span>
                                <span className="text-gray-900 truncate">{task.title}</span>
                              </div>
                            </td>

                            {/* Priority Column */}
                            <td className="px-4 py-3">
                              <span className="text-gray-700 capitalize">
                                {task.priority || 'Medium'}
                              </span>
                            </td>

                            {/* Assignee Column */}
                            <td className="px-4 py-3">
                              <div
                                className="relative"
                                ref={
                                  childAssigneeTaskId === task.id ? childAssigneeMenuRef : undefined
                                }
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    if (childAssigneeTaskId === task.id) {
                                      setChildAssigneeTaskId(null);
                                      setChildAssigneeSearch('');
                                    } else {
                                      setChildAssigneeTaskId(task.id ?? null);
                                      setChildAssigneeSearch('');
                                    }
                                  }}
                                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                                >
                                  {task.assignee_id ? (
                                    <AssigneeAvatar
                                      initials={
                                        task.assignee_name
                                          ? task.assignee_name
                                              .split(' ')
                                              .map((name) => name[0])
                                              .join('')
                                              .slice(0, 2)
                                              .toUpperCase()
                                          : 'UN'
                                      }
                                      color={getMemberColor(task.assignee_id)}
                                      size="sm"
                                    />
                                  ) : (
                                    <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                      <User size={12} className="text-gray-400" />
                                    </span>
                                  )}

                                  <span className="text-sm text-gray-700 truncate">
                                    {task.assignee_name || 'Unassigned'}
                                  </span>

                                  <ChevronDown
                                    size={12}
                                    className="ml-auto text-gray-400 shrink-0"
                                  />
                                </button>

                                {childAssigneeTaskId === task.id && (
                                  <div
                                    className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Search */}
                                    <div className="p-2 border-b border-gray-200">
                                      <WpInput
                                        value={childAssigneeSearch}
                                        onChange={(e) => setChildAssigneeSearch(e.target.value)}
                                        placeholder="Search assignee..."
                                        autoFocus
                                      />
                                    </div>

                                    {/* Loading */}
                                    {(isLoadingChildAssignees || isFetchingChildAssignees) && (
                                      <div className="px-3 py-3 text-sm text-gray-500 text-center">
                                        Searching...
                                      </div>
                                    )}

                                    {/* Members */}
                                    {!isLoadingChildAssignees &&
                                      !isFetchingChildAssignees &&
                                      childAssigneeMembers?.map((m) => {
                                        const name = m.full_name ?? m.user?.name ?? '';

                                        const displayName =
                                          name ||
                                          m.user?.email?.split('@')[0] ||
                                          m.user?.email ||
                                          'Unknown User';

                                        const initials = getInitials(
                                          name || m.user?.email?.split('@')[0] || 'U'
                                        );

                                        const color = getMemberColor(m.user_id);

                                        return (
                                          <WpButton
                                            key={m.user_id}
                                            type="button"
                                            variant="ghost"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              try {
                                                await updateTaskAsync({
                                                  projectId: currentUserStory.project_id ?? '',
                                                  taskId: task.id ?? '',
                                                  payload: {
                                                    assignee_id: m.user_id,
                                                  },
                                                });

                                                setChildAssigneeTaskId(null);
                                                setChildAssigneeSearch('');
                                              } catch (error) {
                                                logger.log(
                                                  'Failed to update child ticket assignee',
                                                  error
                                                );
                                              }
                                            }}
                                            disabled={isUpdatingTask}
                                            className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 text-gray-900"
                                          >
                                            <AssigneeAvatar
                                              initials={initials}
                                              color={color}
                                              size="sm"
                                            />

                                            <span className="truncate">{displayName}</span>

                                            {m.user_id === task.assignee_id && (
                                              <Check
                                                size={12}
                                                className="ml-auto text-blue-600 shrink-0"
                                              />
                                            )}
                                          </WpButton>
                                        );
                                      })}

                                    {/* Unassigned */}
                                    {!isLoadingChildAssignees &&
                                      !isFetchingChildAssignees &&
                                      !childAssigneeSearch && (
                                        <WpButton
                                          type="button"
                                          variant="ghost"
                                          onClick={async (e) => {
                                            e.stopPropagation();

                                            // Use your existing task update API here
                                            // await updateTask(...)

                                            setChildAssigneeTaskId(null);
                                            setChildAssigneeSearch('');
                                          }}
                                          className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm text-gray-500 hover:bg-gray-50"
                                        >
                                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                            <User size={11} className="text-gray-400" />
                                          </span>
                                          Unassigned
                                        </WpButton>
                                      )}

                                    {/* No results */}
                                    {!isLoadingChildAssignees &&
                                      !isFetchingChildAssignees &&
                                      childAssigneeSearch &&
                                      childAssigneeMembers?.length === 0 && (
                                        <div className="px-3 py-3 text-sm text-gray-500 text-center">
                                          No users found
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="px-4 py-3">
                              <div className="relative">
                                {(() => {
                                  const currentStatus = allStatusConfig[task.status];
                                  return (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (childStatusTaskId === task.id) {
                                            setChildStatusTaskId(null);
                                          } else {
                                            setChildStatusTaskId(task.id ?? null)
                                          }
                                        }}
                                        disabled={isUpdatingTask}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold w-full justify-between transition-all shadow-sm border"
                                        style={{
                                          color: currentStatus?.color || colors.colTodo,
                                          backgroundColor: currentStatus?.bg || colors.colTodoBg,
                                          borderColor: `${currentStatus?.dot || colors.colTodo}55`,
                                        }}
                                      >
                                        <span className="flex items-center gap-2 min-w-0">
                                          <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{
                                              backgroundColor: currentStatus?.dot || colors.colTodo,
                                            }}
                                          />

                                          <span className="truncate">
                                            {currentStatus?.label || 'To Do'}
                                          </span>
                                        </span>

                                        <ChevronDown size={13} className="shrink-0" />
                                      </button>
                                      {childStatusTaskId === task.id && (
                                        <div
                                          className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[99999] overflow-hidden"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {allStatusOptions.map((option) => (
                                            <button
                                              key={option.value}
                                              type="button"
                                              disabled={isUpdatingTask}
                                              onClick={async (e) => {
                                                e.stopPropagation();

                                                try {
                                                  await updateTaskAsync({
                                                    projectId: currentUserStory.project_id ?? '',
                                                    taskId: task.id ?? '',
                                                    payload: {
                                                      status_id: option.value,
                                                    },
                                                  });

                                                  setChildStatusTaskId(null);
                                                } catch (error) {
                                                  logger.log(
                                                    'Failed to update child ticket status',
                                                    error
                                                  );
                                                }
                                              }}
                                              className="w-full text-left px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 hover:bg-gray-50 disabled:opacity-50"
                                              style={{
                                                fontWeight:
                                                  option.value === task.status ? 700 : 500,
                                                color: option.color,
                                                backgroundColor:
                                                  option.value === task.status
                                                    ? option.bg
                                                    : undefined,
                                              }}
                                            >
                                              <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{
                                                  backgroundColor: option.dot,
                                                }}
                                              />

                                              <span className="truncate">{option.label}</span>

                                              {option.value === task.status && (
                                                <Check size={13} className="ml-auto shrink-0" />
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Activity Section */}
              <div>
                <p className="text-base font-semibold text-gray-800 mb-3">Activity</p>

                {/* Tabs */}
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

                {/* Tab Content */}
                {tab === 'all' && (
                  <div className="text-sm text-gray-500">
                    <p>Showing all activity...</p>
                  </div>
                )}

                {tab === 'comments' && (
                  <div className="space-y-4">
                    {/* Show editor only when true */}
                    {showCommentEditor && (
                      <>
                        <WpRichTextEditor
                          value={comment}
                          onChange={setComment}
                          placeholder="Write a comment..."
                          minHeight="120px"
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
                    {!showCommentEditor && (
                      <button
                        type="button"
                        onClick={() => setShowCommentEditor(true)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left text-sm text-gray-400 hover:border-gray-400 hover:text-gray-500"
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
                        <p className="text-sm text-gray-500">No comments yet</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to comment</p>
                      </div>
                    ) : (
                      <div className="space-y-4 mt-6">
                        {comments.map((commentItem) => (
                          <div key={commentItem.id}>
                            <div className="flex gap-3">
                              <AssigneeAvatar
                                initials={
                                  commentItem.user_name
                                    ? commentItem.user_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)
                                    : 'UN'
                                }
                                color={getMemberColor(commentItem.user_id)}
                                size="sm"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {commentItem.user_name || 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(commentItem.created_at).toLocaleString()}
                                  </span>
                                </div>

                                {editingCommentId === commentItem.id ? (
                                  <div className="space-y-2">
                                    <WpRichTextEditor
                                      value={editingCommentContent}
                                      onChange={setEditingCommentContent}
                                      placeholder="Edit comment..."
                                      minHeight="100px"
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
                                    <div className="bg-gray-50 rounded-lg px-3 py-2 relative group">
                                      <div
                                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: commentItem.content }}
                                      />

                                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(commentItem.id);
                                            setEditingCommentContent(commentItem.content);
                                          }}
                                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                                          title="Edit comment"
                                        >
                                          <Pencil size={14} className="text-gray-600" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(commentItem.id)}
                                          className="p-1 rounded hover:bg-red-100 transition-colors"
                                          title="Delete comment"
                                          disabled={deletingCommentId === commentItem.id}
                                        >
                                          <Trash2 size={14} className="text-red-600" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Reply Button */}
                                    <div className="mt-2">
                                      <button
                                        onClick={() => handleToggleReplies(commentItem.id, commentItem.user_name || 'User')}
                                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                      >
                                        <CornerDownRight size={14} />
                                        <span>Reply</span>
                                        {commentItem.replies_count > 0 && (
                                          <span className="text-xs font-semibold text-blue-600">
                                            ({commentItem.replies_count})
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  </>
                                )}

                                {/* Replies Section */}
                                {showRepliesForComment.has(commentItem.id) && (
                                  <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4 space-y-4">
                                    {/* Display Replies First */}
                                    {repliesMap.get(commentItem.id) && repliesMap.get(commentItem.id)!.length > 0 && (
                                      <div className="space-y-3">
                                        {repliesMap.get(commentItem.id)!.map((reply: UserStoryReplyResponse) => (
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
                                              size='md'
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold text-gray-900">
                                                  {reply.user_name || 'Unknown User'}
                                                </span>
                                                <span className="text-xs text-gray-500">
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
                                                  />
                                                  <div className="flex items-center gap-2">
                                                    <WpButton
                                                      type="button"
                                                      variant="primary"
                                                      size="sm"
                                                      disabled={!editingReplyContent.trim() || isUpdatingReply}
                                                      onClick={() => handleUpdateReply(reply.id, commentItem.id)}
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
                                                <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 relative group">
                                                  <div
                                                    className="text-xs text-gray-700 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: reply.content }}
                                                  />
                                                  
                                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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
                                                    <button
                                                      onClick={() => handleDeleteReply(reply.id, commentItem.id)}
                                                      className="p-1 rounded hover:bg-red-100 transition-colors"
                                                      title="Delete reply"
                                                      disabled={deletingReplyId === reply.id}
                                                    >
                                                      <Trash2 size={12} className="text-red-600" />
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Reply Input After existing replies */}
                                    {replyingToCommentId === commentItem.id && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <CornerDownRight size={12} />
                                          <span>Replying to <span className="font-semibold text-gray-700">{commentItem.user_name || 'User'}</span></span>
                                        </div>
                                        <WpRichTextEditor
                                          value={replyContent}
                                          onChange={setReplyContent}
                                          placeholder="Write a reply..."
                                          minHeight="80px"
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
                                            onClick={handleCancelReply}
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
                  <div className="text-sm text-gray-500">
                    <p>No history yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              onMouseDown={onDividerMouseDown}
              className="hidden sm:flex w-1.5 shrink-0 cursor-col-resize hover:bg-blue-100 active:bg-blue-200 transition-colors group items-center justify-center"
              style={{ backgroundColor: 'transparent' }}
            >
              <div className="w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
            </div>

            {/* Right Column - Details */}
            <div
              className={`overflow-y-auto bg-gray-50/60 ${
                mobileTab === 'content' ? 'hidden sm:block sm:shrink-0' : 'block w-full sm:shrink-0'
              }`}
              style={{ width: isMobile ? undefined : rightWidth }}
            >
              {/* Status */}
              <div className="px-5 py-5 border-b border-gray-300">
                <p className="text-base font-semibold text-gray-800 mb-2">Status</p>
                <div className="relative" ref={statusMenuRef}>
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border"
                    style={{
                      color: allStatusConfig[userStoryData.status]?.color || colors.colTodo,
                      backgroundColor:
                        allStatusConfig[userStoryData.status]?.bg || colors.colTodoBg,
                      borderColor: `${allStatusConfig[userStoryData.status]?.dot || colors.colTodo}55`,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            allStatusConfig[userStoryData.status]?.dot || colors.colTodo,
                        }}
                      />
                      {allStatusConfig[userStoryData.status]?.label || 'To Do'}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {/* Status Options */}
                      {allStatusOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setShowStatusMenu(false);
                            handleUpdate({ status: option.value });
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 hover:bg-gray-50"
                          style={{
                            fontWeight: option.value === userStoryData.status ? 700 : 500,
                            color: option.color,
                            backgroundColor:
                              option.value === userStoryData.status ? option.bg : undefined,
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: option.dot }}
                          />

                          {option.label}

                          {option.value === userStoryData.status && (
                            <Check size={13} className="ml-auto" />
                          )}
                        </button>
                      ))}

                      {/* Divider */}
                      <div className="my-1 border-t border-gray-200" />

                      {/* Add Task */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowStatusMenu(false);
                          setSelectedStatus(null);
                          setStatusModalMode('add');
                          setShowStatusModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Add Status
                      </button>

                      {/* Edit Task */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowStatusMenu(false);
                          let statusToEdit = customStatuses.find(
                            (status) => status.id === userStoryData.status
                          );
                          if (!statusToEdit) {
                            const currentStatus = String(userStoryData.status)
                              .toLowerCase()
                              .replace(/[_-]/g, ' ')
                              .trim();

                            statusToEdit = customStatuses.find((status) => {
                              const statusName = status.name
                                .toLowerCase()
                                .replace(/[_-]/g, ' ')
                                .trim();

                              return statusName === currentStatus;
                            });
                          }

                          if (!statusToEdit) {
                            statusToEdit = customStatuses.find((status) => status.is_default);
                          }

                          // Final fallback
                          if (!statusToEdit && customStatuses.length > 0) {
                            statusToEdit = customStatuses[0];
                          }

                          if (!statusToEdit) {
                            return;
                          }

                          setSelectedStatus(statusToEdit);
                          setStatusModalMode('edit');
                          setShowStatusModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit Status
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowStatusMenu(false);

                          setSelectedStatus(null);
                          setStatusModalMode('delete');
                          setShowStatusModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete Status
                      </button>
                      {/* View Workflow */}
                      {/* <button
                        type="button"
                        onClick={() => {
                          setShowStatusMenu(false);
                          setShowWorkflowModal(true);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View workflow
                      </button> */}
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-5 border-b border-gray-200">
                <p className="text-base font-semibold text-gray-800 mb-2">Details</p>

                <DetailRow label="Assignee">
                  <div className="relative" ref={assigneeMenuRef}>
                    <button
                      onClick={() => setShowAssigneeMenu((v) => !v)}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                    >
                      {userStoryData.assigneeId ? (
                        <AssigneeAvatar
                          initials={userStoryData.assigneeInitials}
                          color={getMemberColor(userStoryData.assigneeId)}
                          size="sm"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <User size={12} className="text-gray-400" />
                        </span>
                      )}
                      <span className="text-sm text-gray-700 truncate">
                        {userStoryData.assigneeName || 'Unassigned'}
                      </span>
                      <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />
                    </button>
                    {showAssigneeMenu && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <WpInput
                            value={assigneeSearch}
                            onChange={(e) => setAssigneeSearch(e.target.value)}
                            placeholder="Search assignee..."
                          />
                        </div>
                        {(isLoadingMembers || isFetchingMembers) && (
                          <div className="px-3 py-3 text-sm text-gray-500 text-center">
                            Searching...
                          </div>
                        )}
                        {!isLoadingMembers &&
                          !isFetchingMembers &&
                          members?.map((m) => {
                            const name = m.full_name ?? m.user?.name ?? '';
                            const displayName =
                              name ||
                              m.user?.email?.split('@')[0] ||
                              m.user?.email ||
                              'Unknown User';
                            const initials = getInitials(
                              name || m.user?.email?.split('@')[0] || 'U'
                            );
                            const color = getMemberColor(m.user_id);
                            return (
                              <WpButton
                                key={m.user_id}
                                type="button"
                                variant="ghost"
                                onClick={async () => {
                                  setShowAssigneeMenu(false);
                                  setAssigneeSearch('');
                                  await handleUpdate({ assigneeId: m.user_id });
                                }}
                                className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 text-gray-900"
                              >
                                <AssigneeAvatar initials={initials} color={color} size="sm" />
                                <span className="truncate">{displayName}</span>
                                {m.user_id === userStoryData.assigneeId && (
                                  <Check size={12} className="ml-auto text-blue-600 shrink-0" />
                                )}
                              </WpButton>
                            );
                          })}
                        {!isLoadingMembers && !isFetchingMembers && !assigneeSearch && (
                          <WpButton
                            type="button"
                            variant="ghost"
                            onClick={async () => {
                              setShowAssigneeMenu(false);
                              setAssigneeSearch('');
                              await handleUpdate({ assigneeId: '' });
                            }}
                            className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm text-gray-500 hover:bg-gray-50"
                          >
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                              <User size={11} className="text-gray-400" />
                            </span>
                            Unassigned
                          </WpButton>
                        )}
                      </div>
                    )}
                  </div>
                </DetailRow>

                <DetailRow label="Reporter">
                  <span className="text-sm text-gray-700">
                    {currentUserStory.reporter_name || '-'}
                  </span>
                </DetailRow>

                <DetailRow label="Priority">
                  <EditablePriority
                    value={userStoryData.priority}
                    onChange={(priority) => handleUpdate({ priority })}
                  />
                </DetailRow>

                <DetailRow label="Story pts">
                  <EditableNumber
                    value={userStoryData.storyPoints}
                    onChange={(storyPoints) => handleUpdate({ storyPoints })}
                  />
                </DetailRow>

                <DetailRow label="Sprint">
                  <div className="relative" ref={sprintMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowSprintMenu((v) => !v)}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 w-full text-left"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {selectedSprintName ||
                          (userStoryData.sprintId
                            ? sprints?.find((sprint) => sprint.id === userStoryData.sprintId)
                                ?.name || 'Sprint assigned'
                            : 'No sprint')}
                      </span>

                      <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />
                    </button>

                    {showSprintMenu && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-gray-200">
                          <WpInput
                            value={sprintSearch}
                            onChange={(e) => setSprintSearch(e.target.value)}
                            placeholder="Search sprint..."
                          />
                        </div>

                        {/* Loading */}
                        {(isLoadingSprints || isFetchingSprints) && (
                          <div className="px-3 py-3 text-sm text-gray-500 text-center">
                            Searching...
                          </div>
                        )}

                        {/* Sprint list */}
                        {!isLoadingSprints &&
                          !isFetchingSprints &&
                          sprints?.map((sprint) => (
                            <button
                              key={sprint.id}
                              type="button"
                              onClick={async () => {
                                setShowSprintMenu(false);
                                setSprintSearch('');

                                setSelectedSprintName(sprint.name);

                                await handleUpdate({
                                  sprintId: sprint.id,
                                });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <span className="truncate">{sprint.name}</span>

                              {sprint.id === userStoryData.sprintId && (
                                <Check size={13} className="ml-auto text-blue-600 shrink-0" />
                              )}
                            </button>
                          ))}

                        {/* No results */}
                        {!isLoadingSprints && !isFetchingSprints && sprints?.length === 0 && (
                          <div className="px-3 py-3 text-sm text-gray-500 text-center">
                            No sprints found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DetailRow>
                <DetailRow label="Start Date">
                  <span className="text-sm text-gray-700">
                    {userStoryData.start_date
                      ? new Date(userStoryData.start_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'None'}
                  </span>
                </DetailRow>

                <DetailRow label="Due Date">
                  <EditableDate
                    value={userStoryData.due_date}
                    onChange={(dueDate) => handleUpdate({ due_date: dueDate })}
                    placeholder="Set due date"
                    includeTime={true}
                  />
                </DetailRow>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-bold text-gray-900">Delete User Story</h3>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this user story? This action cannot be undone and will
              also affect all associated tasks.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <WpButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </WpButton>

              <WpButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete?.();
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {/* Add Status Modal */}
      {showStatusModal && (
        <StatusModal
          projectId={currentUserStory.project_id ?? ''}
          mode={statusModalMode}
          status={selectedStatus}
          statuses={customStatuses}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedStatus(null);
          }}
        />
      )}

      {/* {showWorkflowModal && (
        <WorkflowModal
          statuses={customStatuses}
          currentStatus={userStoryData.status}
          onClose={() => setShowWorkflowModal(false)}
        />
      )} */}
    </>
  );
};

export default UserStoryDetailDrawer;
