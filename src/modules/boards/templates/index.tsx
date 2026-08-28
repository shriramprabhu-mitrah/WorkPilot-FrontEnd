'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Filter, Layers } from 'lucide-react';
import { logger } from '@/src/lib/utils/logger';
import { useAppSelector } from '@/src/store';
import { useGetTasks } from '@/src/modules/tasks/hooks/useTask';
import { useGetUserStories } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { taskService } from '@/src/services/tasks';
import { useQueryClient } from '@tanstack/react-query';
import { GetTasksQueryParams, Task, TaskResponse } from '@/src/types/task';
import { taskTypeOptions } from '@/src/app/components/common/enum';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  defaultDropAnimationSideEffects,
  useDroppable,
} from '@dnd-kit/core';
import type { DropAnimation } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { colors } from '@/src/styles/colors';
import { KanbanTask } from '@/src/types/board';
import { KanbanCardPreview } from '../components/kanbannCardsPreviews';
import { FilterPanel, FilterState } from '@/src/app/components/common/filter-panel';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';
import { WpButton } from '@/src/app/components/common/button';
import BoardSkeleton from '../components/boardSkeleton';
import { UserStoryResponse } from '@/src/types/userstories';
import { KanbanCardContent } from '../components/kanbannCardContent';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { CustomStatus } from '@/src/types/colors';
import { ScrollIndicator } from '../components/scrollIndicator';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import { useDeleteUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import toast from 'react-hot-toast';
import { useDebounce } from '@/src/hooks/useDebounce';
import { usePermissions } from '@/src/hooks/usePermissions';

// Task card component for the swimlane
const TaskCard = ({ task, onRefetch }: { task: KanbanTask; onRefetch: () => void }) => {
  const [showModal, setShowModal] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'card', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    willChange: 'transform',
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          borderColor: colors.dragPlaceholderBorder,
          backgroundColor: colors.dragPlaceholderBg,
        }}
        className="rounded-xl border-2 border-dashed h-[120px] w-full"
      />
    );
  }

  const handleClose = () => {
    setShowModal(false);
    onRefetch();
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowModal(true)}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer select-none touch-none w-full"
      >
        <KanbanCardContent task={task} />
      </div>

      {showModal && <TaskDetailDrawer task={task} onClose={handleClose} />}
    </>
  );
};

// Droppable column cell for each status in a user story row
const StatusCell = ({
  storyId,
  statusId,
  tasks,
  isOver,
  onRefetch,
}: {
  storyId: string;
  statusId: string;
  tasks: KanbanTask[];
  isOver: boolean;
  onRefetch: () => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: `${storyId}-${statusId}`,
    data: { type: 'cell', storyId, statusId },
  });

  const taskIds = tasks.map((task) => task.id);
  const needsScroll = tasks.length > 3;

  // Prevent outer scroll when scrolling inside the column
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!needsScroll) return;

    const element = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;

    // Check if we're at the boundaries
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // Prevent outer scroll only if we're not at the boundaries
    if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={setNodeRef}
      onWheel={handleWheel}
      style={{
        ...(isOver ? { backgroundColor: colors.dropBg, outlineColor: colors.dropRing } : {}),
        ...(needsScroll ? { maxHeight: '400px', overflowY: 'scroll' } : {}),
      }}
      className={`min-h-[100px] p-2 rounded-lg transition-colors duration-200 ${
        isOver ? 'outline outline-2 outline-offset-[-2px]' : ''
      }`}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onRefetch={onRefetch} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

// User story row component with accordion
const UserStoryRow = ({
  story,
  statuses,
  overCell,
  onUserStoryClick,
  onRefetch,
  collapsedStatuses,
}: {
  story: UserStoryResponse & { tasksByStatus: Map<string, KanbanTask[]> };
  statuses: CustomStatus[];
  overCell: { storyId: string; statusId: string } | null;
  onUserStoryClick: (story: UserStoryResponse) => void;
  onRefetch: () => void;
  collapsedStatuses: Set<string>;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const isSpecialStory = story.id === 'direct-sprint-tasks' || story.id === 'no-story';

  return (
    <div
      className={`border-b border-gray-200 ${isSpecialStory ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
    >
      <div className="flex items-stretch">
        {/* Sticky User Story Column on the left */}
        <div
          className={`sticky left-0 z-10 border-r w-[200px] sm:w-[250px] flex-shrink-0 p-3 flex flex-col justify-start transition-colors ${
            isSpecialStory
              ? 'bg-indigo-50 border-indigo-200/80 dark:bg-slate-900/90 dark:border-indigo-900/50'
              : 'bg-gray-50 border-gray-200 dark:bg-gray-800/90 dark:border-gray-700'
          }`}
        >
          <div className="flex items-start gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 rounded transition-all duration-200 mt-0.5"
              aria-label={isExpanded ? 'Collapse story tasks' : 'Expand story tasks'}
            >
              <svg
                className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 ease-in-out ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div
              onClick={() => {
                if (!isSpecialStory) {
                  onUserStoryClick(story);
                }
              }}
              onMouseEnter={(e) => {
                if (isSpecialStory) return;
                setShowStoryPopup(true);
                setPopupPosition({
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onMouseMove={(e) => {
                if (isSpecialStory) return;
                setPopupPosition({
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onMouseLeave={() => setShowStoryPopup(false)}
              className={`relative flex items-start gap-2 flex-1 min-w-0 ${
                !isSpecialStory ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              {isSpecialStory ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-200 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
                      <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      Storyless Tasks
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 pl-0.5">
                    {story.total_tasks ?? 0} {story.total_tasks === 1 ? 'task' : 'tasks'} (no story)
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{
                      backgroundColor:
                        story.priority === 'high'
                          ? '#dc2626'
                          : story.priority === 'medium'
                            ? '#f59e0b'
                            : '#10b981',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold text-gray-800 truncate dark:text-slate-100 ${
                        !isSpecialStory ? 'group-hover:text-blue-600 transition-colors' : ''
                      } ${story.is_closed ? 'line-through' : ''}`}
                    >
                      {story.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {story.total_tasks ?? 0} tasks · {story.story_points ?? 0} pts
                    </p>
                  </div>
                </>
              )}
              {showStoryPopup &&
                typeof document !== 'undefined' &&
                createPortal(
<div
  className="fixed z-[99999] min-w-72 w-fit max-w-[500px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
                    style={{
                      left: popupPosition.x + 12,
                      top: popupPosition.y + 12,
                    }}
                  >
                    {/* Name */}
{/* Name */}
<div className="flex items-start justify-between gap-4">
  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
    Name
  </span>

  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 text-right break-words">
    {story.title}
  </span>
</div>
                    <div className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500">Status</span>
                        <span className="text-sm font-medium text-gray-800 capitalize">
                          {story.status?.replace('_', ' ') || '-'}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Assignee</span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                          {story.assignee_name || story.assignee?.name || 'Unassigned'}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Due Date</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {story.due_date ? new Date(story.due_date).toLocaleDateString() : '-'}
                        </span>
                      </div>

                      {/* Reporter */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Reporter</span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                          {story.reporter_name || story.reporter?.name || '-'}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Priority</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
                          {story.priority || '-'}
                        </span>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>

          {/* Empty status columns for header row */}
          {statuses.map((status) => {
            const isCollapsed = collapsedStatuses.has(status.id);
            return (
              <div
                key={status.id}
                className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                  isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
                }`}
              />
            );
          })}
        </div>

        {statuses.map((status) => {
          const tasks = story.tasksByStatus.get(status.id) || [];
          const isOver = overCell?.storyId === story.id && overCell?.statusId === status.id;
          const isCollapsed = collapsedStatuses.has(status.id);

          return (
            <div
              key={status.id}
              className={`flex-shrink-0 border-r border-gray-200 transition-all duration-300 ${
                isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
              }`}
            >
              {/* Expanded Tasks with smooth CSS Grid animation */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isExpanded && !isCollapsed
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <StatusCell
                    storyId={story.id}
                    statusId={status.id}
                    tasks={tasks}
                    isOver={isOver}
                    onRefetch={onRefetch}
                  />
                </div>
              </div>

              {/* Collapsed summary with smooth transition */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  !isExpanded || isCollapsed
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="h-[52px] p-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      {tasks.length > 0 ? (
                        isCollapsed ? (
                          tasks.length
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const KanbanBoardTemplate = () => {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overCell, setOverCell] = useState<{ storyId: string; statusId: string } | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, { statusId: string; storyId?: string }>
  >(new Map());
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [collapsedStatuses, setCollapsedStatuses] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskUserStoryId, setTaskUserStoryId] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    labels: [],
    types: [],
    statuses: [],
  });
  const [assigneeIdFilter, setAssigneeIdFilter] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [filterMemberSearch, setFilterMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const debouncedFilterMemberSearch = useDebounce(filterMemberSearch, 500);

  const queryClient = useQueryClient();
  const deleteUserStoryMutation = useDeleteUserStory();
  const {
    canViewTasks,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canViewUserStories,
    canEditUserStory,
    canDeleteUserStory,
    canViewSprints,
  } = usePermissions();

  const filterRef = useRef<HTMLDivElement>(null);

  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );
  const selectedProject = storeProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';

  // Fetch project members for outer avatar display (always fetch all members, no search)
  const { members: displayMembers, isLoadingMembers: isLoadingDisplayMembers } =
    useGetProjectMembers(
      selectedProject,
      {
        page: 1,
        page_size: 50,
        name: '', // No search filter for display members
      },
      true // Always fetch
    );

  // Fetch project members for assignee filtering with search
  const {
    members: filterMembers,
    isLoadingMembers: isLoadingFilterMembers,
    isFetchingMembers: isFetchingFilterMembers,
  } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 50,
      name: debouncedFilterMemberSearch,
    },
    showFilter // Only fetch when filter is open
  );

  // Get project members with search for task modal
  const {
    members: projectMembers,
    isLoadingMembers: isLoadingProjectMembers,
    isFetchingMembers: isFetchingProjectMembers,
  } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 10,
      name: debouncedMemberSearch,
    },
    showAddTaskModal && canCreateTask // Only fetch when modal is open and has permission
  );

  // Generate assignee options from fetched members
  const assigneeOptions =
    projectMembers?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  useOutsideClick(filterRef, () => setShowFilter(false));

  // 1. Direct Sprint Tasks query params (tasks with no user story, in current sprint)
  const directSprintQueryParams = useMemo((): GetTasksQueryParams => {
    const params: GetTasksQueryParams = {
      user_story_id: null,
      page_size: 100,
    };

    if (selectedSprint) {
      params.sprint_id = selectedSprint;
    }

    if (filters.priorities.length > 0) {
      params.priority = filters.priorities.map((p) => p.toLowerCase()).join(',');
    }
    if (assigneeIdFilter.length > 0) {
      params.assignee_id = assigneeIdFilter.join(',');
    }
    if (filters.types.length > 0) {
      params.type = filters.types.map((t) => t.toLowerCase()).join(',');
    }
    if (filters.statuses.length > 0) {
      params.status_id = filters.statuses.join(',');
    }

    return params;
  }, [selectedSprint, filters.priorities, filters.types, filters.statuses, assigneeIdFilter]);

  const canViewBoard = canViewTasks && canViewUserStories && canViewSprints;

  // Fetch Direct Sprint Tasks
  const {
    tasksList: directSprintTasksList,
    isLoadingTasks: isLoadingDirectSprintTasks,
    refetchTasks: refetchDirectSprintTasks,
  } = useGetTasks(selectedProject, directSprintQueryParams, !!selectedProject && canViewBoard);

  // Also fetch user stories for grouping (without filters)
  const { userStories, isLoadingUserStories, refetchUserStories } = useGetUserStories(
    selectedProject,
    selectedSprint ? { sprint_id: selectedSprint, page_size: 100 } : { page_size: 100 },
    !!selectedProject && canViewBoard
  );

  const handleRefetch = useCallback(() => {
    refetchUserStories();
    refetchDirectSprintTasks();
  }, [refetchUserStories, refetchDirectSprintTasks]);

  // Fetch status columns
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(selectedProject);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const boardLoading =
    !!selectedProject &&
    canViewBoard &&
    (isLoadingDirectSprintTasks || isLoadingUserStories || isLoadingStatus);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.4' } },
    }),
    duration: 150,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const hasActiveFilter =
    filters.priorities.length > 0 ||
    assigneeIdFilter.length > 0 ||
    filters.labels.length > 0 ||
    filters.types.length > 0 ||
    filters.statuses.length > 0;

  // Helper to resolve status ID for a task
  const resolveStatusId = useCallback(
    (task: TaskResponse): string => {
      // 1. If task has status_id and it directly matches a custom status
      if (task.status_id && statuses.some((s) => s.id === task.status_id)) {
        return task.status_id;
      }

      // 2. If task.status matches a status id
      if (task.status && statuses.some((s) => s.id === task.status)) {
        return task.status;
      }

      // 3. Match by name (case-insensitive) against task.status or task.status_id
      const targetStatusName = (task.status || task.status_id || '')
        .toLowerCase()
        .replace(/_/g, ' ');
      const matchedByName = statuses.find((s) => {
        const sName = s.name.toLowerCase().replace(/_/g, ' ');
        return sName === targetStatusName;
      });

      if (matchedByName) {
        return matchedByName.id;
      }

      // 4. Fallback to first custom status or task status_id
      return task.status_id || task.status || statuses[0]?.id || '';
    },
    [statuses]
  );

  // Helper to filter tasks based on active filters
  const taskMatchesFilters = useCallback(
    (task: TaskResponse): boolean => {
      // Priority filter
      if (filters.priorities.length > 0) {
        const taskPriority = (task.priority || '').toLowerCase();
        if (!filters.priorities.some((p) => p.toLowerCase() === taskPriority)) {
          return false;
        }
      }

      // Assignee filter
      if (assigneeIdFilter.length > 0) {
        const taskAssigneeId =
          task.assignee_id || task.assignee?.id || (task.assignee as { user_id?: string })?.user_id;
        if (!taskAssigneeId || !assigneeIdFilter.includes(taskAssigneeId)) {
          return false;
        }
      }

      // Type filter
      if (filters.types.length > 0) {
        const taskType = (task.type || '').toLowerCase();
        if (!filters.types.some((t) => t.toLowerCase() === taskType)) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0) {
        const resolved = resolveStatusId(task);
        if (
          !filters.statuses.includes(resolved) &&
          !filters.statuses.includes(task.status_id || '') &&
          !filters.statuses.includes(task.status || '')
        ) {
          return false;
        }
      }

      return true;
    },
    [filters, assigneeIdFilter, resolveStatusId]
  );

  // Helper to map a TaskResponse to KanbanTask
  const mapToKanbanTask = useCallback(
    (task: TaskResponse, parentStoryId: string, resolvedStatusId: string): KanbanTask => {
      const taskKey = task.key ?? task.id ?? '';
      return {
        id: taskKey,
        taskId: task.id ?? '',
        projectId: task.project_id ?? selectedProject,
        title: task.title ?? '',
        priority: task.priority
          ? ((task.priority.charAt(0).toUpperCase() +
              task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
          : 'Medium',
        labels: [],
        assigneeInitials: task.assignee_name
          ? task.assignee_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : '',
        assigneeColor: task?.assignee?.color ?? '',
        storyPoints: task.story_points ?? 0,
        dueDate: task.due_date ? task.due_date.split('T')[0] : '',
        columnId: resolvedStatusId,
        sprint: task.sprint_name ?? '',
        parent: parentStoryId,
      };
    },
    [selectedProject]
  );

  // Process tasks and organize by user story and status
  const processedStories = useMemo(() => {
    // Collect all unique tasks mapped by task key/id
    const taskMap = new Map<string, { task: TaskResponse; defaultStoryId: string }>();

    // 1. Add all tasks from user stories (from userStory API)
    userStories?.forEach((story) => {
      if (Array.isArray(story.tasks)) {
        story.tasks.forEach((task) => {
          const key = task.key || task.id;
          if (key) {
            taskMap.set(key, { task, defaultStoryId: story.id });
          }
        });
      }
    });

    // 2. Add Direct Sprint Tasks (from directSprintTasksList)
    directSprintTasksList?.forEach((task) => {
      const key = task.key || task.id;
      if (key) {
        const existing = taskMap.get(key);
        if (existing) {
          taskMap.set(key, {
            task: { ...existing.task, ...task },
            defaultStoryId: task.user_story_id || existing.defaultStoryId || 'direct-sprint-tasks',
          });
        } else {
          taskMap.set(key, {
            task,
            defaultStoryId: task.user_story_id || 'direct-sprint-tasks',
          });
        }
      }
    });

    // 3. Group filtered tasks by user story and status
    const tasksByStory = new Map<string, Map<string, KanbanTask[]>>();

    taskMap.forEach(({ task, defaultStoryId }) => {
      // Check filters if active
      if (hasActiveFilter && !taskMatchesFilters(task)) {
        return;
      }

      // If a specific sprint is selected, filter out direct sprint tasks that belong to OTHER sprints
      if (selectedSprint && !task.user_story_id) {
        if (task.sprint_id && task.sprint_id !== selectedSprint) {
          return;
        }
      }

      const taskKey = task.key ?? task.id ?? '';
      const optimisticUpdate = optimisticUpdates.get(taskKey);

      let effectiveStoryId = optimisticUpdate?.storyId;
      if (!effectiveStoryId) {
        if (task.user_story_id) {
          effectiveStoryId = task.user_story_id;
        } else if (
          defaultStoryId &&
          defaultStoryId !== 'direct-sprint-tasks' &&
          defaultStoryId !== 'no-story'
        ) {
          effectiveStoryId = defaultStoryId;
        } else {
          effectiveStoryId = 'direct-sprint-tasks';
        }
      }

      const resolvedStatus = resolveStatusId(task);
      const statusId = optimisticUpdate?.statusId ?? resolvedStatus;

      if (!tasksByStory.has(effectiveStoryId)) {
        tasksByStory.set(effectiveStoryId, new Map());
      }

      const storyTasks = tasksByStory.get(effectiveStoryId)!;
      if (!storyTasks.has(statusId)) {
        storyTasks.set(statusId, []);
      }

      storyTasks.get(statusId)!.push(mapToKanbanTask(task, effectiveStoryId, statusId));
    });

    // 4. Map user stories with their tasks
    const mappedStories = userStories.map((story) => {
      const tasksByStatus = tasksByStory.get(story.id ?? '') || new Map();
      return {
        ...story,
        tasksByStatus,
        total_tasks: Array.from(tasksByStatus.values()).reduce(
          (sum, tasks) => sum + tasks.length,
          0
        ),
      };
    });

    // 5. Add "Storyless Tasks" row (assigned to sprint, no user story)
    const directSprintTasks = tasksByStory.get('direct-sprint-tasks') || new Map();
    const directSprintTotal = Array.from(directSprintTasks.values()).reduce(
      (sum, tasks) => sum + tasks.length,
      0
    );

    if (directSprintTotal > 0 || (!!selectedSprint && !hasActiveFilter)) {
      mappedStories.push({
        id: 'direct-sprint-tasks',
        title: 'Storyless Tasks',
        description: selectedSprint
          ? 'Tasks assigned to this sprint without a user story'
          : 'Tasks assigned to sprints without a user story',
        priority: 'medium',
        status: 'in_progress',
        tasksByStatus: directSprintTasks,
        total_tasks: directSprintTotal,
      } as unknown as UserStoryResponse & {
        tasksByStatus: Map<string, KanbanTask[]>;
        total_tasks: number;
      });
    }

    return mappedStories.filter((story) => story.total_tasks > 0 || !hasActiveFilter);
  }, [
    userStories,
    directSprintTasksList,
    selectedSprint,
    hasActiveFilter,
    taskMatchesFilters,
    optimisticUpdates,
    resolveStatusId,
    mapToKanbanTask,
  ]);

  const hasTasks = processedStories.some((story) => (story.total_tasks ?? 0) > 0);

  // Derive unique assignees from filter members search results
  const allAssignees = useMemo(() => {
    if (!filterMembers || filterMembers.length === 0) return [];

    return filterMembers
      .map((m) => ({
        name: m.full_name || m.user?.full_name || '',
        color: m.color ?? null,
      }))
      .filter((assignee) => assignee.name !== '')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filterMembers]);

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    processedStories.forEach((story) =>
      story.tasksByStatus.forEach((tasks) =>
        tasks.forEach((task: KanbanTask) => task.labels.forEach((label: string) => set.add(label)))
      )
    );
    return Array.from(set).sort();
  }, [processedStories]);

  // Use predefined task type options
  const allTypes = useMemo(() => {
    return taskTypeOptions.map((option) => option.label);
  }, []);

  // Map assignee names to IDs
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);

      // Convert selected assignee names to user IDs
      const assigneeIds = newFilters.assignees
        .map((assigneeName) => {
          const member = filterMembers?.find((m) => {
            const name = m.full_name || m.user?.full_name || '';
            return name === assigneeName;
          });
          return member?.user_id || member?.user?.id || member?.id;
        })
        .filter((id): id is string => !!id);

      setAssigneeIdFilter(assigneeIds);
    },
    [filterMembers]
  );

  // Helper to get avatar color based on name
  const getAvatarColor = (name: string) => {
    const avatarColors = [
      colors.avatarIndigo,
      colors.avatarBlue,
      colors.avatarPink,
      colors.avatarGreen,
      colors.avatarAmber,
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[index % avatarColors.length];
  };

  // Helper to get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Toggle assignee filter
  const toggleAssigneeFilter = (memberId: string, memberName: string) => {
    logger.log('Toggle assignee filter:', { memberId, memberName });
    const isSelected = assigneeIdFilter.includes(memberId);
    const newAssigneeIds = isSelected
      ? assigneeIdFilter.filter((id) => id !== memberId)
      : [...assigneeIdFilter, memberId]; // Add to existing selections for multi-select

    const newAssigneeNames = isSelected
      ? filters.assignees.filter((name) => name !== memberName)
      : [...filters.assignees, memberName]; // Add to existing selections for multi-select

    logger.log('New assignee filter state:', { newAssigneeIds, newAssigneeNames });
    setAssigneeIdFilter(newAssigneeIds);
    setFilters({ ...filters, assignees: newAssigneeNames });
  };

  // Handle assignee search in filter panel
  const handleAssigneeSearch = useCallback((search: string) => {
    setFilterMemberSearch(search);
  }, []);

  // Toggle status column collapse/expand
  const toggleStatusCollapse = useCallback((statusId: string) => {
    setCollapsedStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(statusId)) {
        newSet.delete(statusId);
      } else {
        newSet.add(statusId);
      }
      return newSet;
    });
  }, []);

  // Count tasks per status across all stories
  const taskCountsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    processedStories.forEach((story) => {
      story.tasksByStatus.forEach((tasks, statusId) => {
        counts.set(statusId, (counts.get(statusId) || 0) + tasks.length);
      });
    });
    return counts;
  }, [processedStories]);

  const onDragStart = ({ active }: DragStartEvent) => {
    // Find the task across all stories
    for (const story of processedStories) {
      for (const tasks of story.tasksByStatus.values()) {
        const task = tasks.find((t: Task) => t.id === active.id);
        if (task) {
          setActiveTask(task);
          return;
        }
      }
    }
  };

  const onDragOver = useCallback(({ over }: DragOverEvent) => {
    if (!over) {
      setOverCell(null);
      return;
    }

    const overData = over.data.current;
    const overId = over.id as string;

    // Check if over a cell (droppable area)
    if (overData?.type === 'cell') {
      setOverCell({ storyId: overData.storyId, statusId: overData.statusId });
    }
    // Check if over a card (get the parent cell info from the card's columnId)
    else if (overData?.type === 'card') {
      const task = overData.task as KanbanTask;
      if (task.parent && task.columnId) {
        setOverCell({ storyId: task.parent, statusId: task.columnId });
      }
    }
    // Fallback: parse from ID if it contains a dash
    else if (overId.includes('-')) {
      const [storyId, statusId] = overId.split('-');
      setOverCell({ storyId, statusId });
    } else {
      setOverCell(null);
    }
  }, []);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveTask(null);
      setOverCell(null);

      if (!over) return;

      if (!canEditTask) {
        toast.error("You don't have permission to modify tasks");
        return;
      }

      // Get the status ID and story ID from the droppable's data
      const overData = over.data.current;
      let targetStatusId: string | null = null;
      let targetStoryId: string | null = null;

      // Check if dropped on a cell
      if (overData?.type === 'cell') {
        targetStatusId = overData.statusId as string;
        targetStoryId = overData.storyId as string;
      }
      // Check if dropped on a card (use the card's status and story)
      else if (overData?.type === 'card') {
        const targetTask = overData.task as KanbanTask;
        targetStatusId = targetTask.columnId;
        targetStoryId = targetTask.parent ?? null;
      }

      if (!targetStatusId || !targetStoryId) return;

      const activeId = active.id as string;

      // Find the source story and task
      let sourceStory: (typeof processedStories)[0] | null = null;
      let sourceStatusId: string | null = null;
      let task: KanbanTask | null = null;

      for (const story of processedStories) {
        for (const [statusId, tasks] of story.tasksByStatus.entries()) {
          const foundTask = tasks.find((t: Task) => t.id === activeId);
          if (foundTask) {
            sourceStory = story;
            sourceStatusId = statusId;
            task = foundTask;
            break;
          }
        }
        if (task) break;
      }

      if (!task || !sourceStory || !sourceStatusId) return;

      const sourceStoryId = sourceStory.id ?? '';

      // Check if anything changed
      const statusChanged = sourceStatusId !== targetStatusId;
      const storyChanged = sourceStoryId !== targetStoryId;

      if (!statusChanged && !storyChanged) return;

      // Optimistically update the UI
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.set(task.id, {
          statusId: targetStatusId,
          storyId: storyChanged ? targetStoryId : undefined,
        });
        return newMap;
      });

      // Build the update payload
      const updatePayload: {
        status_id: string;
        user_story_id?: string | null;
        sprint_id?: string | null;
      } = {
        status_id: targetStatusId,
      };

      // If the user story / section changed, include it in the payload
      if (storyChanged) {
        if (targetStoryId === 'direct-sprint-tasks' || targetStoryId === 'no-story') {
          updatePayload.user_story_id = null;
          if (selectedSprint) {
            updatePayload.sprint_id = selectedSprint;
          }
        } else {
          updatePayload.user_story_id = targetStoryId;
        }
      }

      // Call the API and update cache manually (no refetch)
      if (task.taskId) {
        taskService
          .updateTask(task.projectId ?? '', task.taskId, updatePayload)
          .then(() => {
            // API succeeded - update the cache manually without refetching
            const projectId = task.projectId ?? '';

            // Invalidate queries so caches stay updated
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });

            // Clear the optimistic update
            setOptimisticUpdates((prev) => {
              const newMap = new Map(prev);
              newMap.delete(task.id);
              return newMap;
            });
          })
          .catch((err: Error) => {
            logger.log('Failed to update task', err);
            // Revert the optimistic update on error
            setOptimisticUpdates((prev) => {
              const newMap = new Map(prev);
              newMap.delete(task.id);
              return newMap;
            });
          });
      }
    },
    [processedStories, queryClient, selectedSprint, canEditTask]
  );

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 flex-shrink-0 px-3 sm:px-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Kanban Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Visualize and manage your team&apos;s tasks across workflow stages.
          </p>
          {storeProject && (
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
              {storeProject.name}
              {storeSprint ? ` · ${storeSprint.name}` : ' · All Sprints'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:mr-18">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <WpButton
              variant={hasActiveFilter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilter((v) => !v)}
              leftIcon={<Filter size={15} />}
              className="dark:text-white dark:border-gray-600"
            >
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
                  {filters.priorities.length +
                    assigneeIdFilter.length +
                    filters.labels.length +
                    filters.types.length +
                    filters.statuses.length}
                </span>
              )}
            </WpButton>

            {showFilter && (
              <FilterPanel
                filters={filters}
                allAssignees={allAssignees}
                allLabels={allLabels}
                allTypes={allTypes}
                allStatuses={statuses}
                onChange={handleFilterChange}
                onClose={() => setShowFilter(false)}
                onAssigneeSearch={handleAssigneeSearch}
                isLoadingAssignees={isLoadingFilterMembers || isFetchingFilterMembers}
              />
            )}
          </div>

          {/* <WpButton variant="secondary" size="sm" leftIcon={<UserCircle2 size={15} />}>
            <span className="hidden xs:inline">Team</span>
          </WpButton> */}

          <div className="flex -space-x-2">
            {displayMembers && displayMembers.length > 0 ? (
              displayMembers.slice(0, 5).map((member) => {
                const memberName = member.full_name || member.user?.full_name || 'Unknown';
                const userId = member.user_id || member.user?.id || member.id;
                const initials = getInitials(memberName);
                const avatarColor = getAvatarColor(memberName);
                const isSelected = assigneeIdFilter.includes(userId);

                return (
                  <button
                    key={member.id}
                    onClick={() => toggleAssigneeFilter(userId, memberName)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-110 cursor-pointer ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-white'
                    }`}
                    style={{ backgroundColor: member.color }}
                    title={`${memberName}${isSelected ? ' (filtering)' : ''}`}
                  >
                    {initials}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">No team members</span>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      {!canViewBoard ? (
        <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/kanban method-pana.svg"
              alt="Access Restricted"
              className="h-90 w-90 opacity-60"
            />

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Restricted
            </h2>

            <p className="mt-3 max-w-md text-center text-gray-500 dark:text-gray-400">
              You do not have permission to view tasks on this board.
            </p>
          </div>
        </div>
      ) : boardLoading ? (
        <BoardSkeleton />
      ) : !hasTasks ? (
        <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kanban method-pana.svg" alt="No Tasks" className="h-90 w-90" />

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">No tasks found</h2>

            <p className="mt-3 max-w-md text-center text-gray-500 dark:text-gray-400">
              There are no tasks for this selection. Try a different project or sprint.
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={(args) =>
            pointerWithin(args).length ? pointerWithin(args) : closestCenter(args)
          }
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-auto -mx-3 sm:mx-0"
          >
            <div className="inline-block min-w-full px-3 sm:px-0">
              {/* Status Headers */}
              <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 flex border-b-2 border-gray-300 dark:border-gray-700">
                <div className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-[200px] sm:w-[250px] flex-shrink-0 p-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-100">
                    User Stories
                  </span>
                </div>
                {statuses.map((status) => {
                  const isCollapsed = collapsedStatuses.has(status.id);
                  const taskCount = taskCountsByStatus.get(status.id) || 0;

                  return (
                    <div
                      key={status.id}
                      className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 dark:bg-gray-100 dark:text-slate-100 ${
                        isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
                      }`}
                    >
                      {!isCollapsed ? (
                        <div className="p-3 flex items-center gap-2 dark:bg-gray-100 ">
                          <button
                            onClick={() => toggleStatusCollapse(status.id)}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-95 rounded transition-all duration-200"
                            title="Collapse column"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600 dark:text-slate-300 transition-transform duration-300 ease-in-out rotate-90"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm font-semibold text-gray-700 dark:text-slate-100 truncate">
                            {status.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {taskCount}
                          </span>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-start py-3 px-2">
                          <button
                            onClick={() => toggleStatusCollapse(status.id)}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-95 rounded transition-all duration-200 mb-2"
                            title="Expand column"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600 dark:text-slate-300 transition-transform duration-300 ease-in-out"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mb-2"
                            style={{ backgroundColor: status.color }}
                          />
                          <div className="flex-1 flex items-center justify-center overflow-hidden">
                            <span
                              className="text-xs font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap"
                              style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                transform: 'rotate(180deg)',
                              }}
                            >
                              {status.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-2">
                            {taskCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* User Story Rows */}
              {processedStories.map((story) => (
                <UserStoryRow
                  key={story.id}
                  story={story}
                  statuses={statuses}
                  overCell={overCell}
                  onUserStoryClick={setSelectedUserStory}
                  onRefetch={handleRefetch}
                  collapsedStatuses={collapsedStatuses}
                />
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask && <KanbanCardPreview task={activeTask} />}
          </DragOverlay>

          {/* Scroll Indicator */}
          <ScrollIndicator
            scrollContainerRef={scrollContainerRef}
            statuses={statuses}
            userStoriesCount={processedStories.length}
          />
        </DndContext>
      )}

      {/* User Story Detail Drawer */}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={() => setSelectedUserStory(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            handleRefetch();
          }}
          onCreateTask={
            canCreateTask
              ? () => {
                  // Keep user story drawer open, task modal will appear on top
                  setTaskUserStoryId(selectedUserStory.id);
                  setShowAddTaskModal(true);
                }
              : undefined
          }
          onDelete={
            canDeleteUserStory
              ? async () => {
                  try {
                    await deleteUserStoryMutation.mutateAsync({
                      projectId: selectedProject,
                      userStoryId: selectedUserStory.id,
                    });
                    queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
                    queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
                    handleRefetch();
                    setSelectedUserStory(null);
                  } catch (error) {
                    // Error is already handled by the mutation
                  }
                }
              : undefined
          }
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && canCreateTask && (
        <AddTaskModal
          projectId={selectedProject}
          sprintId={taskUserStoryId ? '' : selectedSprint}
          userStoryId={taskUserStoryId || undefined}
          assigneeOptions={assigneeOptions}
          memberSearch={memberSearch}
          onMemberSearchChange={setMemberSearch}
          isLoadingMembers={isLoadingProjectMembers || isFetchingProjectMembers}
          onClose={() => {
            setShowAddTaskModal(false);
            setTaskUserStoryId('');
            setMemberSearch(''); // Clear search on close
          }}
          onCreate={() => {
            setShowAddTaskModal(false);
            // Invalidate both user stories list and the specific user story detail
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            if (taskUserStoryId) {
              queryClient.invalidateQueries({
                queryKey: ['user-story', selectedProject, taskUserStoryId],
              });
            }
            handleRefetch();
            setTaskUserStoryId('');
            setMemberSearch(''); // Clear search after creation
          }}
        />
      )}
    </div>
  );
};
