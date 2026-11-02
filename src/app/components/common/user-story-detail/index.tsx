'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { colors } from '@/src/styles/colors';
import { EditableText } from '../task-detail/components/editable-fields';
import { useResize } from '@/src/hooks/useResize';
import { logger } from '@/src/lib/utils/logger';
import { useDebounce } from '@/src/hooks/useDebounce';
import {
  useGetProjectMembers,
  useGetProjectActivities,
} from '@/src/modules/project/hooks/useProject';
import { useGetUserStoryById } from '@/src/modules/tasks/hooks/useUserStory';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { TaskDetailDrawer } from '../task-detail';
import { KanbanTask } from '@/src/types/board';
import {
  useUploadUserStoryAttachment,
  useGetUserStoryAttachments,
  useDownloadUserStoryAttachment,
  useDeleteUserStoryAttachment,
} from '@/src/modules/tasks/hooks/useUserStoryAttachment';
import { ChildTasksPanel } from './ChildTasksPanel';
import usePermissions from '@/src/hooks/usePermissions';
import { useAppSelector } from '@/src/store';
import { DrawerHeader } from './components/drawerHeader';
import AttachmentsSection from './components/attachmentSection';
import { StoryActivity } from './components/storyActivity';
import { useResizable } from '@/src/hooks/useResizable';
import { useCopyLink } from '@/src/hooks/useCopyLink';
import UserStoryDescriptionSection from './components/useStoryDescription';
import DeleteConfirmModal from '../deleteModal';
import { useStoryComments } from './hooks/useStoryComment';
import { useUserStoryUpdate } from './hooks/useUserStoryUpdate';
import StoryErrorState from './components/storyErrorState';
import { useUserStoryActions } from './hooks/useUserStoryAction';
import StoryDetailsSidebar from './components/storyDetailsSidebar';
import { useEditableStoryFields } from './hooks/useEditableStoryFields';
export interface UserStoryDetailDrawerProps {
  userStory: UserStoryResponse;
  onClose: () => void;
  onUpdate?: (updatedStory?: Partial<UserStoryResponse>) => void;
  onCreateTask?: () => void;
  onDelete?: () => void;
  onOpenTask?: (task: KanbanTask) => void;
}

type ActivityTab = 'all' | 'comments' | 'history' | 'childTickets';

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

  const isUuid = (val?: string): boolean =>
    !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const storeProjectId = useAppSelector((state) => state.project.selectedProject?.id) || '';
  const effectiveProjectId = initialUserStory.project_id || storeProjectId;
  const effectiveStoryId = initialUserStory.key || initialUserStory.id;

  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const projectSlug = params?.projectSlug as string;

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

  const { handleCopyLink, copiedLink } = useCopyLink({
    itemKey: resolvedStoryKey || effectiveStoryId || initialUserStory.key || initialUserStory.id,
    orgSlug,
    projectSlug,
  });

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

  const { editableFields, setEditableFields, userStoryData } =
    useEditableStoryFields(currentUserStory);

  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showReporterMenu, setShowReporterMenu] = useState(false);
  const [childAssigneeTaskId, setChildAssigneeTaskId] = useState<string | null>(null);
  const [childAssigneeSearch, setChildAssigneeSearch] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSprintName, setSelectedSprintName] = useState('');
  const debouncedChildAssigneeSearch = useDebounce(childAssigneeSearch, 500);
  const [childStatusTaskId, setChildStatusTaskId] = useState<string | null>(null);
  const [childTasks, setChildTasks] = useState<TaskResponse[]>(() => currentUserStory.tasks ?? []);
  const childStatusMenuRef = useRef<HTMLDivElement>(null);

  const { commentState, replyState } = useStoryComments({
    projectId: currentUserStory.project_id ?? '',
    storyId: currentUserStory.id,
    canViewComments,
  });

  useEffect(() => {
    const latestTasks = currentUserStory.tasks ?? [];
    const timer = setTimeout(() => {
      setChildTasks(latestTasks);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUserStory.tasks]);

  const assigneeMenuRef = useRef<HTMLDivElement>(null);
  const reporterMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
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

  const { handleUpdate, isSaving, setIsSaving } = useUserStoryUpdate({
    projectId: currentUserStory.project_id,
    storyId: currentUserStory.id,
    storyKey: currentUserStory.key,
    storySprintId: currentUserStory.sprint_id,
    editableFields,
    setEditableFields,
  });

  const { isAlreadyInBacklog, handleMoveToBacklog, handleAssignToMe } = useUserStoryActions({
    currentUserStory,
    currentUser,
    editableFields,
    setEditableFields,
    setSelectedSprintName,
    isSaving,
    setIsSaving,
    canEditUserStory,
    handleUpdate,
    onUpdate,
  });

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

  const totalTasks = currentUserStory.total_tasks ?? 0;

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    ...(canViewComments ? [{ key: 'comments' as ActivityTab, label: 'Comments' }] : []),
    { key: 'history' as ActivityTab, label: 'History' },
  ];

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
            <StoryErrorState
              displayKey={displayKey}
              isNotFound={isNotFound}
              errorMessage={errorMessage}
              errorCode={apiErrorData?.error?.code}
              onClose={onClose}
              onRetry={() => refetchUserStory()}
            />
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

                  <UserStoryDescriptionSection
                    description={userStoryData.description}
                    currentDescription={currentUserStory.description}
                    editingDesc={editingDesc}
                    setEditingDesc={setEditingDesc}
                    setEditableFields={setEditableFields}
                    canEditUserStory={canEditUserStory}
                    isSaving={isSaving}
                    primaryColor={colors.primary}
                    handleUpdate={handleUpdate}
                    handleDescriptionImageUpload={handleDescriptionImageUpload}
                  />

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
                      ...commentState,
                      reporterInitials: userStoryData.reporterInitials,
                      reporterColor: userStoryData.reporterColor || '',
                    }}
                    replyState={replyState}
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
                <StoryDetailsSidebar
                  projectId={currentUserStory.project_id ?? ''}
                  userStoryData={userStoryData}
                  canEditUserStory={canEditUserStory}
                  currentUserId={currentUser?.userid}
                  handleUpdate={handleUpdate}
                  handleAssignToMe={handleAssignToMe}
                  handleMoveToBacklog={handleMoveToBacklog}
                  selectedSprintName={selectedSprintName}
                  setSelectedSprintName={setSelectedSprintName}
                  isMobile={isMobile}
                  mobileTab={mobileTab}
                  width={rightWidth}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete User Story"
          message="Are you sure you want to delete this user story? This action cannot be undone and will also affect all associated tasks."
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete?.();
            onClose();
          }}
        />
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
