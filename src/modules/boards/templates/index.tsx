'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Filter, UserCircle2 } from 'lucide-react';
import { logger } from '@/src/lib/utils/logger';
import { useAppSelector } from '@/src/store';
import { useGetUserStories } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import { taskService } from '@/src/services/tasks';
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
import { ASSIGNEE_AVATARS } from '../data';
import { UserStoryResponse } from '@/src/types/userstories';
import { KanbanCardContent } from '../components/kanbannCardContent';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { CustomStatus } from '@/src/types/colors';

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
}: {
  story: UserStoryResponse & { tasksByStatus: Map<string, KanbanTask[]> };
  statuses: CustomStatus[];
  overCell: { storyId: string; statusId: string } | null;
  onUserStoryClick: (story: UserStoryResponse) => void;
  onRefetch: () => void;
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
              <h3 className="text-sm font-semibold text-gray-800 truncate" title={story.title}>
                {story.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {story.total_tasks ?? 0} tasks · {story.story_points ?? 0} pts
              </p>
            </div>
          </div>
        </div>

        {/* Empty status columns for header row */}
        {statuses.map((status) => (
          <div
            key={status.id}
            className="w-[240px] sm:w-[260px] flex-shrink-0 border-r border-gray-200"
          />
        ))}
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
            return (
              <div
                key={status.id}
                className="w-[240px] sm:w-[260px] flex-shrink-0 border-r border-gray-200"
              >
                <StatusCell
                  storyId={story.id}
                  statusId={status.id}
                  tasks={tasks}
                  isOver={isOver}
                  onRefetch={onRefetch}
                />
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

  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );
  const selectedProject = storeProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';

  // Fetch user stories with tasks
  const { userStories, isLoadingUserStories, refetchUserStories } = useGetUserStories(
    selectedProject,
    selectedSprint ? { sprint_id: selectedSprint } : {}
  );

  // Fetch status columns
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(selectedProject);

  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    labels: [],
  });

  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClick(filterRef, () => setShowFilter(false));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const boardLoading = isLoadingUserStories || isLoadingStatus;

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.4' } },
    }),
    duration: 150,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  };

  // Process user stories and organize tasks by status
  const processedStories = useMemo(() => {
    return userStories.map((story) => {
      const tasksByStatus = new Map<string, KanbanTask[]>();

      story.tasks?.forEach((task) => {
        // Check if there's an optimistic update for this task
        const taskKey = task.key ?? task.id ?? '';
        const optimisticUpdate = optimisticUpdates.get(taskKey);

        // If task was moved to a different story, skip it in the original story
        if (optimisticUpdate?.storyId && optimisticUpdate.storyId !== story.id) {
          return;
        }

        const statusId = optimisticUpdate?.statusId ?? task.status_id ?? '';

        if (!tasksByStatus.has(statusId)) {
          tasksByStatus.set(statusId, []);
        }

        tasksByStatus.get(statusId)?.push({
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
          sprint: '',
          parent: story.id ?? '',
        });
      });

      // Add tasks that were moved TO this story from other stories (optimistic updates)
      userStories.forEach((otherStory) => {
        if (otherStory.id === story.id) return; // Skip same story

        otherStory.tasks?.forEach((task) => {
          const taskKey = task.key ?? task.id ?? '';
          const optimisticUpdate = optimisticUpdates.get(taskKey);

          // If this task was optimistically moved to the current story
          if (optimisticUpdate?.storyId === story.id) {
            const statusId = optimisticUpdate.statusId;

            if (!tasksByStatus.has(statusId)) {
              tasksByStatus.set(statusId, []);
            }

            // Check if task is not already added
            const alreadyExists = tasksByStatus.get(statusId)?.some((t) => t.id === taskKey);
            if (!alreadyExists) {
              tasksByStatus.get(statusId)?.push({
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
                sprint: '',
                parent: story.id ?? '',
              });
            }
          }
        });
      });

      return {
        ...story,
        tasksByStatus,
      };
    });
  }, [userStories, selectedProject, optimisticUpdates]);

  const hasTasks = processedStories.some((story) => (story.total_tasks ?? 0) > 0);

  // Derive unique assignees & labels from all tasks
  const allAssignees = useMemo(() => {
    const set = new Set<string>();
    processedStories.forEach((story) =>
      story.tasksByStatus.forEach((tasks) => tasks.forEach((t) => set.add(t.assigneeInitials)))
    );
    return Array.from(set).sort();
  }, [processedStories]);

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    processedStories.forEach((story) =>
      story.tasksByStatus.forEach((tasks) =>
        tasks.forEach((t) => t.labels.forEach((l) => set.add(l)))
      )
    );
    return Array.from(set).sort();
  }, [processedStories]);

  const hasActiveFilter =
    filters.priorities.length > 0 || filters.assignees.length > 0 || filters.labels.length > 0;

  const onDragStart = ({ active }: DragStartEvent) => {
    // Find the task across all stories
    for (const story of processedStories) {
      for (const tasks of story.tasksByStatus.values()) {
        const task = tasks.find((t) => t.id === active.id);
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
          const foundTask = tasks.find((t) => t.id === activeId);
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

      // Call the API
      if (task.taskId) {
        taskService
          .updateTask(task.projectId ?? '', task.taskId, updatePayload)
          .then(() => {
            // API succeeded - keep the optimistic update in place
            // The optimistic update IS the correct state now
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
    [processedStories]
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
                  {filters.priorities.length + filters.assignees.length + filters.labels.length}
                </span>
              )}
            </WpButton>

            {showFilter && (
              <FilterPanel
                filters={filters}
                allAssignees={allAssignees}
                allLabels={allLabels}
                onChange={setFilters}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>

          <WpButton variant="secondary" size="sm" leftIcon={<UserCircle2 size={15} />}>
            <span className="hidden xs:inline">Assignee</span>
          </WpButton>

          <div className="flex -space-x-2">
            {ASSIGNEE_AVATARS.map((a) => (
              <div
                key={a.initials}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: a.color }}
              >
                {a.initials}
              </div>
            ))}
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
          <div className="flex-1 overflow-x-auto overflow-y-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full px-3 sm:px-0">
              {/* Status Headers */}
              <div className="sticky top-0 z-20 bg-white flex border-b-2 border-gray-300">
                <div className="sticky left-0 z-30 bg-gray-100 border-r border-gray-200 w-[200px] sm:w-[250px] flex-shrink-0 p-3">
                  <span className="text-sm font-semibold text-gray-700">User Stories</span>
                </div>
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="w-[240px] sm:w-[260px] flex-shrink-0 p-3 border-r border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {status.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* User Story Rows */}
              {processedStories.map((story) => (
                <UserStoryRow
                  key={story.id}
                  story={story}
                  statuses={statuses}
                  overCell={overCell}
                  onUserStoryClick={setSelectedUserStory}
                  onRefetch={refetchUserStories}
                />
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask && <KanbanCardPreview task={activeTask} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* User Story Detail Drawer */}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={() => setSelectedUserStory(null)}
        />
      )}
    </div>
  );
};
