'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Filter, Layers } from 'lucide-react';
import { logger } from '@/src/lib/utils/logger';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { useGetBoard, useGetBoardStatusTasks } from '@/src/modules/boards/hooks/useBoards';
import { useGetTasks } from '@/src/modules/tasks/hooks/useTask';
import { useGetStatus, useGetLabels } from '@/src/modules/project/hooks/useLabels';
import {
  useGetProjectMembers,
  useGetProjectsWithSprints,
} from '@/src/modules/project/hooks/useProject';
import { taskService } from '@/src/services/tasks';
import { useQueryClient } from '@tanstack/react-query';
import { TaskResponse, GetTasksQueryParams } from '@/src/types/task';
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
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { CustomStatus } from '@/src/types/colors';
import { ScrollIndicator } from '../components/scrollIndicator';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import { useDeleteUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import toast from 'react-hot-toast';
import { useDebounce } from '@/src/hooks/useDebounce';
import { usePermissions } from '@/src/hooks/usePermissions';
import Image from 'next/image';

// Task card component for the swimlane
const TaskCard = ({
  task,
  onTaskClick,
}: {
  task: KanbanTask;
  onTaskClick?: (task: KanbanTask) => void;
  onRefetch?: () => void;
}) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onTaskClick?.(task)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer select-none touch-none w-full"
    >
      <KanbanCardContent task={task} />
    </div>
  );
};

// Droppable column cell for each status in a user story row
const StatusCell = ({
  storyId,
  statusId,
  tasks: initialTasks,
  isOver,
  onTaskClick,
  onRefetch,
  hasMore,
  projectId,
  mapTask,
  allTasksRef,
  optimisticUpdates,
}: {
  storyId: string;
  statusId: string;
  tasks: KanbanTask[];
  isOver: boolean;
  onTaskClick?: (task: KanbanTask) => void;
  onRefetch: () => void;
  hasMore: boolean;
  projectId: string;
  mapTask: (
    task: import('@/src/types/task').TaskResponse,
    storyId: string,
    statusId: string
  ) => KanbanTask;
  allTasksRef: React.MutableRefObject<Map<string, KanbanTask>>;
  optimisticUpdates: Map<string, OptimisticUpdate>;
}) => {
  const { setNodeRef } = useDroppable({
    id: `${storyId}-${statusId}`,
    data: { type: 'cell', storyId, statusId },
  });

  const isRealStory = storyId !== 'direct-sprint-tasks' && storyId !== 'no-story';
  const canLoadMore = hasMore && isRealStory;

  const [scrollActivated, setScrollActivated] = useState(false);

  const {
    tasks: extraRawTasks,
    isFetchingNextTasks,
    isLoadingTasks,
    fetchNextTasks,
    hasNextTasks,
  } = useGetBoardStatusTasks(projectId, storyId, statusId, scrollActivated && canLoadMore);

  // Merge extra tasks (pages 2+) with the initial page-1 tasks, deduplicating by key and applying optimistic updates
  const tasks = useMemo(() => {
    let allTasks = initialTasks;
    
    if (canLoadMore && extraRawTasks.length > 0) {
      const seen = new Set(initialTasks.map((t) => t.id));
      const unique = extraRawTasks
        .filter((t) => {
          const key = t.key ?? t.id ?? '';
          return key !== '' && !seen.has(key);
        })
        .map((t) => mapTask(t, storyId, statusId));
      allTasks = [...initialTasks, ...unique];
    }

    const filteredTasks = allTasks.filter((task) => {
      const optimistic = optimisticUpdates.get(task.id);
      if (!optimistic) return true; 
      
      const movedAway = optimistic.statusId !== statusId || 
                        (optimistic.storyId !== undefined && optimistic.storyId !== storyId);
      return !movedAway;
    });

    return filteredTasks;
  }, [initialTasks, extraRawTasks, canLoadMore, mapTask, storyId, statusId, optimisticUpdates]);

  const allDisplayedTasks = useMemo(() => {
    const movedInTasks: KanbanTask[] = [];
    
    optimisticUpdates.forEach((update, taskId) => {
      const belongsHere = update.statusId === statusId && 
                         (update.storyId === undefined || update.storyId === storyId);
      
      if (belongsHere) {
        const alreadyHere = tasks.some((t) => t.id === taskId);
        if (!alreadyHere && update.task) {
          movedInTasks.push({
            ...update.task,
            columnId: statusId,
            parent: update.storyId ?? update.task.parent,
          });
        }
      }
    });

    return [...tasks, ...movedInTasks];
  }, [tasks, optimisticUpdates, statusId, storyId]);

  useEffect(() => {
    const tasksRegistry = allTasksRef.current;
    allDisplayedTasks.forEach((task) => {
      if (task.id) {
        tasksRegistry.set(task.id, task);
      }
    });
    // Cleanup: remove tasks that are no longer in this cell
    return () => {
      allDisplayedTasks.forEach((task) => {
        if (task.id) {
          tasksRegistry.delete(task.id);
        }
      });
    };
  }, [allDisplayedTasks, allTasksRef]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollActivated || !canLoadMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextTasks && !isFetchingNextTasks) {
          fetchNextTasks();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollActivated, canLoadMore, hasNextTasks, isFetchingNextTasks, fetchNextTasks]);

  const needsScroll = allDisplayedTasks.length >= 3 || canLoadMore;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!canLoadMore || scrollActivated) return;
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom) {
      setScrollActivated(true);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!needsScroll) return;
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
      e.stopPropagation();
    }
  };

  const taskIds = allDisplayedTasks.map((task) => task.id).filter((id): id is string => !!id);

  return (
    <div
      ref={setNodeRef}
      onScroll={handleScroll}
      onWheel={handleWheel}
      style={{
        ...(isOver ? { backgroundColor: colors.dropBg, outlineColor: colors.dropRing } : {}),
        ...(needsScroll ? { maxHeight: '300px', overflowY: 'scroll' } : {}),
      }}
      className={`min-h-[100px] p-2 rounded-lg transition-colors duration-200 ${
        isOver ? 'outline outline-2 outline-offset-[-2px]' : ''
      }`}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {allDisplayedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} onRefetch={onRefetch} />
          ))}
          {/* Sentinel — sits at the bottom; IntersectionObserver fires fetchNextTasks */}
          {canLoadMore && !isFetchingNextTasks && <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />}
          {/* Spinner while loading next page */}
          {(isFetchingNextTasks || isLoadingTasks) && canLoadMore && (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
            </div>
          )}
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
  onTaskClick,
  onRefetch,
  collapsedStatuses,
  hasMoreByStatus,
  projectId,
  mapTask,
  allTasksRef,
  optimisticUpdates,
}: {
  story: UserStoryResponse & { tasksByStatus: Map<string, KanbanTask[]> };
  statuses: CustomStatus[];
  overCell: { storyId: string; statusId: string } | null;
  onUserStoryClick: (story: UserStoryResponse) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onRefetch: () => void;
  collapsedStatuses: Set<string>;
  hasMoreByStatus: Map<string, boolean>;
  projectId: string;
  mapTask: (
    task: import('@/src/types/task').TaskResponse,
    storyId: string,
    statusId: string
  ) => KanbanTask;
  allTasksRef: React.MutableRefObject<Map<string, KanbanTask>>;
  optimisticUpdates: Map<string, OptimisticUpdate>;
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
                  <p className="text-[11px] text-gray-500 dark:text-slate-100 mt-1 pl-0.5">
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
                    <p className="text-xs text-gray-500 dark:text-slate-200 mt-0.5">
                      {story.total_tasks ?? 0} tasks · {story.story_points ?? 0} pts
                    </p>
                  </div>
                </>
              )}
              {showStoryPopup &&
                typeof document !== 'undefined' &&
                createPortal(
                  <div
                    className="fixed z-[99999] w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:bg-gray-100"
                    style={{
                      left: popupPosition.x + 12,
                      top: popupPosition.y + 12,
                    }}
                  >
                    {/* Name */}
                    {/* Name */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <span className="text-xs text-gray-500 dark:text-slate-100 shrink-0">
                        Name
                      </span>

                      <span className="text-sm font-medium text-gray-800 dark:text-slate-100 text-right break-words min-w-0 flex-1">
                        {story.title}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Status</span>
                        <span className="text-sm font-medium text-gray-800 capitalize dark:text-slate-100">
                          {story.status?.replace('_', ' ') || '-'}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100 ">Assignee</span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800 dark:text-slate-100">
                          {story.assignee_name || story.assignee?.name || 'Unassigned'}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Due Date</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-100">
                          {story.due_date ? new Date(story.due_date).toLocaleDateString() : '-'}
                        </span>
                      </div>

                      {/* Reporter */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Reporter</span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800 dark:text-slate-100">
                          {story.reporter_name || story.reporter?.name || '-'}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Priority</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-100 capitalize">
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
                    onTaskClick={onTaskClick}
                    onRefetch={onRefetch}
                    hasMore={hasMoreByStatus.get(status.id) ?? false}
                    projectId={projectId}
                    mapTask={mapTask}
                    allTasksRef={allTasksRef}
                    optimisticUpdates={optimisticUpdates}
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

type OptimisticUpdate = {
  statusId: string;
  storyId?: string;
  task?: KanbanTask;
};

export const KanbanBoardTemplate = () => {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overCell, setOverCell] = useState<{ storyId: string; statusId: string } | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(
    new Map()
  );
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
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
  const filterRef = useRef<HTMLDivElement>(null);
  const closedTaskKeyRef = useRef<string | null>(null);
  const allTasksRef = useRef<Map<string, KanbanTask>>(new Map());
  const [memberSearch, setMemberSearch] = useState('');
  const [filterMemberSearch, setFilterMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const debouncedFilterMemberSearch = useDebounce(filterMemberSearch, 500);

  const queryClient = useQueryClient();
  const deleteUserStoryMutation = useDeleteUserStory();
  const { canViewTasks, canCreateTask, canEditTask, canViewUserStories, canViewSprints } =
    usePermissions();

  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';
  const rawTaskKey = params?.taskKey;
  const taskKey = Array.isArray(rawTaskKey) ? rawTaskKey[0] : (rawTaskKey as string | undefined);

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

  // Find project matching current URL project slug if present
  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    const lowerSlug = projectSlug.toLowerCase();
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug?.toLowerCase() === lowerSlug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === lowerSlug ||
          p.name?.toLowerCase() === lowerSlug
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return false;
    return !matchedProject;
  }, [projectSlug, matchedProject, isLoadingProjectsWithSprints]);

  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );

  // If on a projectSlug route, strictly use matchedProject; otherwise use Redux storeProject
  const effectiveProject = projectSlug ? matchedProject : storeProject;
  const selectedProject = effectiveProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';

  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== storeProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, storeProject?.id, dispatch]);

  // If on /boards without projectSlug in URL, redirect to /[orgSlug]/[slug]/boards
  useEffect(() => {
    if (!projectSlug && storeProject?.slug && orgSlug) {
      router.replace(`/${orgSlug}/${storeProject.slug}/boards${taskKey ? `/${taskKey}` : ''}`);
    }
  }, [projectSlug, storeProject?.slug, orgSlug, taskKey, router]);

  // Fetch project members for outer avatar display (always fetch all members, no search)
  const { members: displayMembers } = useGetProjectMembers(
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

  const canViewBoard = canViewTasks && canViewUserStories && canViewSprints;

  // Board API query params — user stories with their statuses+tasks
  const boardQueryParams = useMemo(() => {
    const p: import('@/src/types/board').BoardQueryParams = { page_size: 50, tasks_per_status: 3 };
    if (selectedSprint) p.sprint_id = selectedSprint;
    if (filters.priorities.length > 0)
      p.priority = filters.priorities.map((v) => v.toLowerCase()).join(',');
    if (assigneeIdFilter.length > 0) p.assignee_id = assigneeIdFilter.join(',');
    if (filters.types.length > 0) p.type = filters.types.map((v) => v.toLowerCase()).join(',');
    if (filters.statuses.length > 0) p.task_status_id = filters.statuses.join(',');
    return p;
  }, [selectedSprint, filters.priorities, filters.types, filters.statuses, assigneeIdFilter]);

  const { boardStories, isLoadingBoard, refetchBoard } = useGetBoard(
    selectedProject,
    boardQueryParams,
    !!selectedProject && canViewBoard
  );

  const directSprintQueryParams = useMemo((): GetTasksQueryParams => {
    const p: GetTasksQueryParams = { storyless_task: true, page_size: 100 };
    if (selectedSprint) p.sprint_id = selectedSprint;
    if (filters.priorities.length > 0)
      p.priority = filters.priorities.map((v) => v.toLowerCase()).join(',');
    if (assigneeIdFilter.length > 0) p.assignee_id = assigneeIdFilter.join(',');
    if (filters.types.length > 0) p.type = filters.types.map((v) => v.toLowerCase()).join(',');
    if (filters.statuses.length > 0) p.status_id = filters.statuses.join(',');
    return p;
  }, [selectedSprint, filters.priorities, filters.types, filters.statuses, assigneeIdFilter]);

  const {
    tasksList: directSprintTasksList,
    isLoadingTasks: isLoadingDirectSprintTasks,
    refetchTasks: refetchDirectSprintTasks,
  } = useGetTasks(selectedProject, directSprintQueryParams, !!selectedProject && canViewBoard);

  const handleRefetch = useCallback(() => {
    refetchBoard();
    refetchDirectSprintTasks();
  }, [refetchBoard, refetchDirectSprintTasks]);

  // Fetch status columns
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(selectedProject);

  // Fetch labels for filtering
  const { data: labelsResponse } = useGetLabels(selectedProject);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const boardLoading =
    !!selectedProject &&
    canViewBoard &&
    (isLoadingBoard || isLoadingDirectSprintTasks || isLoadingStatus);

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

      // Label filter
      if (filters.labels.length > 0) {
        const taskLabelIds = (task.labels || []).map((label) =>
          typeof label === 'string' ? label : label.id
        );
        // Check if task has at least one of the selected labels
        const hasMatchingLabel = filters.labels.some((labelId) => taskLabelIds.includes(labelId));
        if (!hasMatchingLabel) {
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
    (
      task: TaskResponse,
      parentStoryId: string,
      resolvedStatusId: string,
      parentStoryKey?: string,
      parentStoryTitle?: string
    ): KanbanTask => {
      const taskKey = task.key ?? task.id ?? '';
      const isRealStory =
        parentStoryId && parentStoryId !== 'direct-sprint-tasks' && parentStoryId !== 'no-story';
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
        user_story_id: task.user_story_id || (isRealStory ? parentStoryId : undefined),
        user_story_title: task.user_story_title || parentStoryTitle,
        user_story_key: parentStoryKey,
        assignee: task.assignee_name ?? task.assignee?.name ?? '',
      };
    },
    [selectedProject]
  );

  // Process tasks from the board API — user stories with statuses[].tasks already grouped.
  const processedStories = useMemo(() => {
    const mappedStories = boardStories.map((story) => {
      const allStoryTasks = story.statuses.flatMap((col) => col.tasks);
      const taskLookup = new Map(allStoryTasks.map((t) => [t.key ?? t.id, t]));
      // Track which status cells have more tasks beyond the initial page
      const hasMoreByStatus = new Map<string, boolean>(
        story.statuses.map((col) => [col.status_id, col.meta?.has_next ?? false])
      );
      const tasksByStatus = story.statuses.reduce<Map<string, KanbanTask[]>>((acc, statusCol) => {
        const tasks = allStoryTasks
          .filter((task) => {
            const taskKey = task.key ?? task.id ?? '';
            const optimistic = optimisticUpdates.get(taskKey);
            if (optimistic) {
              return optimistic.statusId === statusCol.status_id && optimistic.storyId === story.id;
            }
            return (
              task.status_id === statusCol.status_id ||
              resolveStatusId(task) === statusCol.status_id
            );
          })
          .filter((task) => !hasActiveFilter || taskMatchesFilters(task))
          .map((task) => {
            const taskKey = task.key ?? task.id ?? '';
            const optimistic = optimisticUpdates.get(taskKey);
            const effectiveStatusId = optimistic?.statusId ?? statusCol.status_id;
            const effectiveStoryId = optimistic?.storyId ?? story.id;
            return mapToKanbanTask(
              task,
              effectiveStoryId,
              effectiveStatusId,
              story.key,
              story.title
            );
          });
        const movedInFromOtherStory = Array.from(optimisticUpdates.entries())
          .filter(([, upd]) => upd.storyId === story.id && upd.statusId === statusCol.status_id)
          .flatMap(([taskKey]) => {
            const rawTask = (() => {
              for (const s of boardStories) {
                const found = s.statuses
                  .flatMap((c) => c.tasks)
                  .find((t) => (t.key ?? t.id) === taskKey);
                if (found) return found;
              }
              return undefined;
            })();
            if (!rawTask) return [];
            const alreadyIn = taskLookup.has(taskKey);
            if (alreadyIn) return [];
            return [
              mapToKanbanTask(rawTask, story.id, statusCol.status_id, story.key, story.title),
            ];
          })
          .filter((t) => !tasks.some((kt) => kt.id === t.id));

        const allTasks = [...tasks, ...movedInFromOtherStory];
        if (allTasks.length > 0) acc.set(statusCol.status_id, allTasks);
        return acc;
      }, new Map());

      const total_tasks = Array.from(tasksByStatus.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      );

      return { ...story, tasksByStatus, hasMoreByStatus, total_tasks };
    });

    const directSprintTasks = (directSprintTasksList ?? []).filter(
      (task) => !hasActiveFilter || taskMatchesFilters(task)
    );

    // Group storyless tasks by their effective status, respecting optimistic moves
    const storylessTasksByStatus = directSprintTasks.reduce<Map<string, KanbanTask[]>>(
      (acc, task) => {
        const taskKey = task.key ?? task.id ?? '';
        const optimistic = optimisticUpdates.get(taskKey);
        const effectiveStoryId = optimistic?.storyId ?? 'direct-sprint-tasks';
        // If optimistically moved to a real story, skip from storyless row
        if (effectiveStoryId !== 'direct-sprint-tasks') return acc;
        const resolvedStatus = resolveStatusId(task);
        const effectiveStatusId = optimistic?.statusId ?? resolvedStatus;
        const kt = mapToKanbanTask(task, 'direct-sprint-tasks', effectiveStatusId);
        const bucket = acc.get(effectiveStatusId) ?? [];
        acc.set(effectiveStatusId, [...bucket, kt]);
        return acc;
      },
      new Map()
    );

    const directSprintTotal = Array.from(storylessTasksByStatus.values()).reduce(
      (sum, arr) => sum + arr.length,
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
        statuses: [],
        tasksByStatus: storylessTasksByStatus,
        hasMoreByStatus: new Map<string, boolean>(),
        total_tasks: directSprintTotal,
      } as unknown as (typeof mappedStories)[0]);
    }

    return mappedStories.filter((story) => story.total_tasks > 0 || !hasActiveFilter);
  }, [
    boardStories,
    directSprintTasksList,
    selectedSprint,
    hasActiveFilter,
    taskMatchesFilters,
    optimisticUpdates,
    resolveStatusId,
    mapToKanbanTask,
  ]);

  // Sync taskKey from URL with selectedTask / selectedUserStory
  useEffect(() => {
    if (!taskKey) {
      closedTaskKeyRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTask(null);
      setSelectedUserStory(null);
      return;
    }

    if (closedTaskKeyRef.current === taskKey) {
      return;
    }

    const matchedStory = boardStories?.find(
      (s) => s.key?.toUpperCase() === taskKey.toUpperCase() || s.id === taskKey
    );
    const isStory =
      !!matchedStory ||
      taskKey.toUpperCase().startsWith('US-') ||
      taskKey.toUpperCase().startsWith('US');
    if (isStory) {
      if (matchedStory) {
        setSelectedUserStory(matchedStory);
      } else {
        setSelectedUserStory({
          id: taskKey,
          key: taskKey,
          title: 'Loading...',
          project_id: selectedProject,
        } as UserStoryResponse);
      }
      setSelectedTask(null);
    } else {
      let matchedTask: KanbanTask | undefined = undefined;
      for (const story of processedStories) {
        for (const [, taskList] of story.tasksByStatus) {
          const found = taskList.find(
            (t: KanbanTask) => t.id?.toUpperCase() === taskKey.toUpperCase() || t.taskId === taskKey
          );
          if (found) {
            matchedTask = found;
            break;
          }
        }
        if (matchedTask) break;
      }

      if (matchedTask) {
        setSelectedTask(matchedTask);
      } else {
        setSelectedTask({
          id: taskKey,
          taskId: taskKey,
          key: taskKey,
          title: 'Loading...',
          priority: 'Medium',
          status: 'todo',
          columnId: 'todo',
          projectId: selectedProject,
          assigneeInitials: '',
          assigneeColor: '',
          storyPoints: 0,
          dueDate: '',
          labels: [],
        });
      }
      setSelectedUserStory(null);
    }
  }, [taskKey]);

  const handleTaskClick = useCallback(
    (task: KanbanTask) => {
      closedTaskKeyRef.current = null;
      setSelectedTask(task);
      setSelectedUserStory(null);
      const currentSlug = projectSlug || storeProject?.slug || storeProject?.id;
      if (orgSlug && currentSlug) {
        const key = task.id || task.taskId;
        window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/boards/${key}`);
      }
    },
    [projectSlug, storeProject?.slug, storeProject?.id, orgSlug]
  );

  const handleUserStoryClick = useCallback(
    (story: UserStoryResponse) => {
      closedTaskKeyRef.current = null;
      const matched = boardStories?.find(
        (s) => s.id === story.id || s.key === story.id || s.id === story.key
      );
      const fullStory: UserStoryResponse = matched
        ? { ...matched, ...story, key: matched.key || story.key }
        : story;
      setSelectedUserStory(fullStory);
      setSelectedTask(null);
      const currentSlug = projectSlug || storeProject?.slug || storeProject?.id;
      if (orgSlug && currentSlug) {
        const key = fullStory.key || fullStory.id;
        window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/boards/${key}`);
      }
    },
    [projectSlug, storeProject?.slug, storeProject?.id, orgSlug, boardStories]
  );

  const handleCloseDrawer = useCallback(() => {
    closedTaskKeyRef.current = taskKey || null;
    setSelectedTask(null);
    setSelectedUserStory(null);
    const currentSlug = projectSlug || storeProject?.slug || storeProject?.id;
    if (orgSlug && currentSlug) {
      window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/boards`);
      router.replace(`/${orgSlug}/${currentSlug}/boards`, { scroll: false });
    }
    handleRefetch();
  }, [projectSlug, storeProject?.slug, storeProject?.id, orgSlug, taskKey, router, handleRefetch]);

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

  // Use labels from API instead of extracting from tasks
  const allLabels = useMemo(() => {
    return labelsResponse?.data || [];
  }, [labelsResponse]);

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
    return processedStories.reduce<Map<string, number>>((counts, story) => {
      return Array.from(story.tasksByStatus.entries()).reduce((acc, [statusId, tasks]) => {
        acc.set(statusId, (acc.get(statusId) ?? 0) + tasks.length);
        return acc;
      }, counts);
    }, new Map());
  }, [processedStories]);

  const onDragStart = ({ active }: DragStartEvent) => {
    // First try to find in the global tasks ref (includes lazy-loaded tasks)
    const taskFromRef = allTasksRef.current.get(active.id as string);
    if (taskFromRef) {
      setActiveTask(taskFromRef);
      return;
    }

    // Fallback: search in processedStories
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

      // First try to find in the global tasks ref (includes lazy-loaded tasks)
      const taskFromRef = allTasksRef.current.get(activeId);
      if (taskFromRef) {
        task = taskFromRef;
        // Find the story containing this task
        for (const story of processedStories) {
          for (const [statusId, tasks] of story.tasksByStatus.entries()) {
            if (tasks.some((t) => t.id === activeId)) {
              sourceStory = story;
              sourceStatusId = statusId;
              break;
            }
          }
          if (sourceStory) break;
        }
       
        if (!sourceStory && taskFromRef.parent && taskFromRef.columnId) {
          sourceStatusId = taskFromRef.columnId;
          // Find the story by ID
          sourceStory = processedStories.find((s) => s.id === taskFromRef.parent) || null;
        }
      } else {
        // Fallback: search in processedStories
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
      }

      if (!task || !sourceStory || !sourceStatusId) return;

      const sourceStoryId = sourceStory.id ?? '';

      // Check if anything changed
      const statusChanged = sourceStatusId !== targetStatusId;
      const storyChanged = sourceStoryId !== targetStoryId;

      if (!statusChanged && !storyChanged) return;
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

      // Optimistically update the UI — save task snapshot for moved-in cells
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.set(task.id, {
          statusId: targetStatusId,
          storyId: storyChanged ? targetStoryId : sourceStoryId,
          task: task, // Save the task snapshot
        });
        return next;
      });

      // Call the API
      if (task.taskId) {
        taskService
          .updateTask(task.projectId ?? '', task.taskId, updatePayload)
          .then(async () => {
            const projectId = task.projectId ?? '';

            // Reconcile the board cache — move the task across status columns / stories
            queryClient.setQueriesData<{
              pages: Array<{
                data: import('@/src/types/board').BoardStory[];
                [key: string]: unknown;
              }>;
              [key: string]: unknown;
            }>({ queryKey: ['board', projectId] }, (oldData) => {
              if (!oldData?.pages) return oldData;

              // Find the raw TaskResponse we need to relocate
              let rawTask: import('@/src/types/task').TaskResponse | undefined;
              for (const page of oldData.pages) {
                for (const s of page.data) {
                  for (const col of s.statuses) {
                    const found = col.tasks.find((t) => t.id === task.taskId);
                    if (found) {
                      rawTask = found;
                      break;
                    }
                  }
                  if (rawTask) break;
                }
                if (rawTask) break;
              }

              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  data: page.data.map((boardStory) => {
                    const isSource = boardStory.id === sourceStoryId;
                    const isTarget = boardStory.id === targetStoryId;
                    if (!isSource && !isTarget) return boardStory;

                    const updatedStatuses = boardStory.statuses.map((col) => {
                      // Remove from old column in source story
                      if (isSource && col.status_id === sourceStatusId) {
                        return {
                          ...col,
                          tasks: col.tasks.filter((t) => t.id !== task.taskId),
                          task_count: Math.max(col.task_count - 1, 0),
                        };
                      }
                      // Add to new column in target story
                      if (isTarget && col.status_id === targetStatusId) {
                        if (col.tasks.some((t) => t.id === task.taskId)) return col;
                        
                        // Use rawTask if available, otherwise reconstruct from the KanbanTask
                        const baseTask: import('@/src/types/task').TaskResponse = rawTask ?? {
                          id: task.taskId ?? '',
                          project_id: task.projectId ?? projectId,
                          key: task.id,
                          title: task.title,
                          type: 'task',
                          status: '',
                          priority: task.priority?.toLowerCase() as 'low' | 'medium' | 'high' | undefined,
                          assignee_id: undefined,
                          assignee_name:typeof task.assignee === 'string'? task.assignee : task.assignee?.name,
                          assignee: task.assigneeColor ? { color: task.assigneeColor,
                                name:
                                  typeof task.assignee === 'string'
                                    ? task.assignee
                                    : task.assignee?.name ?? '',
                              }
                            : undefined,
                          estimated_hours: 0,
                          reporter_id: undefined,
                          reporter_name: undefined,
                          story_points: task.storyPoints ?? 0,
                          due_date: task.dueDate ? `${task.dueDate}T00:00:00Z` : '',
                          user_story_id: task.user_story_id,
                          sprint_id: undefined,
                          created_at: '',
                          updated_at: '',
                        };
                        
                        const updatedRaw: import('@/src/types/task').TaskResponse = {
                          ...baseTask,
                          status_id: targetStatusId,
                          status: col.status_name ?? '',
                          status_color: col.color ?? '',
                          user_story_id: storyChanged
                            ? (updatePayload.user_story_id ?? undefined)
                            : task.user_story_id,
                          sprint_id: updatePayload.sprint_id ?? task.sprint_id,
                        };
                        return {
                          ...col,
                          tasks: [...col.tasks, updatedRaw],
                          task_count: col.task_count + 1,
                        };
                      }
                      return col;
                    });

                    return { ...boardStory, statuses: updatedStatuses };
                  }),
                })),
              };
            });

            // Also reconcile the tasks cache (used by storyless row)
            queryClient.setQueriesData<{
              data: import('@/src/types/task').TaskResponse[];
              [key: string]: unknown;
            }>({ queryKey: ['tasks', projectId] }, (oldData) => {
              if (!oldData?.data) return oldData;
              return {
                ...oldData,
                data: oldData.data.map((item) =>
                  item.id === task.taskId
                    ? {
                        ...item,
                        status_id: targetStatusId,
                        user_story_id: storyChanged
                          ? (updatePayload.user_story_id ?? undefined)
                          : item.user_story_id,
                        sprint_id: updatePayload.sprint_id ?? item.sprint_id,
                      }
                    : item
                ),
              };
            });

            // Source cell paginated cache
            queryClient.setQueriesData<{
              pages: Array<{
                data: import('@/src/types/board').BoardStory | import('@/src/types/board').BoardStory[];
                [key: string]: unknown;
              }>;
              [key: string]: unknown;
            }>(
              { 
                predicate: (query) => {
                  const key = query.queryKey;
                  return (
                    Array.isArray(key) &&
                    key[0] === 'board-status-tasks' &&
                    key[1] === projectId &&
                    key[2] === sourceStoryId &&
                    key[3] === sourceStatusId
                  );
                }
              },
              (oldData) => {
                if (!oldData?.pages) return oldData;
                
                return {
                  ...oldData,
                  pages: oldData.pages.map((page) => {
                    const story = Array.isArray(page.data) ? page.data[0] : page.data;
                    if (!story) return page;
                    
                    return {
                      ...page,
                      data: Array.isArray(page.data) ? [{
                        ...story,
                        statuses: story.statuses?.map((col) =>
                          col.status_id === sourceStatusId
                            ? {
                                ...col,
                                tasks: col.tasks.filter((t) => t.id !== task.taskId),
                                task_count: Math.max((col.task_count || 0) - 1, 0),
                              }
                            : col
                        ),
                      }] : {
                        ...story,
                        statuses: story.statuses?.map((col) =>
                          col.status_id === sourceStatusId
                            ? {
                                ...col,
                                tasks: col.tasks.filter((t) => t.id !== task.taskId),
                                task_count: Math.max((col.task_count || 0) - 1, 0),
                              }
                            : col
                        ),
                      },
                    };
                  }),
                };
              }
            );

            // Target cell paginated cache (if task exists in paginated data, update it)
            queryClient.setQueriesData<{
              pages: Array<{
                data: import('@/src/types/board').BoardStory | import('@/src/types/board').BoardStory[];
                [key: string]: unknown;
              }>;
              [key: string]: unknown;
            }>(
              { 
                predicate: (query) => {
                  const key = query.queryKey;
                  return (
                    Array.isArray(key) &&
                    key[0] === 'board-status-tasks' &&
                    key[1] === projectId &&
                    key[2] === targetStoryId &&
                    key[3] === targetStatusId
                  );
                }
              },
              (oldData) => {
                if (!oldData?.pages) return oldData;
                
                // Only update if task already exists in this paginated cache
                let taskFound = false;
                oldData.pages.forEach((page) => {
                  const story = Array.isArray(page.data) ? page.data[0] : page.data;
                  if (story?.statuses) {
                    story.statuses.forEach((col) => {
                      if (col.tasks.some((t) => t.id === task.taskId)) {
                        taskFound = true;
                      }
                    });
                  }
                });
                
                if (!taskFound) return oldData; 
                
                return {
                  ...oldData,
                  pages: oldData.pages.map((page) => {
                    const story = Array.isArray(page.data) ? page.data[0] : page.data;
                    if (!story) return page;
                    
                    return {
                      ...page,
                      data: Array.isArray(page.data) ? [{
                        ...story,
                        statuses: story.statuses?.map((col) =>
                          col.status_id === targetStatusId
                            ? {
                                ...col,
                                tasks: col.tasks.map((t) => 
                                  t.id === task.taskId 
                                    ? {
                                        ...t,
                                        status_id: targetStatusId,
                                        user_story_id: storyChanged
                                          ? (updatePayload.user_story_id ?? undefined)
                                          : t.user_story_id,
                                        sprint_id: updatePayload.sprint_id ?? t.sprint_id,
                                      }
                                    : t
                                ),
                              }
                            : col
                        ),
                      }] : {
                        ...story,
                        statuses: story.statuses?.map((col) =>
                          col.status_id === targetStatusId
                            ? {
                                ...col,
                                tasks: col.tasks.map((t) => 
                                  t.id === task.taskId 
                                    ? {
                                        ...t,
                                        status_id: targetStatusId,
                                        user_story_id: storyChanged
                                          ? (updatePayload.user_story_id ?? undefined)
                                          : t.user_story_id,
                                        sprint_id: updatePayload.sprint_id ?? t.sprint_id,
                                      }
                                    : t
                                ),
                              }
                            : col
                        ),
                      },
                    };
                  }),
                };
              }
            );

            // Clear the optimistic entry — cache is now the source of truth
            setOptimisticUpdates((prev) => {
              const next = new Map(prev);
              next.delete(task.id);
              return next;
            });
          })
          .catch((err: Error) => {
            logger.log('Failed to update task', err);
            // Revert the optimistic update on error
            setOptimisticUpdates((prev) => {
              const next = new Map(prev);
              next.delete(task.id);
              return next;
            });
          });
      }
    },
    [processedStories, selectedSprint, canEditTask, allTasksRef, queryClient]
  );

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 flex-shrink-0 px-3 sm:px-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Kanban Board</h1>
          <p className="text-sm text-gray-500 dark:text-slate-100">
            Visualize and manage your team&apos;s tasks across workflow stages.
          </p>
          {storeProject && (
            <p className="text-xs text-gray-400 dark:text-slate-100 mt-0.5">
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
                const isSelected = assigneeIdFilter.includes(userId);

                return (
                  <button
                    key={member.id || member.user_id || member.user?.id}
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
            <Image
              src="/images/kanban method-pana.svg"
              alt="Access Restricted"
              width={360}
              height={360}
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
            <Image
              src="/images/kanban method-pana.svg"
              alt="No Tasks"
              width={360}
              height={360}
              className="h-90 w-90"
            />

            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">No tasks found</h2>

            <p className="mt-3 max-w-md text-center text-gray-500 dark:text-slate-200">
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
              <div className="sticky top-0 z-20 bg-white dark:bg-gray-100 flex border-b-2 border-gray-300 dark:border-gray-700">
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
                  onUserStoryClick={handleUserStoryClick}
                  onTaskClick={handleTaskClick}
                  onRefetch={handleRefetch}
                  collapsedStatuses={collapsedStatuses}
                  hasMoreByStatus={story.hasMoreByStatus ?? new Map()}
                  projectId={selectedProject}
                  mapTask={mapToKanbanTask}
                  allTasksRef={allTasksRef}
                  optimisticUpdates={optimisticUpdates}
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

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={handleCloseDrawer}
          onOpenUserStory={handleUserStoryClick}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            handleRefetch();
          }}
          onDelete={() => {
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            handleRefetch();
            handleCloseDrawer();
          }}
        />
      )}

      {/* User Story Detail Drawer */}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={handleCloseDrawer}
          onOpenTask={handleTaskClick}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
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
              queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
              handleCloseDrawer();
            } catch {
              // Error is already handled by the mutation
            }
          }}
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
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            if (taskUserStoryId) {
              queryClient.invalidateQueries({
                queryKey: ['user-story', selectedProject, taskUserStoryId],
              });
            }
            handleRefetch();
            setTaskUserStoryId('');
            setMemberSearch('');
          }}
        />
      )}
    </div>
  );
};
