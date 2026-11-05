import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import type { KanbanTask, Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { ActivitySection } from './components/activity-section';
import { EditableText } from './components/editable-fields';
import { useResize } from '@/src/hooks/useResize';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useTaskAttachments } from '@/src/modules/tasks/hooks/useTaskAttachment';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import StatusModal from './components/StatusModal';
import { CustomStatus } from '@/src/types/colors';
import { taskTypeOptions } from '../enum';
// adjust path to wherever StatusModal.tsx actually lives relative to this file
import { useDeleteTask, useGetTaskById } from '@/src/modules/tasks/hooks/useTask';
import toast from 'react-hot-toast';
import { useGetUserStories, useGetUserStoryById } from '@/src/modules/tasks/hooks/useUserStory';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAppSelector } from '@/src/store';
import { UserStoryResponse } from '@/src/types/userstories';
import { AssigneePatch, ReporterPatch } from './components/taskDetailFields';
import { useResizable } from '@/src/hooks/useResizable';
import { useCopyLink } from '@/src/hooks/useCopyLink';
import DeleteConfirmModal from '../deleteModal';
import { getInitials } from '../format';
import TaskStatusSection from './components/taskStatusSection';
import TaskDetailActions from './components/taskDetailActions';
import TaskDetailsSidebar from './components/taskDetailsSidebar';
import TaskDetailBreadcrumb from './components/taskDetailBreadcrumb';
import { TaskAttachments } from './components/taskAttachments';
import { Attachment } from '@/src/types/task';
import { useUpdateTask } from './hooks/useUpdateTask';
import { CloneTaskModal } from './components/cloneTaskModal';
import { useMoveToBacklog } from './hooks/useMoveToBacklog';
import { TaskDescriptionSection } from './components/taskDescriptionSection';
import { useTaskAssignment } from './hooks/useTaskAssignment';

const UserStoryDetailDrawer = dynamic(
  () => import('../user-story-detail').then((mod) => mod.UserStoryDetailDrawer),
  { ssr: false }
);

export interface TaskDetailDrawerProps {
  task: KanbanTask;
  onClose: () => void;
  onUpdate?: (updated: Partial<KanbanTask>) => void;
  onDelete?: () => void;
  onOpenUserStory?: (userStory: UserStoryResponse) => void;
}

export const TaskDetailDrawer = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  onOpenUserStory,
}: TaskDetailDrawerProps) => {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';
  const { canEditTask, canDeleteTask, canCreateTask, canViewUserStories } = usePermissions();
  const storeProjectId = useAppSelector((state) => state.project.selectedProject?.id) || '';
  const effectiveProjectId = task.projectId || storeProjectId;
  const effectiveTaskId = task.key || task.id;
  const { handleCopyLink, copiedLink } = useCopyLink({
    itemKey: effectiveTaskId || task.key || task.id,
    orgSlug,
    projectSlug,
  });

  const {
    task: fetchedTask,
    isLoadingTask: isLoading,
    isError,
    error,
    refetchTask,
  } = useGetTaskById(effectiveProjectId, effectiveTaskId);

  const apiErrorData = (
    error as
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
    (error as { status?: number } | undefined)?.status === 404 ||
    apiErrorData?.error?.code === 'RESOURCE_NOT_FOUND' ||
    apiErrorData?.error?.status_code === 404;

  const errorMessage =
    apiErrorData?.error?.message ||
    apiErrorData?.message ||
    (error as Error | undefined)?.message ||
    'Task not found';

  const resolvedProjectId = fetchedTask?.project_id || task.projectId || storeProjectId || '';
  const resolvedTaskId = fetchedTask?.id || task.taskId || '';
  const hasResolvedIds = !!resolvedProjectId && !!resolvedTaskId;
  const [estimatedHoursInput, setEstimatedHoursInput] = useState('');
  const [estimatedMinutesInput, setEstimatedMinutesInput] = useState('');
  const [savedDescription, setSavedDescription] = useState('');
  const [actualHoursInput, setActualHoursInput] = useState('');
  const [actualMinutesInput, setActualMinutesInput] = useState('');

  const [taskData, setTaskData] = useState({
    title: task.title ?? '',
    subtasks: task.subtasks ?? [],
    status: task.columnId ?? task.status ?? '',
    statusName: task.status ?? '',
    project_id: effectiveProjectId,
    description: task.description ?? '',
    priority: task.priority,
    labels: task.labels,
    dueDate: task.dueDate ?? '',
    startDate: task.startDate ?? '',
    user_story_title: task.user_story_title ?? '',
    user_story_id: task.user_story_id ?? '',
    storyPoints: task.storyPoints,
    estimatedHours: 0,
    actualHours: 0,
    sprint: task.sprint ?? '',
    sprint_id: task.sprintId ?? task.sprint_id ?? '',
    parent: task.parent ?? '',
    assignee: task.assigneeInitials,
    assigneeColor: task.assigneeColor,
    assigneeId: '',
    assigneeName: '',
    reporterId: task.reporter_id ?? '',
    reporterName: task.reporter_name ?? '',
    reporterInitials: task.reporterInitials ?? '',
    reporterColor: task.reporterColor ?? '',
    taskType: '',
  });

  useEffect(() => {
    if (fetchedTask) {
      const estimated = Number(fetchedTask.estimated_hours ?? 0);
      const actual = Number(fetchedTask.actual_hours ?? 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstimatedHoursInput(String(Math.floor(estimated)));
      setEstimatedMinutesInput(String(Math.round((estimated % 1) * 60)));
      setActualHoursInput(String(Math.floor(actual)));
      setActualMinutesInput(String(Math.round((actual % 1) * 60)));
      const apiDescription = fetchedTask.description ?? '';
      const assigneeName = fetchedTask.assignee?.name || fetchedTask.assignee_name || '';
      const initials = assigneeName ? getInitials(assigneeName) : '';
      const reporterName = fetchedTask.reporter?.name || fetchedTask.reporter_name || '';
      const reporterInitials = reporterName ? getInitials(reporterName) : '';
      const reporterColor = fetchedTask.reporter?.color ?? '';
      const reporterId = fetchedTask.reporter_id ?? '';

      setTaskData({
        title: fetchedTask.title || '',
        subtasks: task.subtasks ?? [],
        status: fetchedTask.status_id || fetchedTask.status || '',
        statusName: fetchedTask.status || '',
        project_id: fetchedTask.project_id || effectiveProjectId,
        description: apiDescription,
        priority: fetchedTask.priority
          ? ((fetchedTask.priority.charAt(0).toUpperCase() +
              fetchedTask.priority.slice(1).toLowerCase()) as Priority)
          : 'Medium',
        labels: fetchedTask.labels ?? task.labels ?? [],
        dueDate: fetchedTask.due_date ? fetchedTask.due_date.split('T')[0] : '',
        startDate: fetchedTask.start_date ? fetchedTask.start_date.replace(/Z$/, '') : '',
        user_story_title: fetchedTask.user_story_title ?? '',
        user_story_id: fetchedTask.user_story_id ?? '',
        storyPoints: fetchedTask.story_points ?? 0,
        estimatedHours: estimated,
        actualHours: actual,
        sprint: fetchedTask.sprint_name ?? '',
        sprint_id: fetchedTask.sprint_id ?? '',
        parent: task.parent ?? '',
        assignee: initials,
        assigneeColor: fetchedTask.assignee?.color ?? '',
        assigneeId: fetchedTask.assignee_id ?? '',
        assigneeName: assigneeName,
        reporterId,
        reporterName,
        reporterInitials,
        reporterColor,
        taskType: fetchedTask.type ?? '',
      });

      setSavedDescription(apiDescription);
    }
  }, [fetchedTask, effectiveProjectId, task.subtasks, task.labels, task.parent]);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showReporterMenu, setShowReporterMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userStorySearch, setUserStorySearch] = useState('');
  const debouncedUserStorySearch = useDebounce(userStorySearch, 500);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [originalTaskTitle, setOriginalTaskTitle] = useState('');
  const [originalTaskDescription, setOriginalTaskDescription] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selecteddStatus, setSelecteddStatus] = useState<CustomStatus | null>(null);
  const [showSprintMenu, setShowSprintMenu] = useState(false);
  const sprintMenuRef = useRef<HTMLDivElement>(null);

  const { userStories } = useGetUserStories(
    taskData.project_id,
    {
      page: 1,
      page_size: 10,
      search: debouncedUserStorySearch,
    },
    !!taskData.project_id && canViewUserStories
  );

  const isUuid = (val?: string): boolean =>
    !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const parentStoryId =
    taskData.user_story_id ||
    fetchedTask?.user_story_id ||
    task.user_story_id ||
    (task.parent && task.parent !== 'direct-sprint-tasks' && task.parent !== 'no-story'
      ? task.parent
      : '') ||
    '';

  const { userStory: fetchedParentStory } = useGetUserStoryById(
    effectiveProjectId,
    parentStoryId,
    !!effectiveProjectId && !!parentStoryId && canViewUserStories
  );

  const matchedParentStory = userStories?.find(
    (s) => s.id === parentStoryId || s.key === parentStoryId
  );
  const parentStory = fetchedParentStory || matchedParentStory;
  const parentStoryKey =
    parentStory?.key ||
    task.user_story_key ||
    (parentStoryId && !isUuid(parentStoryId) ? parentStoryId : '');
  const parentStoryTitle =
    parentStory?.title ||
    taskData.user_story_title ||
    fetchedTask?.user_story_title ||
    task.user_story_title ||
    '';

  const [activeParentStoryDrawer, setActiveParentStoryDrawer] = useState<UserStoryResponse | null>(
    null
  );

  const handleParentStoryClick = useCallback(() => {
    if (!parentStoryId) return;
    const resolvedKey =
      parentStoryKey ||
      parentStory?.key ||
      task.user_story_key ||
      (parentStoryId && !isUuid(parentStoryId) ? parentStoryId : undefined);

    const storyToOpen: UserStoryResponse =
      parentStory ||
      ({
        id: parentStoryId,
        key: resolvedKey,
        title: parentStoryTitle || 'User Story',
        project_id: effectiveProjectId,
      } as UserStoryResponse);

    if (onOpenUserStory) {
      onOpenUserStory(storyToOpen);
    } else {
      setActiveParentStoryDrawer(storyToOpen);
    }
  }, [
    parentStoryId,
    parentStory,
    parentStoryKey,
    parentStoryTitle,
    effectiveProjectId,
    onOpenUserStory,
    task.user_story_key,
  ]);

  const assigneeMenuRef = useRef<HTMLDivElement>(null);
  const reporterMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const descriptionEditorRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    attachments,
    isLoadingAttachments,
    isFetchingAttachments,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  } = useTaskAttachments(resolvedProjectId, resolvedTaskId, hasResolvedIds);
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(resolvedProjectId);
  const statusOptions = statuses.map((status) => ({
    value: status.id,
    label: status.name,
    color: status.color,
  }));

  const selectedStatus = statusOptions.find((status) => status.value === taskData.status);
  const { deleteTaskAsync: deleteTask, isDeletingTask } = useDeleteTask(resolvedProjectId);
  const { currentUser, isAssigning, handleAssignToMe } = useTaskAssignment({
    task,
    taskData,
    setTaskData,
    onUpdate,
  });

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadAttachment.mutateAsync(formData);
    const attachment = result?.data?.[0] as Attachment | undefined;
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

  const { handleUpdate } = useUpdateTask({
    taskData,
    setTaskData,
    setIsSaving,
    resolvedProjectId,
    resolvedTaskId,
    fetchedTask,
    task,
    refetchTask,
    onUpdate,
  });

  const handleAssigneeUpdate = async (patch: AssigneePatch) => {
    try {
      await handleUpdate({
        assigneeId: patch.assigneeId,
        assigneeName: patch.assigneeName ?? '',
        assignee: patch.assigneeInitials ?? '',
        assigneeColor: patch.assigneeColor ?? '',
      });
    } catch {
      toast.error('Failed to update assignee');
    }
  };

  const handleReporterUpdate = (patch: ReporterPatch) => handleUpdate(patch);

  const { isMovingToBacklog, isAlreadyInBacklog, handleMoveToBacklog } = useMoveToBacklog({
    task,
    fetchedTask,
    taskData,
    setTaskData,
    effectiveProjectId,
    canEditTask,
    onUpdate,
  });

  const [uiState, setUiState] = useState({
    showStatusMenu: false,
    editingDesc: false,
  });

  const { width: screenWidth } = useResize();
  const isMobile = screenWidth < 640;
  const [mobileTab, setMobileTab] = useState<'content' | 'details'>('content');
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const { width: rightWidth, onMouseDown: onDividerMouseDown } = useResizable(320, 240, 480);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        descriptionEditorRef.current &&
        !descriptionEditorRef.current.contains(event.target as Node)
      ) {
        setUiState((prev) => ({
          ...prev,
          editingDesc: false,
        }));
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setUiState((prev) => ({ ...prev, showStatusMenu: false }));
      }
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target as Node)) {
        setShowAssigneeMenu(false);
      }
      if (reporterMenuRef.current && !reporterMenuRef.current.contains(event.target as Node)) {
        setShowReporterMenu(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
      if (sprintMenuRef.current && !sprintMenuRef.current.contains(event.target as Node)) {
        setShowSprintMenu(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  const handleAttachmentDownload = async (attachmentId: string, fileName: string) => {
    try {
      const blob = await downloadAttachment.mutateAsync(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {}
  };
  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !hasResolvedIds) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAttachment.mutateAsync(formData);
    } catch {
    } finally {
      event.target.value = '';
    }
  };

  const handleDeleteTask = async () => {
    if (!task.projectId || !task.taskId) return;

    try {
      await deleteTask([task.taskId]);
      toast.success('Task deleted successfully');
      setShowDeleteConfirm(false);
      onDelete?.();
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
  };
  const hasHours = Number(taskData.estimatedHours) > 0 && Number(taskData.actualHours) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-3"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
    >
      <div
        className="relative bg-white dark:bg-slate-900 w-full sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
        style={{ maxWidth: '1100px', height: 'min(860px, 94vh)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative z-20 flex items-center justify-between px-6 py-3.5 border-b border-gray-300 dark:border-slate-700 shrink-0">
          <TaskDetailBreadcrumb
            task={task}
            isError={isError}
            isNotFound={isNotFound}
            effectiveTaskId={effectiveTaskId}
            parentStoryId={parentStoryId}
            parentStoryKey={parentStoryKey}
            parentStoryTitle={parentStoryTitle}
            copiedLink={copiedLink}
            sprint={taskData.sprint}
            handleParentStoryClick={handleParentStoryClick}
            handleCopyLink={handleCopyLink}
          />
          <TaskDetailActions
            task={task}
            taskData={taskData}
            isError={isError}
            canEditTask={canEditTask}
            canCreateTask={canCreateTask}
            canDeleteTask={canDeleteTask}
            isMovingToBacklog={isMovingToBacklog}
            isAlreadyInBacklog={isAlreadyInBacklog}
            showActionMenu={showActionMenu}
            actionMenuRef={actionMenuRef}
            setShowActionMenu={setShowActionMenu}
            setOriginalTaskTitle={setOriginalTaskTitle}
            setOriginalTaskDescription={setOriginalTaskDescription}
            setEditTaskTitle={setEditTaskTitle}
            setEditTaskDescription={setEditTaskDescription}
            setIsEditingTask={setIsEditingTask}
            setEditingDesc={(value) =>
              setUiState((prev) => ({
                ...prev,
                editingDesc: value,
              }))
            }
            setShowCloneModal={setShowCloneModal}
            setShowDeleteConfirm={setShowDeleteConfirm}
            handleMoveToBacklog={handleMoveToBacklog}
            onClose={onClose}
          />
        </div>

        {isError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/40 dark:bg-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center mb-5 text-red-600 dark:text-red-400 shadow-sm">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
              {isNotFound ? 'Task Not Found' : 'Failed to Load Task'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mb-4 leading-relaxed">
              {isNotFound ? (
                <>
                  Task with key{' '}
                  <span className="font-semibold text-gray-800 dark:text-slate-200">
                    &quot;{effectiveTaskId || task.id}&quot;
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
                onClick={() => refetchTask()}
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
            <div className="flex sm:hidden border-b border-gray-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setMobileTab('content')}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mobileTab === 'content'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setMobileTab('details')}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mobileTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                Details
              </button>
            </div>

            <div className="relative flex flex-1 min-h-0 overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                    <span className="text-sm text-gray-500 dark:text-slate-400">Loading...</span>
                  </div>
                </div>
              )}
              <div
                className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 border-r border-gray-200 ${
                  mobileTab === 'details' ? 'hidden sm:block' : 'block'
                }`}
              >
                <div className="mb-5">
                  <EditableText
                    value={taskData.title || task.title || ''}
                    onChange={(title) => handleUpdate({ title })}
                    placeholder="Task title"
                    disabled={!canEditTask}
                    textClassName="text-2xl font-bold leading-snug"
                  />
                </div>

                {/* future purpose
             <div className="flex flex-wrap items-center gap-2 mb-6">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={14} /> Add child Ticket
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Link2 size={14} /> Link issue
              </button>
            </div> */}

                <TaskDescriptionSection
                  description={taskData.description}
                  canEditTask={canEditTask}
                  isSaving={isSaving}
                  isEditingDesc={uiState.editingDesc}
                  setEditingDesc={(value) =>
                    setUiState((prev) => ({ ...prev, editingDesc: value }))
                  }
                  isEditingTask={isEditingTask}
                  setIsEditingTask={setIsEditingTask}
                  editTaskTitle={editTaskTitle}
                  setEditTaskTitle={setEditTaskTitle}
                  editTaskDescription={editTaskDescription}
                  setEditTaskDescription={setEditTaskDescription}
                  originalTaskTitle={originalTaskTitle}
                  setOriginalTaskTitle={setOriginalTaskTitle}
                  originalTaskDescription={originalTaskDescription}
                  setOriginalTaskDescription={setOriginalTaskDescription}
                  savedDescription={savedDescription}
                  setSavedDescription={setSavedDescription}
                  onLocalChange={(patch) => setTaskData((prev) => ({ ...prev, ...patch }))}
                  handleUpdate={handleUpdate}
                  onImageUpload={handleEditorImageUpload}
                />

                {/* future purpose 
            <SubtasksSection
              subtasks={taskData.subtasks}
              onChange={(subtasks) => setTaskData((prev) => ({ ...prev, subtasks }))}
              onOpenSubtask={() => { }}
            /> */}

                {/* <section className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Linked work items</p>
              <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                + Add linked work item
              </button>
            </section> */}
                {/* Attachments */}
                <TaskAttachments
                  canEditTask={canEditTask}
                  canDeleteTask={canDeleteTask}
                  attachments={attachments}
                  isLoadingAttachments={isLoadingAttachments}
                  isFetchingAttachments={isFetchingAttachments}
                  isDownloadingAttachment={downloadAttachment.isPending}
                  isDeletingAttachment={deleteAttachment.isPending}
                  onAttachmentUpload={handleAttachmentUpload}
                  onAttachmentDownload={handleAttachmentDownload}
                  onAttachmentDelete={(attachmentId) => deleteAttachment.mutate(attachmentId)}
                  formatFileSize={formatFileSize}
                />
                <ActivitySection
                  items={task.activity ?? []}
                  taskId={resolvedTaskId ?? ''}
                  projectId={resolvedProjectId ?? ''}
                />
              </div>
              <div
                onMouseDown={onDividerMouseDown}
                className="hidden sm:flex w-1.5 shrink-0 cursor-col-resize hover:bg-blue-100 active:bg-blue-200 transition-colors group items-center justify-center"
                style={{ backgroundColor: 'transparent' }}
              >
                <div className="w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
              </div>

              <div
                className={`overflow-y-auto bg-gray-50/60 ${
                  mobileTab === 'content'
                    ? 'hidden sm:block sm:shrink-0'
                    : 'block w-full sm:shrink-0'
                }`}
                style={{ width: isMobile ? undefined : rightWidth }}
              >
                <TaskStatusSection
                  statusMenuRef={statusMenuRef}
                  canEditTask={canEditTask}
                  hasHours={hasHours}
                  selectedStatus={selectedStatus}
                  taskStatusName={taskData.statusName}
                  taskStatus={taskData.status}
                  showStatusMenu={uiState.showStatusMenu}
                  isLoadingStatus={isLoadingStatus}
                  statusOptions={statusOptions}
                  setShowStatusMenu={(value) =>
                    setUiState((prev) => ({
                      ...prev,
                      showStatusMenu: value,
                    }))
                  }
                  handleUpdate={handleUpdate}
                />

                <TaskDetailsSidebar
                  taskData={taskData}
                  resolvedProjectId={resolvedProjectId}
                  resolvedTaskId={resolvedTaskId}
                  canEditTask={canEditTask}
                  canViewUserStories={canViewUserStories}
                  currentUser={currentUser}
                  isAssigning={isAssigning}
                  handleUpdate={handleUpdate}
                  handleAssigneeUpdate={handleAssigneeUpdate}
                  handleReporterUpdate={handleReporterUpdate}
                  handleAssignToMe={handleAssignToMe}
                  taskTypeOptions={taskTypeOptions}
                  estimatedHoursInput={estimatedHoursInput}
                  setEstimatedHoursInput={setEstimatedHoursInput}
                  estimatedMinutesInput={estimatedMinutesInput}
                  setEstimatedMinutesInput={setEstimatedMinutesInput}
                  actualHoursInput={actualHoursInput}
                  setActualHoursInput={setActualHoursInput}
                  actualMinutesInput={actualMinutesInput}
                  setActualMinutesInput={setActualMinutesInput}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <CloneTaskModal
          projectId={task.projectId}
          taskId={task.taskId}
          onClose={() => setShowCloneModal(false)}
          onCloned={onClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          isDeleting={isDeletingTask}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteTask}
        />
      )}
      {showStatusModal && (
        <StatusModal
          projectId={task.projectId ?? ''}
          mode={statusModalMode}
          status={selecteddStatus}
          statuses={statuses}
          onClose={() => {
            setShowStatusModal(false);
            setSelecteddStatus(null);
          }}
        />
      )}
      {activeParentStoryDrawer && (
        <UserStoryDetailDrawer
          userStory={activeParentStoryDrawer}
          onClose={() => setActiveParentStoryDrawer(null)}
        />
      )}
    </div>
  );
};
