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
import type { Priority, SubTask } from '@/src/types/board';
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
import {
  useGetProjectMembers,
  useGetProjectActivities,
} from '@/src/modules/project/hooks/useProject';
import {
  useGetUserStoryById,
  useGetUserStoryStatuses,
} from '@/src/modules/tasks/hooks/useUserStory';

import { WpButton } from '../button';
import { WpInput } from '../input';
import { UserStoryResponse, UserStoryReplyResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { TaskDetailDrawer } from '../task-detail';
import { KanbanTask, ColumnId } from '@/src/types/board';
import WpRichTextEditor from '../htmlEditor';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { useGetStatus, useDeleteStatus } from '@/src/modules/project/hooks/useLabels';
// import StatusModal from '../task-detail/components/StatusModal';
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
import { useQueryClient } from '@tanstack/react-query';
import { ChildTasksPanel } from './ChildTasksPanel';
import usePermissions from '@/src/hooks/usePermissions';
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
  const {
    canEditUserStory,
    canDeleteUserStory,
    canViewComments,
    canAddComments,
    canComment,
    canEditComments,
    canDeleteComments,
  } = usePermissions();
  const canCreateComment = canAddComments;

  const [tab, setTab] = useState<ActivityTab>(canViewComments ? 'comments' : 'history');
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
  type EditableUserStoryFields = {
    title: string;
    description: string;
    priority: Priority;
    status: string;
    storyPoints: number;
    assigneeId: string;
    assigneeName: string;
    reporterId: string;
    reporterName: string;
    sprintId: string;
    sprintName: string;
    start_date: string;
    due_date: string;
    color?: string;
  };

  const createEditableFields = (story: UserStoryResponse): EditableUserStoryFields => {
    const assigneeName = story.assignee_name ?? '';
    const reporterName = story.reporter_name ?? story.reporter?.name ?? '';

    const priority = story.priority
      ? ((story.priority.charAt(0).toUpperCase() +
          story.priority.slice(1).toLowerCase()) as Priority)
      : ('Medium' as Priority);

    const sprintName = story.sprint_id ? (story.sprint_name ?? '') : '';

    return {
      title: story.title ?? '',
      description: story.description ?? '',
      priority,
      status: story.status_id ?? '',
      storyPoints: story.story_points ?? 0,
      assigneeId: story.assignee_id ?? '',
      color: story.color ?? '',
      assigneeName,
      reporterId: story.reporter_id ?? story.reporter?.id ?? '',
      reporterName,
      sprintId: story.sprint_id ?? '',
      sprintName,
      start_date: story.start_date ?? story.tasks?.[0]?.created_at ?? '',
      due_date: story.due_date ?? story.tasks?.[0]?.due_date ?? '',
    };
  };

  const [editableFields, setEditableFields] = useState<EditableUserStoryFields>(() =>
    createEditableFields(currentUserStory)
  );

  // Derive non-editable fields directly from currentUserStory - no state needed
  const userStoryData = useMemo(() => {
    const assigneeName = editableFields.assigneeName || currentUserStory.assignee_name || '';

    const assigneeInitials = assigneeName
      ? assigneeName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

    const reporterName =
      editableFields.reporterName ||
      currentUserStory.reporter_name ||
      currentUserStory.reporter?.name ||
      '';

    const reporterInitials = reporterName
      ? reporterName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

    return {
      title: editableFields.title,
      description: editableFields.description,
      priority: editableFields.priority,
      status: editableFields.status,
      storyPoints: editableFields.storyPoints,
      assigneeId: editableFields.assigneeId,
      assigneeColor: currentUserStory?.assignee?.color,
      assigneeName,
      assigneeInitials,
      reporterId: editableFields.reporterId,
      reporterName,
      reporterInitials,
      reporterColor: currentUserStory?.reporter?.color,
      sprintId: editableFields.sprintId,
      sprintName: editableFields.sprintName,
      start_date: editableFields.start_date,
      due_date: editableFields.due_date,
    };
  }, [
    editableFields,
    currentUserStory.assignee_name,
    currentUserStory.reporter_name,
    currentUserStory.reporter?.name,
  ]);

  // Update editable fields only when the user story ID changes (new user story loaded)
  const userStoryIdRef = useRef(currentUserStory.id);
  useEffect(() => {
    if (userStoryIdRef.current !== currentUserStory.id) {
      userStoryIdRef.current = currentUserStory.id;

      setEditableFields(createEditableFields(currentUserStory));
    }
  }, [currentUserStory]);

  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showReporterMenu, setShowReporterMenu] = useState(false);
  const [childAssigneeTaskId, setChildAssigneeTaskId] = useState<string | null>(null);
  const [childAssigneeSearch, setChildAssigneeSearch] = useState('');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [reporterSearch, setReporterSearch] = useState('');
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
  const debouncedReporterSearch = useDebounce(reporterSearch, 500);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const debouncedChildAssigneeSearch = useDebounce(childAssigneeSearch, 500);
  const [statusModalMode, setStatusModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedStatus, setSelectedStatus] = useState<CustomStatus | null>(null);
  const [childStatusTaskId, setChildStatusTaskId] = useState<string | null>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [childTasks, setChildTasks] = useState<TaskResponse[]>(() => currentUserStory.tasks ?? []);
  const queryClient = useQueryClient();
  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const childStatusMenuRef = useRef<HTMLDivElement>(null);

  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    { page: 1, page_size: 10, name: debouncedAssigneeSearch },
    showAssigneeMenu
  );

  const {
    members: reporterMembers,
    isLoadingMembers: isLoadingReporterMembers,
    isFetchingMembers: isFetchingReporterMembers,
  } = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    { page: 1, page_size: 10, name: debouncedReporterSearch },
    showReporterMenu
  );

  const { data: customStatuses = [] } = useGetStatus(currentUserStory.project_id ?? '');

  const { userStoryStatuses = [] } = useGetUserStoryStatuses(currentUserStory.project_id ?? '');
  const { mutateAsync: deleteStatus, isPending: isDeletingStatus } = useDeleteStatus();

  // Comment hooks
  const { createCommentAsync, isCreatingComment } = useCreateUserStoryComment(
    currentUserStory.project_id ?? '',
    currentUserStory.id
  );
  const { comments, isLoadingComments } = useGetUserStoryComments(
    currentUserStory.project_id ?? '',
    currentUserStory.id,
    { page: 1, page_size: 50 },
    !!currentUserStory.project_id && !!currentUserStory.id && canViewComments
  );

  useEffect(() => {
    const latestTasks = currentUserStory.tasks ?? [];
    const timer = setTimeout(() => {
      setChildTasks(latestTasks);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUserStory.tasks]);

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
  const { updateCommentAsync: updateReplyAsync, isUpdatingComment: isUpdatingReply } =
    useUpdateUserStoryComment(
      currentUserStory.project_id ?? '',
      currentUserStory.id,
      editingReplyId ?? ''
    );
  const { deleteCommentAsync: deleteReplyAsync, isDeletingComment: isDeletingReply } =
    useDeleteUserStoryComment(
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
  const reporterMenuRef = useRef<HTMLDivElement>(null);
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

  // Fetch activities for history tab
  const { activities, isLoadingActivities, isFetchingActivities } = useGetProjectActivities(
    currentUserStory.project_id ?? '',
    {
      type: 'activity',
      resource_type: 'userstory',
      resource_id: currentUserStory.id,
      user_story_id: currentUserStory.id,
      page: 1,
      page_size: 50,
    },
    tab === 'history' // Only fetch when history tab is active
  );

  const { width: screenWidth } = useResize();
  const isMobile = screenWidth < 640;
  const [mobileTab, setMobileTab] = useState<'content' | 'details'>('content');
  const { width: rightWidth, onMouseDown: onDividerMouseDown } = useResizable(320, 240, 480);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        childAssigneeTaskId !== null &&
        childAssigneeMenuRef.current &&
        !childAssigneeMenuRef.current.contains(target)
      ) {
        setChildAssigneeTaskId(null);
        setChildAssigneeSearch('');
      }
      if (
        childStatusTaskId !== null &&
        childStatusMenuRef.current &&
        !childStatusMenuRef.current.contains(target)
      ) {
        setChildStatusTaskId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [childAssigneeTaskId, childStatusTaskId]);

  const handleUpdate = useCallback(
    async (patch: Partial<EditableUserStoryFields>) => {
      if (!currentUserStory.project_id || !currentUserStory.id) return;

      const previousFields = { ...editableFields };

      // Optimistic UI update
      setEditableFields((prev) => ({
        ...prev,
        ...patch,
      }));

      const payload: Record<string, unknown> = {};

      if (patch.title !== undefined) {
        payload.title = patch.title;
      }

      if (patch.description !== undefined) {
        payload.description = patch.description;
      }

      if (patch.priority !== undefined) {
        payload.priority = patch.priority.toLowerCase();
      }

      if (patch.status !== undefined) {
        payload.status_id = patch.status;
      }

      if (patch.storyPoints !== undefined) {
        payload.story_points = patch.storyPoints;
      }

      if (patch.assigneeId !== undefined) {
        payload.assignee_id = patch.assigneeId || null;
      }

      if (patch.reporterId !== undefined) {
        payload.reporter_id = patch.reporterId || null;
      }

      if (patch.sprintId !== undefined) {
        payload.sprint_id = patch.sprintId || null;
      }

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
        await queryClient.invalidateQueries({
          queryKey: ['user-story', currentUserStory.project_id, currentUserStory.id],
        });
      } catch (error) {
        logger.log('Failed to update user story', error);
        setEditableFields(previousFields);
        toast.error('Failed to update user story');
      } finally {
        setIsSaving(false);
      }
    },
    [currentUserStory.project_id, currentUserStory.id, editableFields, queryClient]
  );

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target as Node)) {
        setShowAssigneeMenu(false);
      }
      if (reporterMenuRef.current && !reporterMenuRef.current.contains(event.target as Node)) {
        setShowReporterMenu(false);
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
        parent_comment_id: parentCommentId,
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

  const tasks = childTasks;
  const totalTasks = currentUserStory.total_tasks ?? 0;
  const completedTasks = currentUserStory.completed_tasks ?? 0;

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    ...(canViewComments ? [{ key: 'comments' as ActivityTab, label: 'Comments' }] : []),
    { key: 'history' as ActivityTab, label: 'History' },
  ];

  const taskStatusOptions = customStatuses.map((status) => ({
    value: status.id,
    label: status.name,
    color: status.color,
    bg: `${status.color}18`,
    dot: status.color,
    is_final: status.is_final,
  }));

  const userStoryStatusOptions = userStoryStatuses.map((status) => ({
    value: status.id,
    label: status.name,
    color: status.color,
    bg: `${status.color}18`,
    dot: status.color,
    is_final: status.is_final,
  }));

  const taskStatusConfig = Object.fromEntries(
    taskStatusOptions.map((option) => [option.value, option])
  );

  const userStoryStatusConfig = Object.fromEntries(
    userStoryStatusOptions.map((option) => [option.value, option])
  );
  interface UploadedAttachment {
    url?: string;
    file_url?: string;
    file_path?: string;
    path?: string;
  }

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const result = await uploadUserStoryAttachmentAsync({ userStoryId, file });
    const attachment = result?.data?.data?.[0] as unknown as UploadedAttachment;

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
          className="relative bg-white dark:bg-slate-900 w-full sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
          style={{ maxWidth: '1100px', height: 'min(860px, 94vh)' }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-300 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <FileText size={13} className="text-white" />
              </span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                User Story
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(canEditUserStory || canDeleteUserStory) && (
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 transition-colors"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                      {canEditUserStory && (
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            setEditingTitle(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                          <Pencil size={14} />
                          Update
                        </button>
                      )}
                      {canDeleteUserStory && (
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 transition-colors"
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
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span className="text-sm text-gray-500 dark:text-slate-400">Loading...</span>
                </div>
              </div>
            )}

            {/* Left Column - Content */}
            <div
              className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 border-r border-gray-200 dark:border-slate-700 ${
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
                    className="w-full text-2xl font-bold text-gray-900 dark:text-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:border-blue-500"
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
                      className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h1
                  className="mb-5 max-w-[300px] truncate text-2xl font-bold leading-snug text-gray-900 dark:text-slate-100"
                  title={userStoryData.title}
                >
                  {userStoryData.title}
                </h1>
              )}

              {/* Description Section */}
              <section className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2">
                  Description
                </p>
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
                      onImageUpload={handleEditorImageUpload}
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
                        className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (!canEditUserStory) return;
                      setEditingDesc(true);
                    }}
                    className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed rounded-lg px-3 py-2.5 -mx-3 transition-colors min-h-[48px] ${
                      canEditUserStory
                        ? 'cursor-text hover:bg-gray-50 dark:hover:bg-slate-800'
                        : 'cursor-default'
                    }`}
                  >
                    {userStoryData.description ? (
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{
                          __html: userStoryData.description,
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">Add a description…</span>
                    )}
                  </div>
                )}
              </section>

              {/* Attachments Section - Placeholder */}
              {/* Attachments Section */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                    Attachments
                  </p>

                  {canEditUserStory && (
                    <>
                      <label
                        htmlFor="user-story-attachment"
                        className={`cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
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
                    </>
                  )}
                </div>

                {isLoadingAttachments ? (
                  <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-xl px-4 py-5 text-center">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Loading attachments...
                    </p>
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-xl px-4 py-5 text-center bg-white dark:bg-slate-800">
                    <p className="text-sm text-gray-500 dark:text-slate-400">No attachments</p>

                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      Add files to this user story
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText
                            size={18}
                            className="text-blue-600 dark:text-blue-400 shrink-0"
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-slate-200 truncate">
                              {attachment.original_filename}
                            </p>

                            <p className="text-xs text-gray-400 dark:text-slate-500">
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
                            className="rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                          >
                            Download
                          </button>

                          {(canEditUserStory || canDeleteUserStory) && (
                            <button
                              type="button"
                              disabled={isDeletingAttachment}
                              onClick={async () => {
                                try {
                                  await deleteAttachmentAsync(attachment.id);
                                } catch (error) {}
                              }}
                              className="rounded-lg p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                              title="Delete attachment"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Section */}
              <ChildTasksPanel
                projectId={currentUserStory.project_id ?? ''}
                userStoryId={currentUserStory.id ?? ''}
                onCreateTask={onCreateTask}
                totalTasks={totalTasks}
              />

              {/* Activity Section */}
              <div>
                <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-3">
                  Activity
                </p>

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
                {/* {tab === 'all' && (
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    <p>Showing all activity...</p>
                  </div>
                )} */}

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
                          onImageUpload={handleEditorImageUpload}
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
                        <p className="text-sm text-gray-500 dark:text-slate-400">No comments yet</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                          Be the first to comment
                        </p>
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
                                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                    {commentItem.user_name || 'Unknown User'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-slate-400">
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
                                        disabled={
                                          !editingCommentContent.trim() || isUpdatingComment
                                        }
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
                                      <div
                                        className="text-sm text-gray-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: commentItem.content }}
                                      />

                                      {(canEditComments || canDeleteComments) && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                          {canEditComments && (
                                            <button
                                              onClick={() => {
                                                setEditingCommentId(commentItem.id);
                                                setEditingCommentContent(commentItem.content);
                                              }}
                                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                              title="Edit comment"
                                            >
                                              <Pencil
                                                size={14}
                                                className="text-gray-600 dark:text-slate-400"
                                              />
                                            </button>
                                          )}
                                          {canDeleteComments && (
                                            <button
                                              onClick={() => handleDeleteComment(commentItem.id)}
                                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                              title="Delete comment"
                                              disabled={deletingCommentId === commentItem.id}
                                            >
                                              <Trash2
                                                size={14}
                                                className="text-red-600 dark:text-red-400"
                                              />
                                            </button>
                                          )}
                                        </div>
                                      )}
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
                                                      />
                                                      <div className="flex items-center gap-2">
                                                        <WpButton
                                                          type="button"
                                                          variant="primary"
                                                          size="sm"
                                                          disabled={
                                                            !editingReplyContent.trim() ||
                                                            isUpdatingReply
                                                          }
                                                          onClick={() =>
                                                            handleUpdateReply(
                                                              reply.id,
                                                              commentItem.id
                                                            )
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
                                                      <div
                                                        className="text-xs text-gray-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
                                                        dangerouslySetInnerHTML={{
                                                          __html: reply.content,
                                                        }}
                                                      />
                                                      {(canEditComments || canDeleteComments) && (
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                          {canEditComments && (
                                                            <button
                                                              onClick={() => {
                                                                setEditingReplyId(reply.id);
                                                                setEditingReplyContent(
                                                                  reply.content
                                                                );
                                                              }}
                                                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                                                              title="Edit reply"
                                                            >
                                                              <Pencil
                                                                size={12}
                                                                className="text-gray-600"
                                                              />
                                                            </button>
                                                          )}
                                                          {canDeleteComments && (
                                                            <button
                                                              onClick={() =>
                                                                handleDeleteReply(
                                                                  reply.id,
                                                                  commentItem.id
                                                                )
                                                              }
                                                              className="p-1 rounded hover:bg-red-100 transition-colors"
                                                              title="Delete reply"
                                                              disabled={
                                                                deletingReplyId === reply.id
                                                              }
                                                            >
                                                              <Trash2
                                                                size={12}
                                                                className="text-red-600"
                                                              />
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
                      <div className="space-y-3">
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
                          const userColor = getMemberColor(activity.user?.id || '');

                          let titleAction = `${activity.action} the ${activity.resource_type.replace('_', ' ')}`;
                          let changeText: React.ReactNode = null;

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
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-700 dark:text-slate-300">
                                  <span className="text-gray-500">{formatVal(fromVal)}</span>
                                  <span className="text-gray-400">→</span>
                                  <span>{formatVal(toVal)}</span>
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
                                  <div
                                    className="mt-2 text-sm text-gray-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: commentMatch[1] }}
                                  />
                                );
                              } else {
                                changeText = (
                                  <div className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                                    {activity.details}
                                  </div>
                                );
                              }
                            } else if (activity.resource_type === 'user_story_attachment') {
                              titleAction = `uploaded an attachment`;
                              changeText = (
                                <div className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                                  {activity.details}
                                </div>
                              );
                            } else {
                              changeText = (
                                <div className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                                  {activity.details}
                                </div>
                              );
                            }
                          }

                          return (
                            <div key={activity.id} className="flex gap-4">
                              {/* Avatar */}
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                                style={{ backgroundColor: userColor }}
                              >
                                {userInitials}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-gray-900 dark:text-slate-100 text-[15px]">
                                    {userName}
                                  </span>
                                  <span className="text-gray-700 dark:text-slate-300 text-[15px]">
                                    {titleAction}
                                  </span>
                                </div>

                                <div className="text-[13px] text-gray-500 dark:text-slate-400 mt-1">
                                  {formattedDate} at {formattedTime}
                                </div>

                                {changeText}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-slate-400 py-8 text-center">
                        <p>No history yet.</p>
                      </div>
                    )}
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
              className={`overflow-y-auto bg-gray-50/60 dark:bg-slate-950/50 ${
                mobileTab === 'content' ? 'hidden sm:block sm:shrink-0' : 'block w-full sm:shrink-0'
              }`}
              style={{ width: isMobile ? undefined : rightWidth }}
            >
              {/* Status */}
              <div className="px-5 py-5 border-b border-gray-300 dark:border-slate-700">
                <p className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-2">
                  Status
                </p>
                <div className="relative" ref={statusMenuRef}>
                  <button
                    disabled={!canEditUserStory}
                    onClick={() => {
                      if (!canEditUserStory) return;
                      setShowStatusMenu(!showStatusMenu);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border text-gray-900 dark:text-slate-100 ${
                      !canEditUserStory ? 'cursor-default' : ''
                    }`}
                    style={{
                      backgroundColor:
                        userStoryStatusConfig[userStoryData.status]?.bg || colors.colTodoBg,
                      borderColor: `${userStoryStatusConfig[userStoryData.status]?.dot || colors.colTodo}55`,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            userStoryStatusConfig[userStoryData.status]?.dot || colors.colTodo,
                        }}
                      />
                      {userStoryStatusConfig[userStoryData.status]?.label || 'To Do'}
                    </span>
                    {canEditUserStory && <ChevronDown size={14} />}
                  </button>
                  {showStatusMenu && canEditUserStory && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                      {/* Status Options */}
                      {userStoryStatusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleUpdate({ status: option.value });
                            setShowStatusMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          {/* Left: status color + label */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: option.dot }}
                            />

                            <span className="truncate text-sm text-gray-700 dark:text-slate-300">
                              {option.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-5 border-b border-gray-200">
                <p className="text-base font-semibold text-gray-800 mb-2 dark:text-slate-100">
                  Details
                </p>

                <DetailRow label="Assignee">
                  <div className="relative" ref={assigneeMenuRef}>
                    <button
                      disabled={!canEditUserStory}
                      onClick={() => {
                        if (!canEditUserStory) return;
                        setShowAssigneeMenu((v) => !v);
                      }}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
                        !canEditUserStory ? 'cursor-default' : 'hover:bg-gray-100'
                      }`}
                    >
                      {userStoryData.assigneeId ? (
                        <AssigneeAvatar
                          initials={userStoryData.assigneeInitials}
                          color={userStoryData.assigneeColor || ''}
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
                      {canEditUserStory && (
                        <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />
                      )}
                    </button>
                    {showAssigneeMenu && canEditUserStory && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
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
                  <div className="relative" ref={reporterMenuRef}>
                    <button
                      disabled={!canEditUserStory}
                      onClick={() => {
                        if (!canEditUserStory) return;
                        setShowReporterMenu((v) => !v);
                      }}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
                        !canEditUserStory
                          ? 'cursor-default'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {userStoryData.reporterId ? (
                        <AssigneeAvatar
                          initials={userStoryData.reporterInitials}
                          color={userStoryData.reporterColor || ''}
                          size="sm"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                          <User size={12} className="text-gray-400 dark:text-slate-400" />
                        </span>
                      )}
                      <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
                        {userStoryData.reporterName || 'Unassigned'}
                      </span>
                      {canEditUserStory && (
                        <ChevronDown
                          size={12}
                          className="ml-auto text-gray-400 dark:text-slate-500 shrink-0"
                        />
                      )}
                    </button>

                    {showReporterMenu && canEditUserStory && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-gray-200 dark:border-slate-700">
                          <WpInput
                            value={reporterSearch}
                            onChange={(e) => setReporterSearch(e.target.value)}
                            placeholder="Search reporter..."
                          />
                        </div>

                        {/* Loading */}
                        {(isLoadingReporterMembers || isFetchingReporterMembers) && (
                          <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                            Searching...
                          </div>
                        )}

                        {/* Member list */}
                        {!isLoadingReporterMembers &&
                          !isFetchingReporterMembers &&
                          reporterMembers?.map((m) => {
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
                            const isSelected = m.user_id === userStoryData.reporterId;
                            return (
                              <WpButton
                                key={m.user_id}
                                type="button"
                                variant="ghost"
                                onClick={async () => {
                                  setShowReporterMenu(false);
                                  setReporterSearch('');
                                  await handleUpdate({
                                    reporterId: m.user_id,
                                    reporterName: displayName,
                                  });
                                }}
                                className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                              >
                                <AssigneeAvatar initials={initials} color={color} size="sm" />
                                <span className="truncate">{displayName}</span>
                                {isSelected && (
                                  <Check
                                    size={12}
                                    className="ml-auto text-blue-600 dark:text-blue-400 shrink-0"
                                  />
                                )}
                              </WpButton>
                            );
                          })}

                        {/* No results */}
                        {!isLoadingReporterMembers &&
                          !isFetchingReporterMembers &&
                          reporterSearch &&
                          reporterMembers?.length === 0 && (
                            <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                              No members found
                            </div>
                          )}

                        {/* Unassigned option */}
                        {!isLoadingReporterMembers &&
                          !isFetchingReporterMembers &&
                          !reporterSearch && (
                            <WpButton
                              type="button"
                              variant="ghost"
                              onClick={async () => {
                                setShowReporterMenu(false);
                                setReporterSearch('');
                                await handleUpdate({ reporterId: '', reporterName: '' });
                              }}
                              className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                <User size={11} className="text-gray-400 dark:text-slate-400" />
                              </span>
                              Unassigned
                            </WpButton>
                          )}
                      </div>
                    )}
                  </div>
                </DetailRow>

                <DetailRow label="Priority">
                  <EditablePriority
                    value={userStoryData.priority}
                    onChange={(priority) => handleUpdate({ priority })}
                    disabled={!canEditUserStory}
                  />
                </DetailRow>

                <DetailRow label="Story pts">
                  <EditableNumber
                    value={userStoryData.storyPoints}
                    onChange={(storyPoints) => handleUpdate({ storyPoints })}
                    disabled={!canEditUserStory}
                  />
                </DetailRow>

                <DetailRow label="Sprint">
                  <div className="relative" ref={sprintMenuRef}>
                    {/* Selected Sprint */}
                    <button
                      type="button"
                      disabled={isUpdatingSprint || !canEditUserStory}
                      onClick={() => {
                        if (isUpdatingSprint || !canEditUserStory) return;
                        setShowSprintMenu((v) => !v);
                      }}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg w-full text-left ${
                        !canEditUserStory
                          ? 'cursor-default'
                          : isUpdatingSprint
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {selectedSprintName ||
                          (userStoryData.sprintId
                            ? sprints?.find((sprint) => sprint.id === userStoryData.sprintId)
                                ?.name || 'Sprint assigned'
                            : 'No sprint')}
                      </span>

                      {canEditUserStory && (
                        <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />
                      )}
                    </button>

                    {/* Sprint Dropdown */}
                    {showSprintMenu && !isUpdatingSprint && canEditUserStory && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
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

                        {!isLoadingSprints &&
                          !isFetchingSprints &&
                          sprints?.map((sprint) => {
                            const isSelected = sprint.id === userStoryData.sprintId;
                            return (
                              <button
                                key={sprint.id}
                                type="button"
                                disabled={isUpdatingSprint}
                                onClick={async () => {
                                  if (isUpdatingSprint) return;
                                  if (isSelected) {
                                    setShowSprintMenu(false);
                                    setSprintSearch('');
                                    return;
                                  }
                                  const previousSprintName =
                                    selectedSprintName ||
                                    (userStoryData.sprintId
                                      ? sprints?.find((s) => s.id === userStoryData.sprintId)
                                          ?.name || 'Sprint assigned'
                                      : 'No sprint');

                                  try {
                                    setIsUpdatingSprint(true);
                                    setShowSprintMenu(false);
                                    setSprintSearch('');
                                    setSelectedSprintName(sprint.name);
                                    await handleUpdate({
                                      sprintId: sprint.id,
                                    });
                                  } catch (error) {
                                    setSelectedSprintName(previousSprintName);
                                  } finally {
                                    setIsUpdatingSprint(false);
                                  }
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 text-left ${
                                  isUpdatingSprint
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <span className="truncate">{sprint.name}</span>

                                {isSelected && (
                                  <Check size={13} className="ml-auto text-blue-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}

                        {/* No Results */}
                        {!isLoadingSprints && !isFetchingSprints && sprints?.length === 0 && (
                          <div className="px-3 py-3 text-sm text-gray-500 text-center">
                            No sprints found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DetailRow>
                {/* future purpose
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
                </DetailRow> */}

                <DetailRow label="Due Date">
                  <EditableDate
                    value={userStoryData.due_date}
                    onChange={(dueDate) => handleUpdate({ due_date: dueDate })}
                    placeholder="Set due date"
                    includeTime={false}
                    disabled={!canEditUserStory}
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
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Delete User Story
            </h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
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
      {/* {showStatusModal && (
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
      )} */}

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
