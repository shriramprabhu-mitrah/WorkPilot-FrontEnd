'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SprintDetail } from '@/src/types/project';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { DraggableUserStory } from './DraggableUserStory';
import { BacklogRow } from './BacklogRow';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { useGetSprintUserStories } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetSprintOrphanTasks } from '@/src/modules/tasks/hooks/useTask';
import { usePermissions } from '@/src/hooks/usePermissions';
import { WpButton } from '@/src/app/components/common/button';

interface SprintDropZoneProps {
  sprint: SprintDetail;
  projectId: string;
  activeDragType?: 'task' | 'story' | null;
  onStoryClick?: (story: UserStoryResponse) => void;
  onTaskClick?: (task: TaskResponse) => void;
  onStartSprint?: (sprint: SprintDetail) => void;
  onCompleteSprint?: (sprint: SprintDetail) => void;
  isCompletingSprint?: boolean;
  isStartingSprint?: boolean;

}

export const SprintDropZone = ({
  sprint,
  projectId,
  activeDragType,
  onStoryClick,
  onTaskClick,
  onStartSprint,
  onCompleteSprint,
  isCompletingSprint,
  isStartingSprint,
}: SprintDropZoneProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDirectTasksOpen, setIsDirectTasksOpen] = useState(true);
  const { canViewUserStories, canViewTasks, canEditSprint, canEditUserStory, canEditTask } =
    usePermissions();

  // Main sprint droppable (stories & general sprint drop)
  const { setNodeRef: setSprintDropRef, isOver: isOverSprint } = useDroppable({
    id: `sprint-${sprint.id}`,
    data: {
      type: 'sprint',
      sprintId: sprint.id,
      sprint,
    },
  });

  // Dedicated droppable for Direct Sprint Tasks
  const { setNodeRef: setDirectTasksDropRef, isOver: isOverDirectTasks } = useDroppable({
    id: `sprint-direct-${sprint.id}`,
    data: {
      type: 'sprint-direct',
      sprintId: sprint.id,
      sprint,
    },
  });

  const { push } = useOrgNavigation();

  // Fetch user stories for this sprint on initial load
  const {
    userStories: sprintStories,
    totalItems: totalStories,
    isLoading: isLoadingStories,
    isFetching: isFetchingStories,
    isFetchingNextPage: isFetchingNextStories,
    hasNextPage: hasNextStories,
    fetchNextPage: fetchNextStories,
  } = useGetSprintUserStories(projectId, sprint.id, !!projectId && canViewUserStories);

  // Fetch orphan tasks for this sprint on initial load
  const {
    tasks: directSprintTasks,
    totalItems: totalOrphanTasks,
    isLoading: isLoadingTasks,
    isFetching: isFetchingTasks,
    isFetchingNextPage: isFetchingNextTasks,
    hasNextPage: hasNextTasks,
    fetchNextPage: fetchNextTasks,
  } = useGetSprintOrphanTasks(projectId, sprint.id, !!projectId && canViewTasks);

  // IntersectionObserver refs for infinite scroll
  const storiesSentinelRef = useRef<HTMLDivElement>(null);
  const tasksSentinelRef = useRef<HTMLDivElement>(null);
  const storiesScrollRef = useRef<HTMLDivElement>(null);
  const tasksScrollRef = useRef<HTMLDivElement>(null);
  // const [completeSprint, setCompleteSprint] = useState<SprintDetail | null>(null);

  // Infinite scroll for user stories
  const handleStoriesIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (
        entries[0]?.isIntersecting &&
        hasNextStories &&
        !isFetchingNextStories &&
        !isLoadingStories
      ) {
        fetchNextStories();
      }
    },
    [hasNextStories, isFetchingNextStories, isLoadingStories, fetchNextStories]
  );

  useEffect(() => {
    const sentinel = storiesSentinelRef.current;
    const scrollContainer = storiesScrollRef.current;
    if (!sentinel || !scrollContainer || !isOpen || !hasNextStories) return;

    const observer = new IntersectionObserver(handleStoriesIntersect, {
      root: scrollContainer,
      rootMargin: '100px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleStoriesIntersect, isOpen, hasNextStories]);

  // Infinite scroll for orphan tasks
  const handleTasksIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextTasks && !isFetchingNextTasks && !isLoadingTasks) {
        fetchNextTasks();
      }
    },
    [hasNextTasks, isFetchingNextTasks, isLoadingTasks, fetchNextTasks]
  );

  useEffect(() => {
    const sentinel = tasksSentinelRef.current;
    const scrollContainer = tasksScrollRef.current;
    if (!sentinel || !scrollContainer || !isOpen || !isDirectTasksOpen || !hasNextTasks) return;

    const observer = new IntersectionObserver(handleTasksIntersect, {
      root: scrollContainer,
      rootMargin: '100px',
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleTasksIntersect, isOpen, isDirectTasksOpen, hasNextTasks]);

  const isLoading = isLoadingStories || isLoadingTasks;
  const storiesCount = totalStories ?? sprintStories.length;
  const tasksCount = totalOrphanTasks ?? directSprintTasks.length;
  const isOver = isOverSprint || isOverDirectTasks;

  const dropMessage =
    activeDragType === 'task'
      ? 'Drop task here to assign to sprint'
      : activeDragType === 'story'
        ? 'Drop user story here'
        : 'Drop here to assign to sprint';

  return (
    <div
      ref={setSprintDropRef}
      data-sprint-drop-id={sprint.id}
      className={`rounded-xl border overflow-hidden mb-3 transition-all duration-200 ${isOver
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-xl ring-2 ring-blue-300 ring-opacity-50 scale-[1.02]'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
        }`}
    >
      <div
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer transition-all select-none border-b ${isOver
            ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 border-gray-100 dark:border-slate-700'
          }`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span
          className={`transition-colors shrink-0 ${isOver ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'}`}
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            push(`/projects/sprints?sprintId=${sprint.id}`);
          }}
          className={`font-semibold text-sm truncate cursor-pointer transition-colors ${isOver
              ? 'text-blue-700 dark:text-blue-400'
              : 'text-gray-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
        >
          {sprint.name}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 transition-all ${isOver
              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 scale-110'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
            }`}
        >
          {storiesCount} {storiesCount === 1 ? 'story' : 'stories'}
          {tasksCount > 0 && ` · ${tasksCount} ${tasksCount === 1 ? 'task' : 'tasks'}`}
        </span>
        {sprint.start_date && sprint.end_date && (
          <span
            className={`hidden sm:inline text-xs shrink-0 transition-colors ${isOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}
          >
            {new Date(sprint.start_date).toLocaleDateString()} -{' '}
            {new Date(sprint.end_date).toLocaleDateString()}
          </span>
        )}
        {(sprint.status === 'planned' || sprint.status === 'active') && canEditSprint && (
          <WpButton
            size="sm"
            variant="secondary"
            disabled={isCompletingSprint || isStartingSprint}
            onClick={(e) => {
              e.stopPropagation();

              if (sprint.status === 'active') {
                onCompleteSprint?.(sprint);
              } else if (sprint.status === 'planned') {
                onStartSprint?.(sprint);
              }
            }}
            className="ml-auto whitespace-nowrap"
            isLoading={sprint.status === 'planned' && isStartingSprint}
            loadingText="Starting..."
          >
            {isCompletingSprint
              ? 'Completing...'
              : sprint.status === 'active'
                ? 'Complete Sprint'
                : 'Start Sprint'}
          </WpButton>
        )}
      </div>

      {isOpen && (
        <div className="min-h-[80px]">
          {isOverSprint && !isOverDirectTasks && (
            <div className="px-3 sm:px-4 pb-2 pt-2">
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-3 text-center bg-white bg-opacity-60 backdrop-blur-sm animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-700 font-semibold">{dropMessage}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* User Stories */}
              {sprintStories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-5 px-4">
                  <Inbox className="w-6 h-6 text-gray-300 dark:text-slate-600 mb-1" />
                  <p className="text-xs text-gray-400 dark:text-slate-500 text-center">
                    No user stories in this sprint
                  </p>
                  <p className="text-[11px] text-gray-300 dark:text-slate-600 mt-0.5 text-center">
                    Drag stories here to assign them
                  </p>
                </div>
              ) : (
                <div
                  ref={storiesScrollRef}
                  className="max-h-[220px] overflow-y-auto [scrollbar-width:thin]"
                >
                  {sprintStories.map((story) => (
                    <DraggableUserStory
                      key={story.id}
                      story={story}
                      projectId={projectId}
                      onStoryClick={onStoryClick}
                    />
                  ))}

                  {/* Infinite scroll sentinel for user stories */}
                  {hasNextStories && (
                    <div ref={storiesSentinelRef} className="flex items-center justify-center py-2">
                      {isFetchingNextStories && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Loading more stories...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Direct Sprint Tasks Sub-Accordion (Always Visible Droppable Zone) */}
              <div
                ref={setDirectTasksDropRef}
                data-sprint-direct-id={sprint.id}
                className={`border-t transition-colors ${isOverDirectTasks
                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/30 ring-1 ring-blue-300'
                    : 'border-gray-100 dark:border-slate-700/60'
                  }`}
              >
                <div
                  onClick={() => setIsDirectTasksOpen((v) => !v)}
                  className={`px-3 sm:px-4 py-2 flex items-center justify-between cursor-pointer transition-colors select-none ${isOverDirectTasks
                      ? 'bg-blue-100/60 dark:bg-blue-900/40'
                      : 'bg-gray-50/80 dark:bg-slate-700/40 hover:bg-gray-100/80 dark:hover:bg-slate-700/60'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 dark:text-slate-500 shrink-0">
                      {isDirectTasksOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">
                      Storyless Tasks
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200/80 dark:bg-slate-600 text-gray-700 dark:text-slate-200">
                      {tasksCount}
                    </span>
                  </div>
                  {isOverDirectTasks && (
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                      Drop task here
                    </span>
                  )}
                </div>

                {isOverDirectTasks && (
                  <div className="p-2">
                    <div className="border border-dashed border-blue-400 rounded-lg p-2.5 text-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm animate-pulse">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                        Drop task here as Direct Sprint Task
                      </p>
                    </div>
                  </div>
                )}

                {isDirectTasksOpen && (
                  <div className="border-t border-gray-100 dark:border-slate-700/40">
                    {directSprintTasks.length === 0 ? (
                      !isOverDirectTasks && (
                        <div className="flex flex-col items-center justify-center py-4 px-3 text-center">
                          <p className="text-xs text-gray-400 dark:text-slate-500">
                            No direct tasks in this sprint
                          </p>
                          <p className="text-[11px] text-gray-300 dark:text-slate-600 mt-0.5">
                            Drop tasks here to assign them directly
                          </p>
                        </div>
                      )
                    ) : (
                      <div
                        ref={tasksScrollRef}
                        className="max-h-[220px] overflow-y-auto [scrollbar-width:thin]"
                      >
                        {directSprintTasks.map((task) => (
                          <BacklogRow
                            key={task.id || task.key}
                            task={task}
                            onClick={() => onTaskClick?.(task)}
                          />
                        ))}

                        {/* Infinite scroll sentinel for orphan tasks */}
                        {hasNextTasks && (
                          <div
                            ref={tasksSentinelRef}
                            className="flex items-center justify-center py-2"
                          >
                            {isFetchingNextTasks && (
                              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Loading more tasks...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
