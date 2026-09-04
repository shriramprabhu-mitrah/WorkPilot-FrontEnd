'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Plus, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../task';
import { WpButton } from '../button';
import { WpInput } from '../input';
import { TaskDetailDrawer } from '../task-detail';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useGetChildTasks, useUpdateTask } from '@/src/modules/tasks/hooks/useTask';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import { TaskResponse } from '@/src/types/task';
import { KanbanTask, ColumnId } from '@/src/types/board';
import { logger } from '@/src/lib/utils/logger';
import toast from 'react-hot-toast';

import { usePermissions } from '@/src/hooks/usePermissions';

interface ChildTasksPanelProps {
  projectId: string;
  userStoryId: string;
  userStoryKey?: string;
  totalTasks: number;
  onCreateTask?: () => void;
  onOpenTask?: (task: KanbanTask) => void;
  onUpdate?: () => void;
}

const AVATAR_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

const getMemberColor = (userId: string) =>
  AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

const mapToDrawerTask = (task: TaskResponse): KanbanTask => ({
  id: task.key ?? '',
  taskId: task.id ?? '',
  projectId: task.project_id ?? '',
  title: task.title ?? '',
  columnId: (task.status ?? 'todo') as ColumnId,
  description: '',
  priority: task.priority
    ? ((task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
    : 'Medium',
  labels: [],
  dueDate: task.due_date ?? '',
  startDate: task.start_date ?? '',
  storyPoints: task.story_points ?? 0,
  sprint: task.sprint_name ?? '',
  parent: task.user_story_id ?? '',
  subtasks: [],
  assigneeInitials: task.assignee_name
    ? task.assignee_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '',
  assigneeColor: task.assignee?.color || '',
  reporter: '',
  reporterInitials: '',
  reporterColor: undefined,
  activity: [],
  user_story_id: task.user_story_id,
});

interface DropdownPortalProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  estimatedHeight?: number;
}

const DropdownPortal = ({
  anchorEl,
  onClose,
  children,
  width = 256,
  estimatedHeight = 140,
}: DropdownPortalProps) => {
  const portalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!anchorEl) return;
    const updatePosition = () => {
      const rect = anchorEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      let left = rect.left;
      if (left + width > viewportWidth - 8) {
        left = Math.max(8, viewportWidth - width - 8);
      }
      const dropdownHeight = portalRef.current?.getBoundingClientRect().height ?? estimatedHeight;

      const top = openUpward ? Math.max(8, rect.top - dropdownHeight - 4) : rect.bottom + 4;
      setPosition({ top, left });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [anchorEl, width, estimatedHeight]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        anchorEl &&
        !anchorEl.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorEl, onClose]);
  if (!mounted || !position) return null;
  return createPortal(
    <div
      ref={portalRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width,
        zIndex: 99999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

export const ChildTasksPanel = ({
  projectId,
  userStoryId,
  userStoryKey,
  onCreateTask,
  onOpenTask,
  onUpdate,
  totalTasks,
}: ChildTasksPanelProps) => {
  const queryClient = useQueryClient();
  const { canCreateTask, canEditTask } = usePermissions();
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';

  const {
    childTasks: fetchedPages,
    isLoadingChildTasks,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetChildTasks(projectId, userStoryId);

  const { updateTaskAsync, isUpdatingTask } = useUpdateTask();
  const { data: customStatuses = [] } = useGetStatus(projectId);

  const [localTasks, setLocalTasks] = useState<TaskResponse[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLocalTasks(fetchedPages as TaskResponse[]);
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchedPages]);

  const taskStatusOptions = useMemo(
    () =>
      customStatuses.map((status) => ({
        value: status.id,
        label: status.name,
        color: status.color,
        bg: `${status.color}18`,
        dot: status.color,
        is_final: status.is_final,
      })),
    [customStatuses]
  );

  const taskStatusConfig = useMemo(
    () => Object.fromEntries(taskStatusOptions.map((option) => [option.value, option])),
    [taskStatusOptions]
  );

  const [childAssigneeTaskId, setChildAssigneeTaskId] = useState<string | null>(null);
  const [childAssigneeSearch, setChildAssigneeSearch] = useState('');
  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState<HTMLElement | null>(null);
  const debouncedChildAssigneeSearch = useDebounce(childAssigneeSearch, 400);

  const [childStatusTaskId, setChildStatusTaskId] = useState<string | null>(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState<HTMLElement | null>(null);

  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);

  const handleOpenTask = useCallback(
    (task: TaskResponse) => {
      const drawerTask = mapToDrawerTask(task);
      if (onOpenTask) {
        onOpenTask(drawerTask);
        return;
      }
      setSelectedTask(drawerTask);
      const taskKey = task.key || task.id;
      if (typeof window !== 'undefined' && orgSlug && projectSlug && taskKey) {
        const currentPath = window.location.pathname;
        const section = currentPath.includes('/boards') ? 'boards' : 'backlog';
        window.history.pushState(null, '', `/${orgSlug}/${projectSlug}/${section}/${taskKey}`);
      }
    },
    [onOpenTask, orgSlug, projectSlug]
  );

  const handleCloseTask = useCallback(() => {
    setSelectedTask(null);
    const storyKey = userStoryKey || userStoryId;
    if (typeof window !== 'undefined' && orgSlug && projectSlug && storyKey) {
      const currentPath = window.location.pathname;
      const section = currentPath.includes('/boards') ? 'boards' : 'backlog';
      window.history.pushState(null, '', `/${orgSlug}/${projectSlug}/${section}/${storyKey}`);
    }
  }, [userStoryKey, userStoryId, orgSlug, projectSlug]);

  const {
    members: childAssigneeMembers,
    isLoadingMembers: isLoadingChildAssignees,
    isFetchingMembers: isFetchingChildAssignees,
  } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedChildAssigneeSearch },
    !!childAssigneeTaskId
  );

  const closeAssigneeDropdown = useCallback(() => {
    setChildAssigneeTaskId(null);
    setAssigneeAnchorEl(null);
    setChildAssigneeSearch('');
  }, []);

  const closeStatusDropdown = useCallback(() => {
    setChildStatusTaskId(null);
    setStatusAnchorEl(null);
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);

  useEffect(() => {
    hasNextPageRef.current = hasNextPage;
    isFetchingNextPageRef.current = isFetchingNextPage;
    fetchNextPageRef.current = fetchNextPage;
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 50 &&
      hasNextPageRef.current &&
      !isFetchingNextPageRef.current
    ) {
      fetchNextPageRef.current();
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight;
    if (!isScrollable && hasNextPageRef.current && !isFetchingNextPageRef.current) {
      fetchNextPageRef.current();
    }
  }, [localTasks]);

  if (isLoadingChildTasks) {
    return (
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Tasks</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
          Tasks ({localTasks.length})
        </p>
        {onCreateTask && canCreateTask && (
          <button
            onClick={onCreateTask}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {/* Empty state */}
      {localTasks.length === 0 ? (
        <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-xl px-4 py-5 text-center bg-white dark:bg-slate-800">
          <p className="text-sm text-gray-500 dark:text-slate-400">No tasks associated</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Create tasks to track work
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="max-h-[280px] overflow-y-auto"
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
                <tr>
                  {['Work', 'Priority', 'Assignee', 'Status'].map((col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-slate-200 text-xs uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {localTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {/* Work */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`shrink-0 font-medium hover:underline cursor-pointer ${
                            task.is_final
                              ? 'line-through text-gray-400 dark:text-slate-500 opacity-60'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                          onClick={() => handleOpenTask(task)}
                        >
                          {task.key}
                        </span>
                        <span
                          title={task.title}
                          className={`max-w-[80px] truncate cursor-pointer hover:underline ${
                            task.is_final
                              ? 'line-through text-gray-400 dark:text-slate-500 opacity-60'
                              : 'text-gray-900 dark:text-slate-100'
                          }`}
                          onClick={() => handleOpenTask(task)}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <span className="text-gray-700 dark:text-slate-300 capitalize">
                        {task.priority || 'Medium'}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={isUpdatingTask || !canEditTask}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!canEditTask) return;
                          if (childAssigneeTaskId === task.id) {
                            closeAssigneeDropdown();
                          } else {
                            setChildAssigneeTaskId(task.id ?? null);
                            setAssigneeAnchorEl(e.currentTarget);
                            setChildAssigneeSearch('');
                          }
                        }}
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left ${
                          canEditTask
                            ? 'hover:bg-gray-100 dark:hover:bg-slate-700'
                            : 'cursor-default'
                        }`}
                      >
                        {task.assignee_id ? (
                          <AssigneeAvatar
                            initials={getInitials(task.assignee_name ?? '')}
                            color={task.assignee?.color || ''}
                            size="sm"
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            <User size={12} className="text-gray-400 dark:text-slate-500" />
                          </span>
                        )}
                        <span className="text-sm text-gray-700 dark:text-slate-300 truncate">
                          {task.assignee_name || 'Unassigned'}
                        </span>
                        {canEditTask && (
                          <ChevronDown
                            size={12}
                            className="ml-auto text-gray-400 dark:text-slate-500 shrink-0"
                          />
                        )}
                      </button>

                      {childAssigneeTaskId === task.id && canEditTask && (
                        <DropdownPortal
                          anchorEl={assigneeAnchorEl}
                          onClose={closeAssigneeDropdown}
                          width={256}
                        >
                          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                            <div className="p-2 border-b border-gray-200 dark:border-slate-700">
                              <WpInput
                                value={childAssigneeSearch}
                                onChange={(e) => setChildAssigneeSearch(e.target.value)}
                                placeholder="Search assignee..."
                                autoFocus
                              />
                            </div>

                            {(isLoadingChildAssignees || isFetchingChildAssignees) && (
                              <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                                Searching...
                              </div>
                            )}

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
                                    disabled={isUpdatingTask}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const prev = {
                                        id: task.assignee_id,
                                        name: task.assignee_name,
                                      };

                                      setLocalTasks((prevTasks) =>
                                        prevTasks.map((t) =>
                                          t.id === task.id
                                            ? {
                                                ...t,
                                                assignee_id: m.user_id,
                                                assignee_name: displayName,
                                              }
                                            : t
                                        )
                                      );
                                      closeAssigneeDropdown();

                                      try {
                                        await updateTaskAsync({
                                          projectId,
                                          taskId: task.id ?? '',
                                          payload: { assignee_id: m.user_id },
                                        });
                                        await queryClient.invalidateQueries({
                                          queryKey: ['tasks', projectId, 'child', userStoryId],
                                        });
                                      } catch (error) {
                                        logger.log('Failed to update assignee', error);
                                        toast.error('Failed to update assignee');
                                        setLocalTasks((prevTasks) =>
                                          prevTasks.map((t) =>
                                            t.id === task.id
                                              ? {
                                                  ...t,
                                                  assignee_id: prev.id,
                                                  assignee_name: prev.name,
                                                }
                                              : t
                                          )
                                        );
                                      }
                                    }}
                                    className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
                                  >
                                    <AssigneeAvatar initials={initials} color={color} size="sm" />
                                    <span className="truncate">{displayName}</span>
                                    {m.user_id === task.assignee_id && (
                                      <Check
                                        size={12}
                                        className="ml-auto text-blue-600 dark:text-blue-400 shrink-0"
                                      />
                                    )}
                                  </WpButton>
                                );
                              })}

                            {!isLoadingChildAssignees &&
                              !isFetchingChildAssignees &&
                              !childAssigneeSearch && (
                                <WpButton
                                  type="button"
                                  variant="ghost"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const prevId = task.assignee_id;
                                    const prevName = task.assignee_name;

                                    setLocalTasks((prevTasks) =>
                                      prevTasks.map((t) =>
                                        t.id === task.id
                                          ? {
                                              ...t,
                                              assignee_id: undefined,
                                              assignee_name: undefined,
                                            }
                                          : t
                                      )
                                    );
                                    closeAssigneeDropdown();

                                    try {
                                      await updateTaskAsync({
                                        projectId,
                                        taskId: task.id ?? '',
                                        payload: { assignee_id: null },
                                      });
                                      await queryClient.invalidateQueries({
                                        queryKey: ['tasks', projectId, 'child', userStoryId],
                                      });
                                    } catch (error) {
                                      logger.log('Failed to unassign', error);
                                      setLocalTasks((prevTasks) =>
                                        prevTasks.map((t) =>
                                          t.id === task.id
                                            ? { ...t, assignee_id: prevId, assignee_name: prevName }
                                            : t
                                        )
                                      );
                                    }
                                  }}
                                  className="!w-full !justify-start !px-3 !py-2 !rounded-none text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                  <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center shrink-0">
                                    <User size={11} className="text-gray-400" />
                                  </span>
                                  Unassigned
                                </WpButton>
                              )}

                            {!isLoadingChildAssignees &&
                              !isFetchingChildAssignees &&
                              childAssigneeSearch &&
                              childAssigneeMembers?.length === 0 && (
                                <div className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                                  No users found
                                </div>
                              )}
                          </div>
                        </DropdownPortal>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {(() => {
                        const currentStatus =
                          taskStatusConfig[task.status_id ?? ''] ||
                          taskStatusConfig[task.status] ||
                          taskStatusOptions.find(
                            (o) => o.label.toLowerCase() === task.status?.toLowerCase()
                          );

                        return (
                          <>
                            <button
                              type="button"
                              disabled={isUpdatingTask || !canEditTask}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!canEditTask) return;
                                if (childStatusTaskId === task.id) {
                                  closeStatusDropdown();
                                } else {
                                  setChildStatusTaskId(task.id ?? null);
                                  setStatusAnchorEl(e.currentTarget);
                                }
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold w-full justify-between transition-all shadow-sm border ${
                                !canEditTask ? 'cursor-default' : ''
                              }`}
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
                                  {currentStatus?.label || task.status || 'To Do'}
                                </span>
                              </span>
                              {canEditTask && <ChevronDown size={13} className="shrink-0" />}
                            </button>

                            {childStatusTaskId === task.id && canEditTask && (
                              <DropdownPortal
                                anchorEl={statusAnchorEl}
                                onClose={closeStatusDropdown}
                                width={224}
                              >
                                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                                  {taskStatusOptions.map((option) => {
                                    const isSelected =
                                      option.value === task.status_id ||
                                      option.label.toLowerCase() === task.status?.toLowerCase();

                                    return (
                                      <button
                                        key={option.value}
                                        type="button"
                                        disabled={isUpdatingTask}
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (isSelected) {
                                            closeStatusDropdown();
                                            return;
                                          }

                                          const prevStatus = task.status;
                                          const prevStatusId = task.status_id;
                                          const prevIsFinal = task.is_final;

                                          setLocalTasks((prev) =>
                                            prev.map((t) =>
                                              t.id === task.id
                                                ? {
                                                    ...t,
                                                    status: option.label,
                                                    status_id: option.value,
                                                    status_color: option.color,
                                                    is_final: option.is_final,
                                                  }
                                                : t
                                            )
                                          );
                                          closeStatusDropdown();

                                          try {
                                            await updateTaskAsync({
                                              projectId,
                                              taskId: task.id ?? '',
                                              payload: { status_id: option.value },
                                            });
                                            await queryClient.invalidateQueries({
                                              queryKey: ['tasks', projectId, 'child', userStoryId],
                                            });
                                          } catch (error) {
                                            logger.log('Failed to update status', error);
                                            setLocalTasks((prev) =>
                                              prev.map((t) =>
                                                t.id === task.id
                                                  ? {
                                                      ...t,
                                                      status: prevStatus,
                                                      status_id: prevStatusId,
                                                      is_final: prevIsFinal,
                                                    }
                                                  : t
                                              )
                                            );
                                          }
                                        }}
                                        className="w-full text-left px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                        style={{
                                          fontWeight: isSelected ? 700 : 500,
                                          color: isSelected ? option.color : '#666666',
                                          backgroundColor: isSelected ? option.bg : undefined,
                                        }}
                                      >
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0"
                                          style={{ backgroundColor: option.dot }}
                                        />
                                        <div className="flex items-center gap-1 min-w-0">
                                          <span className="truncate">{option.label}</span>
                                          {option.is_final && (
                                            <span
                                              title="Final status"
                                              className="w-2 h-2 rounded-full bg-green-600 shrink-0"
                                            />
                                          )}
                                        </div>
                                        <div className="ml-auto flex items-center">
                                          {isSelected && <Check size={13} className="shrink-0" />}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </DropdownPortal>
                            )}
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isFetchingNextPage && (
              <div className="flex justify-center py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={handleCloseTask}
          onOpenUserStory={handleCloseTask}
          onUpdate={() => {
            queryClient.invalidateQueries({
              queryKey: ['tasks', projectId, 'child', userStoryId],
            });
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
};

export default ChildTasksPanel;
