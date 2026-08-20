'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Filter } from 'lucide-react';
import { logger } from '@/src/lib/utils/logger';
import { useAppSelector } from '@/src/store';
import { useGetTasks } from '@/src/modules/tasks/hooks/useTask';
import { useGetUserStories } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { taskService } from '@/src/services/tasks';
import { useQueryClient } from '@tanstack/react-query';
import { GetTasksQueryParams, Task } from '@/src/types/task';
import { taskTypeOptions } from '@/src/app/components/common/enum';
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
        className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer select-none touch-none w-full"
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

  return (
    <div
      ref={setNodeRef}
      style={isOver ? { backgroundColor: colors.dropBg, outlineColor: colors.dropRing } : {}}
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

  return (
    <div className="border-b border-gray-200">
      {/* User Story Header - Always visible */}
      <div className="flex bg-gray-50 hover:bg-gray-100 transition-colors">
        {/* User Story Title with expand/collapse */}
        <div className="sticky left-0 z-10 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 w-[200px] sm:w-[250px] flex-shrink-0 p-3 flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
          >
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            onClick={() => onUserStoryClick(story)}
            className="flex items-start gap-2 flex-1 min-w-0 cursor-pointer"
          >
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
                className={`text-sm font-semibold text-gray-800 truncate ${story.is_closed ? 'line-through' : ''}`}
                title={story.title}
              >
                {story.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {story.total_tasks ?? 0} tasks · {story.story_points ?? 0} pts
              </p>
            </div>
          </div>
        </div>

        {/* Empty status columns for header row */}
        {statuses.map((status) => {
          const isCollapsed = collapsedStatuses.has(status.id);
          return (
            <div
              key={status.id}
              className={`flex-shrink-0 border-r border-gray-200 transition-all duration-300 ${
                isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
              }`}
            />
          );
        })}
      </div>

      {/* Task rows - Only visible when expanded */}
      {isExpanded && (
        <div className="flex">
          {/* Empty space for story column */}
          <div className="sticky left-0 z-10 bg-white border-r border-gray-200 w-[200px] sm:w-[250px] flex-shrink-0" />

          {/* Status Columns with tasks */}
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
                {!isCollapsed ? (
                  <StatusCell
                    storyId={story.id}
                    statusId={status.id}
                    tasks={tasks}
                    isOver={isOver}
                    onRefetch={onRefetch}
                  />
                ) : (
                  <div className="min-h-[100px] p-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">{tasks.length}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  const debouncedMemberSearch = useDebounce(memberSearch, 500);

  const queryClient = useQueryClient();
  const deleteUserStoryMutation = useDeleteUserStory();

  const filterRef = useRef<HTMLDivElement>(null);

  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );
  const selectedProject = storeProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';

  // Fetch project members for assignee filtering
  const { members } = useGetProjectMembers(selectedProject, { page: 1, page_size: 100 });

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
    showAddTaskModal // Only fetch when modal is open
  );

  // Generate assignee options from fetched members
  const assigneeOptions =
    projectMembers?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  useOutsideClick(filterRef, () => setShowFilter(false));

  // Build query params from filters
  const queryParams = useMemo((): GetTasksQueryParams => {
    const params: GetTasksQueryParams = {};

    if (selectedSprint) {
      params.sprint_id = selectedSprint;
    }

    // Add priority filter - comma-separated for multiple selections
    if (filters.priorities.length > 0) {
      params.priority = filters.priorities.map((p) => p.toLowerCase()).join(',');
    }

    // Add assignee filter - comma-separated for multiple selections
    if (assigneeIdFilter.length > 0) {
      params.assignee_id = assigneeIdFilter.join(',');
    }

    // Add type filter - comma-separated for multiple selections
    if (filters.types.length > 0) {
      params.type = filters.types.map((t) => t.toLowerCase()).join(',');
    }

    // Add status filter - comma-separated for multiple selections
    if (filters.statuses.length > 0) {
      params.status_id = filters.statuses.join(',');
    }

    logger.log('Board query params updated:', params);
    return params;
  }, [selectedSprint, filters.priorities, filters.types, filters.statuses, assigneeIdFilter]);

  // Fetch tasks directly with filters
  const { tasksList, isLoadingTasks, refetchTasks } = useGetTasks(selectedProject, queryParams);

  // Also fetch user stories for grouping (without filters)
  const { userStories, isLoadingUserStories } = useGetUserStories(
    selectedProject,
    selectedSprint ? { sprint_id: selectedSprint } : {}
  );

  // Fetch status columns
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(selectedProject);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const boardLoading =
    !!selectedProject && (isLoadingTasks || isLoadingUserStories || isLoadingStatus);

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

  // Process tasks and organize by user story and status
  const processedStories = useMemo(() => {
    // Group filtered tasks by user story
    const tasksByStory = new Map<string, Map<string, KanbanTask[]>>();

    tasksList?.forEach((task) => {
      // Check if there's an optimistic update for this task
      const taskKey = task.key ?? task.id ?? '';
      const optimisticUpdate = optimisticUpdates.get(taskKey);

      // Use optimistic update for both storyId and statusId if available
      const storyId = optimisticUpdate?.storyId ?? task.user_story_id ?? 'no-story';
      const statusId = optimisticUpdate?.statusId ?? task.status_id ?? '';

      if (!tasksByStory.has(storyId)) {
        tasksByStory.set(storyId, new Map());
      }

      const storyTasks = tasksByStory.get(storyId)!;
      if (!storyTasks.has(statusId)) {
        storyTasks.set(statusId, []);
      }

      storyTasks.get(statusId)?.push({
        id: taskKey,
        taskId: task.id ?? '',
        projectId: selectedProject,
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
        assigneeColor: colors.avatarBlue,
        storyPoints: task.story_points ?? 0,
        dueDate: task.due_date ? task.due_date.split('T')[0] : '',
        columnId: statusId,
        sprint: task.sprint_name ?? '',
        parent: storyId,
      });
    });

    // Map user stories with their filtered tasks
    return userStories
      .map((story) => {
        const tasksByStatus = tasksByStory.get(story.id ?? '') || new Map();
        return {
          ...story,
          tasksByStatus,
          total_tasks: Array.from(tasksByStatus.values()).reduce(
            (sum, tasks) => sum + tasks.length,
            0
          ),
        };
      })
      .filter((story) => story.total_tasks > 0 || !hasActiveFilter); // Hide empty stories when filtering
  }, [tasksList, userStories, selectedProject, optimisticUpdates, hasActiveFilter]);

  const hasTasks = processedStories.some((story) => (story.total_tasks ?? 0) > 0);

  // Derive unique assignees from project members instead of task initials
  const allAssignees = useMemo(() => {
    if (!members || members.length === 0) return [];
    return members
      .map((m) => m.full_name || m.user?.full_name || '')
      .filter((name) => name !== '')
      .sort();
  }, [members]);

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
          const member = members?.find((m) => {
            const name = m.full_name || m.user?.full_name || '';
            return name === assigneeName;
          });
          return member?.user_id || member?.user?.id || member?.id;
        })
        .filter((id): id is string => !!id);

      setAssigneeIdFilter(assigneeIds);
    },
    [members]
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
      const updatePayload: { status_id: string; user_story_id?: string } = {
        status_id: targetStatusId,
      };

      // If the user story changed, include it in the payload
      if (storyChanged) {
        updatePayload.user_story_id = targetStoryId;
      }

      // Call the API and update cache manually (no refetch)
      if (task.taskId) {
        taskService
          .updateTask(task.projectId ?? '', task.taskId, updatePayload)
          .then(() => {
            // API succeeded - update the cache manually without refetching
            const projectId = task.projectId ?? '';

            // Update tasks cache
            queryClient.setQueryData(
              ['tasks', projectId, queryParams],
              (oldData: { data: Task[] } | undefined) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((t) =>
                    t.id === task.taskId
                      ? {
                          ...t,
                          status_id: targetStatusId,
                          ...(storyChanged && { user_story_id: targetStoryId }),
                        }
                      : t
                  ),
                };
              }
            );

            // Update user stories cache to reflect task counts
            queryClient.setQueryData(
              ['user-stories', projectId, selectedSprint ? { sprint_id: selectedSprint } : {}],
              (oldData: { data: UserStoryResponse[] } | undefined) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((story) => {
                    // Recalculate task counts if this story was affected
                    if (story.id === sourceStoryId || story.id === targetStoryId) {
                      const taskCount = story.total_tasks ?? 0;
                      return {
                        ...story,
                        total_tasks:
                          story.id === sourceStoryId && storyChanged
                            ? Math.max(0, taskCount - 1)
                            : story.id === targetStoryId && storyChanged
                              ? taskCount + 1
                              : taskCount,
                      };
                    }
                    return story;
                  }),
                };
              }
            );

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
    [processedStories, queryClient, queryParams, selectedSprint]
  );

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 flex-shrink-0 px-3 sm:px-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Kanban Board</h1>
          <p className="text-sm text-gray-500">
            Visualize and manage your team&apos;s tasks across workflow stages.
          </p>
          {storeProject && (
            <p className="text-xs text-gray-400 mt-0.5">
              {storeProject.name}
              {storeSprint ? ` · ${storeSprint.name}` : ' · All Sprints'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <WpButton
              variant={hasActiveFilter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilter((v) => !v)}
              leftIcon={<Filter size={15} />}
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
              />
            )}
          </div>

          {/* <WpButton variant="secondary" size="sm" leftIcon={<UserCircle2 size={15} />}>
            <span className="hidden xs:inline">Team</span>
          </WpButton> */}

          <div className="flex -space-x-2">
            {members && members.length > 0 ? (
              members.slice(0, 5).map((member) => {
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
                    style={{ backgroundColor: avatarColor }}
                    title={`${memberName}${isSelected ? ' (filtering)' : ''}`}
                  >
                    {initials}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-gray-400">No team members</span>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      {boardLoading ? (
        <BoardSkeleton />
      ) : !hasTasks ? (
        <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kanban method-pana.svg" alt="No Tasks" className="h-90 w-90" />

            <h2 className="text-2xl font-bold text-gray-900">No tasks found</h2>

            <p className="mt-3 max-w-md text-center text-gray-500">
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
          <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full px-3 sm:px-0">
              {/* Status Headers */}
              <div className="sticky top-0 z-20 bg-white flex border-b-2 border-gray-300">
                <div className="sticky left-0 z-30 bg-gray-100 border-r border-gray-200 w-[200px] sm:w-[250px] flex-shrink-0 p-3">
                  <span className="text-sm font-semibold text-gray-700">User Stories</span>
                </div>
                {statuses.map((status) => {
                  const isCollapsed = collapsedStatuses.has(status.id);
                  const taskCount = taskCountsByStatus.get(status.id) || 0;

                  return (
                    <div
                      key={status.id}
                      className={`flex-shrink-0 border-r border-gray-200 transition-all duration-300 ${
                        isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
                      }`}
                    >
                      {!isCollapsed ? (
                        <div className="p-3 flex items-center gap-2">
                          <button
                            onClick={() => toggleStatusCollapse(status.id)}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                            title="Collapse column"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600 transition-transform rotate-90"
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
                          <span className="text-sm font-semibold text-gray-700 truncate">
                            {status.name}
                          </span>
                          <span className="ml-auto text-xs text-gray-500 font-medium">
                            {taskCount}
                          </span>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-start py-3 px-2">
                          <button
                            onClick={() => toggleStatusCollapse(status.id)}
                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors mb-2"
                            title="Expand column"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600 transition-transform"
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
                              className="text-xs font-semibold text-gray-700 whitespace-nowrap"
                              style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                transform: 'rotate(180deg)',
                              }}
                            >
                              {status.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium mt-2">
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
                  onRefetch={refetchTasks}
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
            refetchTasks();
          }}
          onCreateTask={() => {
            // Keep user story drawer open, task modal will appear on top
            setTaskUserStoryId(selectedUserStory.id);
            setShowAddTaskModal(true);
          }}
          onDelete={async () => {
            try {
              await deleteUserStoryMutation.mutateAsync({
                projectId: selectedProject,
                userStoryId: selectedUserStory.id,
              });
              queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
              queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
              refetchTasks();
              setSelectedUserStory(null);
            } catch (error) {
              // Error is already handled by the mutation
            }
          }}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
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
            refetchTasks();
            setTaskUserStoryId('');
            setMemberSearch(''); // Clear search after creation
          }}
        />
      )}
    </div>
  );
};
