'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ChevronDown, Check, FileText, X, User, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../task';
import { DetailRow } from '../task-detail/components/detail-row';
import { EditableNumber, EditablePriority } from '../task-detail/components/editable-fields';
import { useResize } from '@/src/hooks/useResize';
import { userStoryService } from '@/src/services/userstory';
import { logger } from '@/src/lib/utils/logger';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useGetUserStoryById } from '@/src/modules/tasks/hooks/useUserStory';
import { WpButton } from '../button';
import { WpInput } from '../input';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { TaskDetailDrawer } from '../task-detail';
import { KanbanTask, ColumnId } from '@/src/types/board';

export interface UserStoryDetailDrawerProps {
  userStory: UserStoryResponse;
  onClose: () => void;
  onUpdate?: () => void;
  onCreateTask?: () => void;
  onDelete?: () => void;
}

type ActivityTab = 'all' | 'comments' | 'history' | 'childTickets';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: colors.colTodo, bg: colors.colTodoBg, dot: colors.colTodo },
  { value: 'in_progress', label: 'In Progress', color: colors.colInProgress, bg: colors.colInProgressBg, dot: colors.colInProgress },
  { value: 'in_review', label: 'In Review', color: colors.colInReview, bg: colors.colInReviewBg, dot: colors.colInReview },
  { value: 'testing', label: 'Testing', color: colors.colTesting, bg: colors.colTestingBg, dot: colors.colTesting },
  { value: 'done', label: 'Done', color: colors.colDone, bg: colors.colDoneBg, dot: colors.colDone },
  { value: 'blocked', label: 'Blocked', color: colors.colBlocked, bg: colors.colBlockedBg, dot: colors.colBlocked },
];

const STATUS_CONFIG = Object.fromEntries(STATUS_OPTIONS.map((opt) => [opt.value, opt]));

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
  
  // Use the hook to fetch user story data - this will auto-refresh when query is invalidated
  const { userStory: fetchedUserStory, isLoadingUserStory } = useGetUserStoryById(
    initialUserStory.project_id ?? '',
    initialUserStory.id
  );
  
  // Use fetched data if available, otherwise fall back to initial prop
  const currentUserStory = fetchedUserStory || initialUserStory;
  
  // Only keep editable fields in local state to avoid cascading renders
  const [editableFields, setEditableFields] = useState({
    title: currentUserStory.title,
    description: currentUserStory.description ?? '',
  });
  
  // Derive non-editable fields directly from currentUserStory - no state needed
  const userStoryData = useMemo(() => {
    const assigneeName = currentUserStory.assignee_name ?? currentUserStory.reporter_name ?? '';
    const assigneeInitials = assigneeName
      ? assigneeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : '';
      
    return {
      ...editableFields, // Use local state for editable fields
      priority: currentUserStory.priority
        ? ((currentUserStory.priority.charAt(0).toUpperCase() +
            currentUserStory.priority.slice(1).toLowerCase()) as Priority)
        : ('Medium' as Priority),
      status: currentUserStory.status ?? 'todo',
      storyPoints: currentUserStory.story_points ?? 0,
      assigneeId: currentUserStory.assignee_id ?? '',
      assigneeName: assigneeName,
      assigneeInitials: assigneeInitials,
      sprintId: currentUserStory.sprint_id ?? '',
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
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedAssigneeSearch = useDebounce(assigneeSearch, 500);
  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    currentUserStory.project_id ?? '',
    { page: 1, page_size: 10, name: debouncedAssigneeSearch },
    showAssigneeMenu
  );

  const assigneeMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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
        setEditableFields(prev => ({
          ...prev,
          ...(patch.title !== undefined && { title: patch.title }),
          ...(patch.description !== undefined && { description: patch.description }),
        }));
      }

      const payload: Record<string, unknown> = {};
      if (patch.title !== undefined) payload.title = patch.title;
      if (patch.description !== undefined) payload.description = patch.description;
      if (patch.priority !== undefined) payload.priority = patch.priority.toLowerCase();
      if (patch.status !== undefined) payload.status = patch.status;
      if (patch.storyPoints !== undefined) payload.story_points = patch.storyPoints;
      if (patch.assigneeId !== undefined) payload.assignee_id = patch.assigneeId || undefined;
      if (patch.sprintId !== undefined) payload.sprint_id = patch.sprintId || null;

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
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_COLORS = [
    colors.avatarBlue,
    colors.avatarGreen,
    colors.avatarPink,
    colors.avatarAmber,
    colors.avatarIndigo,
  ];

  const getMemberColor = (userId: string) =>
    AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

  const mapTaskToDrawerTask = (task: TaskResponse): KanbanTask => ({
    id: task.key ?? '',
    taskId: task.id ?? '',
    projectId: task.project_id ?? '',
    title: task.title ?? '',
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
    assigneeInitials: task.assignee_name
      ? task.assignee_name.substring(0, 2).toUpperCase()
      : 'UN',
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
              <span className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                <FileText size={13} className="text-white" />
              </span>
              <span className="text-base font-bold text-purple-600">User Story</span>
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
                        setEditableFields(prev => ({ ...prev, title: currentUserStory.title }));
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
                    <textarea
                      autoFocus
                      value={userStoryData.description}
                      onChange={(event) =>
                        setEditableFields((prev) => ({ ...prev, description: event.target.value }))
                      }
                      rows={4}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:border-blue-500"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingDesc(false);
                          handleUpdate({ description: userStoryData.description });
                        }}
                        disabled={isSaving}
                        className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
                        style={{ backgroundColor: colors.primary }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditableFields(prev => ({
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
                    {userStoryData.description || (
                      <span className="text-gray-400">Add a description…</span>
                    )}
                  </div>
                )}
              </section>

              {/* Attachments Section - Placeholder */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Attachments</p>
                </div>
                <div className="border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center bg-white">
                  <p className="text-sm text-gray-500">No attachments</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Attachments coming soon for user stories
                  </p>
                </div>
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
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
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
                            onClick={() => setSelectedTask(mapTaskToDrawerTask(task))}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            {/* Work Column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="shrink-0 text-blue-600 hover:underline font-medium">
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
                              {task.assignee_id ? (
                                <div className="flex items-center gap-2">
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
                                  <span className="text-gray-700 truncate">
                                    {task.assignee_name || 'Unassigned'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500">Unassigned</span>
                              )}
                            </td>

                            {/* Status Column */}
                            <td className="px-4 py-3">
                              <select
                                value={task.status || 'todo'}
                                onChange={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="in_review">In Review</option>
                                <option value="testing">Testing</option>
                                <option value="done">Done</option>
                                <option value="blocked">Blocked</option>
                              </select>
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
                        tab === t.key
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
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
                  <div className="text-sm text-gray-500">
                    <p>No comments yet.</p>
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
                mobileTab === 'content'
                  ? 'hidden sm:block sm:shrink-0'
                  : 'block w-full sm:shrink-0'
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
                      color: STATUS_CONFIG[userStoryData.status]?.color || colors.colTodo,
                      backgroundColor: STATUS_CONFIG[userStoryData.status]?.bg || colors.colTodoBg,
                      borderColor: `${STATUS_CONFIG[userStoryData.status]?.dot || colors.colTodo}55`,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            STATUS_CONFIG[userStoryData.status]?.dot || colors.colTodo,
                        }}
                      />
                      {STATUS_CONFIG[userStoryData.status]?.label || 'To Do'}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
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
                              name || m.user?.email?.split('@')[0] || m.user?.email || 'Unknown User';
                            const initials = getInitials(name || m.user?.email?.split('@')[0] || 'U');
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
                  <span className="text-sm text-gray-700">
                    {userStoryData.sprintId ? 'Sprint assigned' : 'No sprint'}
                  </span>
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
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
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

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            setSelectedTask(null);
            onUpdate?.();
          }}
        />
      )}
    </>
  );
};
