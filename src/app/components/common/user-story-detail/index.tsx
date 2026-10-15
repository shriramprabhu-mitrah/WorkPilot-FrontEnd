'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ChevronDown, AlertCircle, AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';
import type { Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { DetailRow } from '../task-detail/components/detail-row';
import {
  EditableDate,
  EditableNumber,
  EditablePriority,
  EditableText,
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
import { UserStoryResponse, UserStoryReplyResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { TaskDetailDrawer } from '../task-detail';
import { KanbanTask } from '@/src/types/board';
import WpRichTextEditor from '../htmlEditor';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import {
  useCreateUserStoryComment,
  useGetUserStoryComments,
  useUpdateUserStoryComment,
  useDeleteUserStoryComment,
  useUploadUserStoryCommentAttachment,
  useDeleteUserStoryCommentAttachment,
  useDownloadUserStoryCommentAttachment,
} from '@/src/modules/tasks/hooks/useUserStoryComments';
import { userStoryCommentService } from '@/src/services/userstoryComments';
import toast from 'react-hot-toast';
import {
  useUploadUserStoryAttachment,
  useGetUserStoryAttachments,
  useDownloadUserStoryAttachment,
  useDeleteUserStoryAttachment,
} from '@/src/modules/tasks/hooks/useUserStoryAttachment';

import { useQueryClient } from '@tanstack/react-query';
import { ChildTasksPanel } from './ChildTasksPanel';
import usePermissions from '@/src/hooks/usePermissions';
import { useAppSelector } from '@/src/store';
import { RichContentViewer } from '../rich-content-viewer';
import { DrawerHeader } from './components/drawerHeader';
import { AssigneeField, ReporterField, SprintField } from './components/assigneeReporterFileds';
import AttachmentsSection from './components/attachmentSection';
import { StoryActivity } from './components/storyActivity';
// import WorkflowModal from '../task-detail/components/WorkflowModal';
export interface UserStoryDetailDrawerProps {
  userStory: UserStoryResponse;
  onClose: () => void;
  onUpdate?: (updatedStory?: Partial<UserStoryResponse>) => void;
  onCreateTask?: () => void;
  onDelete?: () => void;
  onOpenTask?: (task: KanbanTask) => void;
}

type ActivityTab = 'all' | 'comments' | 'history' | 'childTickets';

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
  onOpenTask,
}: UserStoryDetailDrawerProps) => {
  const {
    canEditUserStory,
    canDeleteUserStory,
    canViewComments,
    canAddComments,
    canEditComments,
    canDeleteComments,
  } = usePermissions();
  const canCreateComment = canAddComments;

  const [tab, setTab] = useState<ActivityTab>(canViewComments ? 'comments' : 'history');
  const [showCommentEditor, setShowCommentEditor] = useState(true);

  const isUuid = (val?: string): boolean =>
    !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const storeProjectId = useAppSelector((state) => state.project.selectedProject?.id) || '';
  const effectiveProjectId = initialUserStory.project_id || storeProjectId;
  const effectiveStoryId = initialUserStory.key || initialUserStory.id;

  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const projectSlug = params?.projectSlug as string;
  const [copiedLink, setCopiedLink] = useState(false);

  // Use the hook to fetch user story data - this will auto-refresh when query is invalidated
  const {
    userStory: fetchedUserStory,
    isLoadingUserStory,
    isError: isStoryError,
    error: storyError,
    refetchUserStory,
  } = useGetUserStoryById(effectiveProjectId, effectiveStoryId);

  // Use fetched data if available, otherwise fall back to initial prop
  const currentUserStory = fetchedUserStory || initialUserStory;
  const projectId = currentUserStory.project_id || effectiveProjectId;
  const userStoryId = currentUserStory.id || effectiveStoryId;
  const resolvedStoryKey =
    (currentUserStory.key && !isUuid(currentUserStory.key) ? currentUserStory.key : undefined) ||
    (initialUserStory.key && !isUuid(initialUserStory.key) ? initialUserStory.key : undefined);
  const displayKey = resolvedStoryKey || userStoryId || 'User Story';

  const handleCopyLink = useCallback(async () => {
    const itemKey =
      resolvedStoryKey || effectiveStoryId || initialUserStory.key || initialUserStory.id;
    if (!itemKey) return;

    let url = '';
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      if (currentUrl.includes(itemKey)) {
        url = currentUrl;
      } else {
        const origin = window.location.origin;
        const currentPath = window.location.pathname;
        if (orgSlug && projectSlug) {
          const section = currentPath.includes('/boards') ? 'boards' : 'backlog';
          url = `${origin}/${orgSlug}/${projectSlug}/${section}/${itemKey}`;
        } else {
          url = `${origin}${currentPath}`;
        }
      }

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopiedLink(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopiedLink(false), 2000);
      } catch {
        toast.error('Failed to copy link');
      }
    }
  }, [
    resolvedStoryKey,
    effectiveStoryId,
    initialUserStory.key,
    initialUserStory.id,
    orgSlug,
    projectSlug,
  ]);

  useEffect(() => {
    if (resolvedStoryKey && orgSlug && projectSlug && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const section = currentPath.includes('/boards') ? 'boards' : 'backlog';
      const storyId = initialUserStory.id;
      if (
        (storyId && currentPath.endsWith(`/${storyId}`)) ||
        (initialUserStory.key &&
          isUuid(initialUserStory.key) &&
          currentPath.endsWith(`/${initialUserStory.key}`))
      ) {
        window.history.replaceState(
          null,
          '',
          `/${orgSlug}/${projectSlug}/${section}/${resolvedStoryKey}`
        );
      }
    }
  }, [resolvedStoryKey, initialUserStory.id, initialUserStory.key, orgSlug, projectSlug]);

  const apiErrorData = (
    storyError as
      | {
          status?: number;
          data?: {
            error?: { code?: string; status_code?: number; message?: string };
            message?: string;
          };
        }
      | undefined
  )?.data;

  const isNotFound =
    (storyError as { status?: number } | undefined)?.status === 404 ||
    apiErrorData?.error?.code === 'RESOURCE_NOT_FOUND' ||
    apiErrorData?.error?.status_code === 404;

  const errorMessage =
    apiErrorData?.error?.message ||
    apiErrorData?.message ||
    (storyError as Error | undefined)?.message ||
    'User story not found';

  const { attachments, isLoadingAttachments } = useGetUserStoryAttachments(projectId, userStoryId);
  const currentUser = useAppSelector((state) => state.user);

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
    assigneeColor?: string;
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
      assigneeColor: story.assignee?.color ?? '',
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
      // assigneeColor: currentUserStory?.assignee?.color,
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
      assigneeColor: editableFields.assigneeColor || currentUserStory?.assignee?.color,
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
  const [editingDesc, setEditingDesc] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [sprintSearch, setSprintSearch] = useState('');
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const [selectedSprintName, setSelectedSprintName] = useState('');
  const debouncedSprintSearch = useDebounce(sprintSearch, 500);
  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 500);
  const debouncedReporterSearch = useDebounce(reporterSearch, 500);
  const debouncedChildAssigneeSearch = useDebounce(childAssigneeSearch, 500);
  const [childStatusTaskId, setChildStatusTaskId] = useState<string | null>(null);
  const [childTasks, setChildTasks] = useState<TaskResponse[]>(() => currentUserStory.tasks ?? []);
  const queryClient = useQueryClient();
  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const childStatusMenuRef = useRef<HTMLDivElement>(null);

  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    { page: 1, page_size: 10, name: debouncedAssigneeSearch },
    showAssigneeMenu
  );

  const { mutateAsync: uploadCommentAttachmentAsync } = useUploadUserStoryCommentAttachment(
    currentUserStory.project_id ?? '',
    currentUserStory.id
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

  const { userStoryStatuses = [] } = useGetUserStoryStatuses(currentUserStory.project_id ?? '');

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

  // Comment attachment hooks
  const { deleteCommentAttachmentAsync } = useDeleteUserStoryCommentAttachment(
    currentUserStory.project_id ?? '',
    currentUserStory.id
  );

  const { downloadCommentAttachmentAsync } = useDownloadUserStoryCommentAttachment(
    currentUserStory.project_id ?? '',
    currentUserStory.id
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
  const { deleteCommentAsync } = useDeleteUserStoryComment(
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
  const { deleteCommentAsync: deleteReplyAsync } = useDeleteUserStoryComment(
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
  const {} = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    {
      page: 1,
      page_size: 10,
      name: debouncedChildAssigneeSearch,
    },
    !!childAssigneeTaskId
  );

  // Fetch activities for history tab
  const { activities, isLoadingActivities } = useGetProjectActivities(
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

        // Invalidate specific user story query
        await queryClient.invalidateQueries({
          queryKey: ['user-story', currentUserStory.project_id, currentUserStory.id],
        });

        // Invalidate user story by key if it exists
        if (currentUserStory.key) {
          await queryClient.invalidateQueries({
            queryKey: ['user-story', currentUserStory.project_id, currentUserStory.key],
          });
        }

        // Invalidate user stories list to update backlog UI
        await queryClient.invalidateQueries({
          queryKey: ['user-stories', currentUserStory.project_id],
        });

        // If user story is assigned to a sprint, invalidate sprint-related queries
        const userStorySprintId = currentUserStory.sprint_id || editableFields.sprintId;
        if (userStorySprintId) {
          // Invalidate sprint user stories
          await queryClient.invalidateQueries({
            queryKey: ['sprint-user-stories', currentUserStory.project_id, userStorySprintId],
          });
        }
      } catch (error) {
        logger.log('Failed to update user story', error);
        setEditableFields(previousFields);
        toast.error('Failed to update user story');
      } finally {
        setIsSaving(false);
      }
    },
    [
      currentUserStory.project_id,
      currentUserStory.id,
      currentUserStory.key,
      currentUserStory.sprint_id,
      editableFields,
      queryClient,
      refetchUserStory,
    ]
  );

  const isAlreadyInBacklog = !editableFields.sprintId && !currentUserStory.sprint_id;

  const handleMoveToBacklog = useCallback(async () => {
    if (isSaving || isAlreadyInBacklog || !canEditUserStory) return;

    const projectId = currentUserStory.project_id;
    const storyId = currentUserStory.id;

    if (!projectId || !storyId) {
      toast.error('Project ID or Story ID is missing');
      return;
    }

    const previousFields = { ...editableFields };

    try {
      setIsSaving(true);
      setSelectedSprintName('');
      setEditableFields((prev) => ({
        ...prev,
        sprintId: '',
        sprintName: '',
      }));

      await userStoryService.updateUserStory(projectId, storyId, {
        sprint_id: null,
      });

      await queryClient.invalidateQueries({
        queryKey: ['user-story', projectId, storyId],
      });
      if (currentUserStory.key) {
        await queryClient.invalidateQueries({
          queryKey: ['user-story', projectId, currentUserStory.key],
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['user-story'] });
      await queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['user-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['sprint-user-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['sprints'] });

      onUpdate?.({
        ...currentUserStory,
        sprint_id: undefined,
        sprint_name: undefined,
      });

      toast.success('User story moved to backlog');
    } catch (error) {
      logger.log('Failed to move user story to backlog', error);
      toast.error('Failed to move user story to backlog');
      setEditableFields(previousFields);
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    isAlreadyInBacklog,
    canEditUserStory,
    currentUserStory,
    editableFields,
    queryClient,
    onUpdate,
  ]);
  const handleAssignToMe = () => {
    if (!currentUser?.userid) {
      toast.error('Unable to determine current user');
      return;
    }
    const displayName = currentUser.name || currentUser.username || currentUser.email || '';
    const color = currentUser.color || colors.avatarBlue;
    handleUpdate({
      assigneeId: currentUser.userid,
      assigneeName: displayName,
      assigneeColor: color,
    });
  };

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

  // Comment attachment handlers
  const handleDeleteCommentAttachment = async (attachmentId: string) => {
    if (!attachmentId) return;

    try {
      await deleteCommentAttachmentAsync(attachmentId);
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Failed to delete image');
      logger.log('Failed to delete comment attachment', error);
    }
  };

  const handleDownloadCommentAttachment = async (attachmentId: string) => {
    if (!attachmentId) return;

    try {
      const blob = await downloadCommentAttachmentAsync(attachmentId);

      // Create a download link and trigger download
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
  };

  const totalTasks = currentUserStory.total_tasks ?? 0;

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    ...(canViewComments ? [{ key: 'comments' as ActivityTab, label: 'Comments' }] : []),
    { key: 'history' as ActivityTab, label: 'History' },
  ];

  const userStoryStatusOptions = userStoryStatuses.map((status) => ({
    value: status.id,
    label: status.name,
    color: status.color,
    bg: `${status.color}18`,
    dot: status.color,
    is_final: status.is_final,
  }));

  const userStoryStatusConfig = Object.fromEntries(
    userStoryStatusOptions.map((option) => [option.value, option])
  );

  // Handler for user story description images - uses user story attachment API
  const handleDescriptionImageUpload = async (file: File): Promise<string> => {
    const result = await uploadUserStoryAttachmentAsync({ userStoryId, file });

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

    // Encode attachment ID in the URL as a query parameter so it can be extracted later
    if (attachmentId) {
      const urlWithId = imageUrl.includes('?')
        ? `${imageUrl}&attachment_id=${attachmentId}`
        : `${imageUrl}?attachment_id=${attachmentId}`;
      return urlWithId;
    }

    return imageUrl;
  };

  // Handler for comment images - uses comment attachment API
  const handleCommentImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadCommentAttachmentAsync(formData);

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

    // Encode attachment ID in the URL as a query parameter so it can be extracted later
    if (attachmentId) {
      const urlWithId = imageUrl.includes('?')
        ? `${imageUrl}&attachment_id=${attachmentId}`
        : `${imageUrl}?attachment_id=${attachmentId}`;
      return urlWithId;
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

  const isDueDateExpired = useMemo(() => {
    if (!userStoryData.due_date) return false;

    const dueDate = new Date(userStoryData.due_date);
    const today = new Date();

    // Compare dates only, ignoring time
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  }, [userStoryData.due_date]);
  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-3"
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      >
        <div
          className="relative bg-white dark:bg-slate-900 w-full sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
          style={{ maxWidth: '1100px', height: 'min(860px, 94vh)' }}
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <DrawerHeader
            displayKey={displayKey}
            isStoryError={isStoryError}
            isNotFound={isNotFound}
            copiedLink={copiedLink}
            onCopyLink={handleCopyLink}
            sprintName={editableFields.sprintName || userStoryData.sprintName}
            canEditUserStory={canEditUserStory}
            canDeleteUserStory={canDeleteUserStory}
            isSaving={isSaving}
            isAlreadyInBacklog={isAlreadyInBacklog}
            onMoveToBacklog={handleMoveToBacklog}
            onDeleteClick={() => setShowDeleteConfirm(true)}
            onClose={onClose}
          />
          {isStoryError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/40 dark:bg-slate-900">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center mb-5 text-red-600 dark:text-red-400 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                {isNotFound ? 'User Story Not Found' : 'Failed to Load User Story'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
                {isNotFound ? (
                  <>
                    User story with key{' '}
                    <span className="font-semibold text-gray-800 dark:text-slate-200">
                      &quot;{displayKey}&quot;
                    </span>{' '}
                    was not found in this project. It may have been deleted, moved, or the URL might
                    be invalid.
                  </>
                ) : (
                  errorMessage
                )}
              </p>
              {isNotFound && apiErrorData?.error?.code && (
                <div className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {apiErrorData.error.code}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => refetchUserStory()}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <>
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

              <div className="relative flex flex-1 min-h-0 overflow-hidden">
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
                  <div className="mb-5">
                    <EditableText
                      value={userStoryData.title}
                      onChange={(title) => handleUpdate({ title })}
                      placeholder="User story title"
                      disabled={!canEditUserStory}
                      textClassName="text-2xl font-bold leading-snug"
                    />
                  </div>

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
                          onImageUpload={handleDescriptionImageUpload}
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
                            className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-700 hover:[&_a]:dark:text-blue-300 [&_img]:max-w-[200px] [&_img]:max-h-[200px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg"
                            dangerouslySetInnerHTML={{
                              __html: userStoryData.description,
                            }}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              const link = target.closest('a');
                              if (link && link.href) {
                                e.preventDefault();
                                window.open(link.href, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          />
                        ) : (
                          <span className="text-gray-400 dark:text-slate-500">
                            Add a description…
                          </span>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Attachments Section - Placeholder */}
                  <AttachmentsSection
                    attachmentsProps={{
                      attachments,
                      canEditUserStory,
                      canDeleteUserStory,
                      isUploadingUserStoryAttachment,
                      isLoadingAttachments,
                      isDownloadingAttachment,
                      isDeletingAttachment,
                      handleAttachmentUpload,
                      downloadAttachment,
                      deleteAttachmentAsync,
                    }}
                  />
                  {/* Tasks Section */}
                  <ChildTasksPanel
                    projectId={currentUserStory.project_id ?? ''}
                    userStoryId={currentUserStory.id ?? ''}
                    userStoryKey={resolvedStoryKey || userStoryId}
                    onCreateTask={onCreateTask}
                    onOpenTask={onOpenTask}
                    onUpdate={onUpdate}
                    totalTasks={totalTasks}
                  />

                  <StoryActivity
                    tab={tab}
                    setTab={setTab}
                    tabs={tabs}
                    permissions={{ canCreateComment, canEditComments, canDeleteComments }}
                    commentState={{
                      showCommentEditor,
                      setShowCommentEditor,
                      comment,
                      setComment,
                      handleAddComment,
                      isCreatingComment,
                      handleCommentImageUpload,
                      comments,
                      isLoadingComments,
                      reporterInitials: userStoryData.reporterInitials,
                      reporterColor: userStoryData.reporterColor || '',
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
                    }}
                    replyState={{
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
                    }}
                    history={{ activities, isLoadingActivities }}
                  />
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
                    mobileTab === 'content'
                      ? 'hidden sm:block sm:shrink-0'
                      : 'block w-full sm:shrink-0'
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

                    <AssigneeField
                      projectId={currentUserStory.project_id ?? ''}
                      assigneeId={userStoryData.assigneeId}
                      assigneeName={userStoryData.assigneeName}
                      assigneeInitials={userStoryData.assigneeInitials}
                      assigneeColor={userStoryData.assigneeColor}
                      canEditUserStory={canEditUserStory}
                      currentUserId={currentUser?.userid}
                      handleUpdate={handleUpdate}
                      handleAssignToMe={handleAssignToMe}
                    />

                    <ReporterField
                      projectId={currentUserStory.project_id ?? ''}
                      reporterId={userStoryData.reporterId}
                      reporterName={userStoryData.reporterName}
                      reporterInitials={userStoryData.reporterInitials}
                      reporterColor={userStoryData.reporterColor}
                      canEditUserStory={canEditUserStory}
                      handleUpdate={handleUpdate}
                    />

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

                    <SprintField
                      projectId={currentUserStory.project_id ?? ''}
                      sprintId={userStoryData.sprintId}
                      canEditUserStory={canEditUserStory}
                      selectedSprintName={selectedSprintName}
                      setSelectedSprintName={setSelectedSprintName}
                      handleUpdate={handleUpdate}
                      handleMoveToBacklog={handleMoveToBacklog}
                    />
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
                      {isDueDateExpired ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-sm text-red-600 dark:bg-gray-100">
                          <AlertTriangle size={14} />
                          <EditableDate
                            value={userStoryData.due_date}
                            onChange={(dueDate) => handleUpdate({ due_date: dueDate })}
                            placeholder="Set due date"
                            includeTime={false}
                            disabled={!canEditUserStory}
                          />
                        </div>
                      ) : (
                        <EditableDate
                          value={userStoryData.due_date}
                          onChange={(dueDate) => handleUpdate({ due_date: dueDate })}
                          placeholder="Set due date"
                          includeTime={false}
                          disabled={!canEditUserStory}
                        />
                      )}
                    </DetailRow>
                  </div>
                </div>
              </div>
            </>
          )}
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
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onOpenUserStory={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};

export default UserStoryDetailDrawer;
