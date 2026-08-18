import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Check,
  FileText,
  MoreVertical,
  Plus,
  X,
  User,
  Paperclip,
  Download,
  Trash2,
  Pencil,
  Copy,
} from 'lucide-react';
import type { ColumnId, KanbanTask, Priority, SubTask } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../task';
import { ActivitySection } from './components/activity-section';
import { COLUMN_CONFIG, COLUMN_ORDER } from './components/badges';
import { DetailRow } from './components/detail-row';
import {
  EditableDate,
  EditableLabels,
  EditableNumber,
  EditablePriority,
  EditableText,
} from './components/editable-fields';
import { useResize } from '@/src/hooks/useResize';
import { taskService } from '@/src/services/tasks';
import { logger } from '@/src/lib/utils/logger';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { WpButton } from '../button';
import { WpInput } from '../input';
import { useTaskAttachments } from '@/src/modules/tasks/hooks/useTaskAttachment';
import WpRichTextEditor from '../htmlEditor';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';

interface CustomStatus {
  id: string;
  project_id: string;
  name: string;
  color: string;
  display_order: number;
  is_default: boolean;
}
import { useCloneTask, useDeleteTask } from '@/src/modules/tasks/hooks/useTask';
import toast from 'react-hot-toast';

export interface TaskDetailDrawerProps {
  task: KanbanTask;
  onClose: () => void;
  onUpdate?: (updated: Partial<KanbanTask>) => void;
  onDelete?: () => void;
}

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

export const TaskDetailDrawer = ({ task, onClose, onUpdate, onDelete }: TaskDetailDrawerProps) => {
  const [taskData, setTaskData] = useState({
    subtasks: task.subtasks ?? [],
    status: task.status ?? task.columnId ?? '',
    description: task.description ?? '',
    priority: task.priority,
    labels: task.labels,
    dueDate: task.dueDate ?? '',
    startDate: task.startDate ?? '',
    storyPoints: task.storyPoints,
    sprint: task.sprint ?? '',
    parent: task.parent ?? '',
    assignee: task.assigneeInitials,
    assigneeColor: task.assigneeColor,
    assigneeId: '',
    assigneeName: '',
  });
  // const [members, setMembers] = useState<ProjectMember[]>([]);

  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [keepAssignee, setKeepAssignee] = useState(true);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 500);
  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    task.projectId ?? '',
    {
      page: 1,
      page_size: 10,
      name: debouncedAssigneeSearch,
    },
    showAssigneeMenu
  );
  const assigneeMenuRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const assigneeSearchRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedDescription, setSavedDescription] = useState('');
  const hasFetched = useRef<string | null>(null);
  const {
    attachments,
    isLoadingAttachments,
    isFetchingAttachments,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  } = useTaskAttachments(task.projectId ?? '', task.taskId ?? '');
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(task.projectId ?? '');
  const statusOptions = statuses.map((status) => ({
    value: status.id,
    label: status.name,
    color: status.color,
  }));

  const selectedStatus = statuses.find((status) => status.id === taskData.status);
  const { cloneTaskAsync, isCloningTask } = useCloneTask();
  const { deleteTaskAsync: deleteTask, isDeletingTask } = useDeleteTask(task.projectId ?? '');

  const handleUpdate = useCallback(
    async (patch: Partial<typeof taskData>) => {
      if (!task.projectId || !task.taskId) return;

      const previousState = { ...taskData };
      setTaskData((prev) => ({ ...prev, ...patch }));
      onUpdate?.(patch as Partial<KanbanTask>);

      // Then update on server
      const payload: Record<string, unknown> = {};
      if (patch.description !== undefined) payload.description = patch.description;
      if (patch.priority !== undefined) payload.priority = patch.priority.toLowerCase();
      if (patch.status !== undefined) {
        const STATUS_MAP: Record<string, string> = {
          todo: 'todo',
          in_progress: 'in_progress',
          inreview: 'inreview',
          testing: 'testing',
          done: 'completed',
          blocked: 'blocked',
        };
        payload.status_id = STATUS_MAP[patch.status] ?? patch.status;
      }
      if (patch.dueDate !== undefined) {
        payload.due_date = patch.dueDate ? patch.dueDate + 'Z' : null;
      }
      if (patch.startDate !== undefined) payload.start_date = patch.startDate || null;
      if (patch.storyPoints !== undefined) payload.story_points = patch.storyPoints;
      try {
        setIsSaving(true);
        await taskService.updateTask(task.projectId, task.taskId, payload);
      } catch (error) {
        logger.log('Failed to update task', error);
        // Revert on error
        setTaskData(previousState);
        onUpdate?.(previousState as Partial<KanbanTask>);
      } finally {
        setIsSaving(false);
      }
    },
    [task.projectId, task.taskId, onUpdate, taskData]
  );

  useEffect(() => {
    if (hasFetched.current === task.taskId) return;

    hasFetched.current = task.taskId ?? null;
    const fetchDetail = async () => {
      if (!task.projectId || !task.taskId) return;

      try {
        setIsLoading(true);
        const taskRes = await taskService.getTaskById(task.projectId, task.taskId);
        if (taskRes.data) {
          const d = taskRes.data;
          const apiDescription = d.description ?? '';
          const assigneeName = d.assignee_name ?? '';
          const initials = assigneeName
            ? assigneeName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : task.assigneeInitials;
          setTaskData((prev) => ({
            ...prev,
            description: d.description ?? prev.description,
            priority: d.priority
              ? ((d.priority.charAt(0).toUpperCase() +
                  d.priority.slice(1).toLowerCase()) as Priority)
              : prev.priority,
            status: d.status ?? prev.status,
            dueDate: d.due_date ? d.due_date?.replace(/Z$/, '') : '',
            storyPoints: d.story_points ?? prev.storyPoints,
            sprint: d.sprint_name ?? prev.sprint,
            assignee: initials,
            assigneeColor: task.assigneeColor,
            assigneeId: d.assignee_id ?? '',
            assigneeName: assigneeName,
          }));
          setSavedDescription(apiDescription);
        }
      } catch (error) {
        logger.log('Failed to fetch task detail', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [task.taskId, task.projectId]);

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
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setUiState((prev) => ({ ...prev, showStatusMenu: false }));
      }
      if (assigneeMenuRef.current && !assigneeMenuRef.current.contains(event.target as Node)) {
        setShowAssigneeMenu(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
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
    } catch (error) {}
  };
  const handleAttachmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAttachment.mutateAsync(formData);
    } catch (error) {
    } finally {
      event.target.value = '';
    }
  };

  const handleClone = async () => {
    if (!task.projectId || !task.taskId) return;

    try {
      await cloneTaskAsync({
        projectId: task.projectId,
        taskId: task.taskId,
        payload: { keep_assignee: keepAssignee },
      });
      setShowCloneModal(false);
      onClose();
    } catch (error) {
      toast.error('Failed to clone task');
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
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };
  return (
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
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <FileText size={13} className="text-white" />
            </span>
            <span className="text-base font-bold text-blue-600">{task.id}</span>
            {task.sprint && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-medium text-gray-500">{task.sprint}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Three-dot menu */}
            <div className="relative" ref={actionMenuRef}>
              <button
                onClick={() => setShowActionMenu(!showActionMenu)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <MoreVertical size={17} />
              </button>

              {showActionMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionMenu(false);
                      // Update is handled inline in the drawer
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} />
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionMenu(false);
                      setShowCloneModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={14} />
                    Clone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Close button */}
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
              mobileTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setMobileTab('details')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mobileTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Details
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            </div>
          )}
          <div
            className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 border-r border-gray-200 ${
              mobileTab === 'details' ? 'hidden sm:block' : 'block'
            }`}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-5 leading-snug">{task.title}</h1>

            {/* future purpose
             <div className="flex flex-wrap items-center gap-2 mb-6">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Plus size={14} /> Add child Ticket
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <Link2 size={14} /> Link issue
              </button>
            </div> */}

            <section className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Description</p>

              {uiState.editingDesc ? (
                <div>
                  <WpRichTextEditor
                    value={taskData.description}
                    onChange={(value) =>
                      setTaskData((prev) => ({
                        ...prev,
                        description: value,
                      }))
                    }
                    placeholder="Add a description..."
                    minHeight="120px"
                  />

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setUiState((prev) => ({
                          ...prev,
                          editingDesc: false,
                        }));

                        handleUpdate({
                          description: taskData.description,
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
                        setTaskData((prev) => ({
                          ...prev,
                          description: savedDescription,
                        }));
                        setUiState((prev) => ({
                          ...prev,
                          editingDesc: false,
                        }));
                      }}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setUiState((prev) => ({
                      ...prev,
                      editingDesc: true,
                    }));
                  }}
                  className="w-full min-h-[48px] cursor-text"
                >
                  {taskData.description ? (
                    <div
                      className="pointer-events-none"
                      dangerouslySetInnerHTML={{
                        __html: taskData.description,
                      }}
                    />
                  ) : (
                    <span className="text-gray-400">Add a description…</span>
                  )}
                </div>
              )}
            </section>

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
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Attachments</p>

                <input
                  ref={attachmentInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleAttachmentUpload}
                />

                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  disabled={uploadAttachment.isPending}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <Paperclip size={14} />
                  {uploadAttachment.isPending ? 'Uploading...' : 'Add'}
                </button>
              </div>

              {/* Empty state */}
              {isLoadingAttachments || isFetchingAttachments ? (
                <div className="border border-gray-200 rounded-xl px-4 py-5 text-center bg-white">
                  <p className="text-sm text-gray-400">Loading attachments...</p>
                </div>
              ) : !attachments?.data?.length ? (
                <div className="border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center bg-white">
                  <div className="w-9 h-9 mx-auto mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Paperclip size={16} className="text-gray-400" />
                  </div>

                  <p className="text-sm text-gray-500">No attachments</p>

                  <p className="text-xs text-gray-400 mt-1">Add files to this task</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments?.data?.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                    >
                      {/* File icon */}
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText size={17} className="text-gray-500" />
                      </div>

                      {/* File details */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-gray-700 truncate"
                          title={attachment.original_filename}
                        >
                          {attachment.original_filename}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatFileSize(attachment.file_size)}
                        </p>
                      </div>

                      {/* Download */}
                      <button
                        type="button"
                        onClick={() =>
                          handleAttachmentDownload(attachment.id, attachment.original_filename)
                        }
                        disabled={downloadAttachment.isPending}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        title="Download"
                      >
                        <Download size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => deleteAttachment.mutate(attachment.id)}
                        disabled={deleteAttachment.isPending}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ActivitySection items={task.activity ?? []} />
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
              mobileTab === 'content' ? 'hidden sm:block sm:shrink-0' : 'block w-full sm:shrink-0'
            }`}
            style={{ width: isMobile ? undefined : rightWidth }}
          >
            <div className="px-5 py-5 border-b border-gray-300">
              <p className="text-base font-semibold text-gray-800 mb-2">Status</p>

              <div className="relative" ref={statusMenuRef}>
                <button
                  type="button"
                  onClick={() =>
                    setUiState((prev) => ({
                      ...prev,
                      showStatusMenu: !prev.showStatusMenu,
                    }))
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border"
                  style={{
                    color: selectedStatus?.color ?? '#6B7280',
                    backgroundColor: selectedStatus ? `${selectedStatus.color}15` : '#F3F4F6',
                    borderColor: selectedStatus ? `${selectedStatus.color}55` : '#D1D5DB',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: selectedStatus?.color ?? '#9CA3AF',
                      }}
                    />

                    {selectedStatus?.name ?? 'Select status'}
                  </span>

                  <ChevronDown size={14} />
                </button>

                {uiState.showStatusMenu && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                    {isLoadingStatus ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Loading statuses...
                      </div>
                    ) : statusOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No statuses found
                      </div>
                    ) : (
                      statusOptions.map((status) => {
                        const isSelected = taskData.status === status.value;

                        return (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() => {
                              setUiState((prev) => ({
                                ...prev,
                                showStatusMenu: false,
                              }));

                              handleUpdate({
                                status: status.value,
                              });
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: status.color,
                              }}
                            />

                            <span className="flex-1 truncate">{status.label}</span>

                            {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-5 border-b border-gray-200">
              <p className="text-base font-semibold text-gray-800 mb-2">Details</p>

              <DetailRow label="Assignee">
                <div className="relative" ref={assigneeMenuRef}>
                  <button
                    onClick={() => setShowAssigneeMenu((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    {taskData.assigneeId ? (
                      <AssigneeAvatar
                        initials={taskData.assignee}
                        color={getMemberColor(taskData.assigneeId)}
                        size="sm"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User size={12} className="text-gray-400" />
                      </span>
                    )}
                    <span className="text-sm text-gray-700 truncate">
                      {taskData.assigneeName || 'Unassigned'}
                    </span>
                    <ChevronDown size={12} className="ml-auto text-gray-400 shrink-0" />
                  </button>
                  {showAssigneeMenu && (
                    <div className="absolute top-full left-0 mt-1 w-full  bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-gray-200">
                        <WpInput
                          ref={assigneeSearchRef}
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
                            name || m.user?.email?.split('@')[0] || m.user?.email || 'Unknown User';
                          const initials = getInitials(name || m.user?.email?.split('@')[0] || 'U');
                          const color = getMemberColor(m.user_id);
                          return (
                            <WpButton
                              key={m.user_id}
                              type="button"
                              variant="ghost"
                              onClick={async () => {
                                if (!task.projectId || !task.taskId) return;
                                setTaskData((prev) => ({
                                  ...prev,
                                  assignee: initials,
                                  assigneeId: m.user_id,
                                  assigneeName: displayName,
                                  assigneeColor: color,
                                }));
                                onUpdate?.({
                                  assigneeInitials: initials,
                                  assigneeColor: color,
                                });
                                setShowAssigneeMenu(false);
                                setAssigneeSearch('');
                                try {
                                  await taskService.updateTask(task.projectId, task.taskId, {
                                    assignee_id: m.user_id,
                                  });
                                } catch (error) {
                                  logger.log('Failed to update assignee', error);
                                }
                              }}
                              className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 text-gray-900"
                            >
                              <AssigneeAvatar initials={initials} color={color} size="sm" />
                              <span className="truncate">{displayName}</span>
                              {m.user_id === taskData.assigneeId && (
                                <Check size={12} className="ml-auto text-blue-600 shrink-0" />
                              )}
                            </WpButton>
                          );
                        })}
                      {!isLoadingMembers &&
                        !isFetchingMembers &&
                        assigneeSearch &&
                        (!members || members.length === 0) && (
                          <div className="px-3 py-3 text-sm text-gray-500 text-center">
                            No members found
                          </div>
                        )}

                      {/* Unassigned */}
                      {!isLoadingMembers && !isFetchingMembers && !assigneeSearch && (
                        <WpButton
                          type="button"
                          variant="ghost"
                          onClick={async () => {
                            if (!task.projectId || !task.taskId) return;

                            setShowAssigneeMenu(false);
                            setAssigneeSearch('');

                            try {
                              await taskService.updateTask(task.projectId, task.taskId, {
                                assignee_id: undefined,
                              });

                              setTaskData((prev) => ({
                                ...prev,
                                assignee: '',
                                assigneeId: '',
                                assigneeName: '',
                              }));

                              onUpdate?.({
                                assigneeInitials: '',
                                assigneeColor: '',
                              });
                            } catch (error) {
                              logger.log('Failed to unassign', error);
                            }
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
                {task.reporterInitials ? (
                  <div className="flex items-center gap-2">
                    <AssigneeAvatar
                      initials={task.reporterInitials}
                      color={task.reporterColor ?? colors.avatarIndigo}
                      size="sm"
                    />
                    <span className="text-sm text-gray-700">{task.reporter}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </DetailRow>

              <DetailRow label="Priority">
                <EditablePriority
                  value={taskData.priority}
                  onChange={(priority) => handleUpdate({ priority })}
                />
              </DetailRow>

              <DetailRow label="Sprint">
                <EditableText
                  value={taskData.sprint}
                  onChange={(sprint) => setTaskData((prev) => ({ ...prev, sprint }))}
                  placeholder="No sprint"
                />
              </DetailRow>

              <DetailRow label="Labels">
                <EditableLabels
                  value={taskData.labels}
                  onChange={(labels) => setTaskData((prev) => ({ ...prev, labels }))}
                />
              </DetailRow>

              <DetailRow label="Due date">
                <EditableDate
                  value={taskData.dueDate}
                  onChange={(dueDate) => handleUpdate({ dueDate })}
                  placeholder="Set due date"
                  includeTime={true}
                />
              </DetailRow>

              <DetailRow label="Start date">
                <EditableDate
                  value={taskData.startDate}
                  onChange={(startDate) => handleUpdate({ startDate })}
                  placeholder="Set start date"
                />
              </DetailRow>

              <DetailRow label="Story pts">
                <EditableNumber
                  value={taskData.storyPoints}
                  onChange={(storyPoints) => handleUpdate({ storyPoints })}
                />
              </DetailRow>

              <DetailRow label="Parent">
                <EditableText
                  value={taskData.parent}
                  onChange={(parent) => setTaskData((prev) => ({ ...prev, parent }))}
                  placeholder="None"
                />
              </DetailRow>
            </div>
          </div>
        </div>
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowCloneModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Clone Task</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a copy of this task with the same details.
            </p>

            <label className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                checked={keepAssignee}
                onChange={(e) => setKeepAssignee(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Keep assignee</span>
            </label>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCloneModal(false)}
                disabled={isCloningTask}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={isCloningTask}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: colors.primary }}
              >
                {isCloningTask ? 'Cloning...' : 'Clone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Task</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingTask}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={isDeletingTask}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isDeletingTask ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
