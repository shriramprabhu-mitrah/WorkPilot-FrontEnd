'use client';

import React, { useCallback, useMemo } from 'react';
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
  type DropAnimation,
} from '@dnd-kit/core';
import { KanbanTask } from '@/src/types/board';
import { CustomStatus } from '@/src/types/colors';
import { UserStoryResponse } from '@/src/types/userstories';
import { BoardPageFilters } from '@/src/modules/boards/hooks/useBoards';
import { StatusColumnHeader } from './statusColumnHeader';
import { UserStoryRow } from './userStoryRow';
import { KanbanCardPreview } from './kanbannCardsPreviews';
import { ScrollIndicator } from './scrollIndicator';
import { OptimisticUpdate, MapTaskFn } from './types';

export interface ProcessedBoardStory extends UserStoryResponse {
  tasksByStatus: Map<string, KanbanTask[]>;
  hasMoreByStatus?: Map<string, boolean>;
}

interface BoardContentProps {
  statuses: CustomStatus[];
  collapsedStatuses: Set<string>;
  toggleStatusCollapse: (statusId: string) => void;
  taskCountsByStatus: Map<string, number>;
  processedStories: ProcessedBoardStory[];
  overCell: { storyId: string; statusId: string } | null;
  activeTask: KanbanTask | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  handleUserStoryClick: (story: UserStoryResponse) => void;
  handleTaskClick: (task: KanbanTask) => void;
  handleRefetch: () => void;
  selectedProject: string;
  mapToKanbanTask: MapTaskFn;
  allTasksRef: React.MutableRefObject<Map<string, KanbanTask>>;
  optimisticUpdates: Map<string, OptimisticUpdate>;
  pageFilters: BoardPageFilters;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
  duration: 150,
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
};

export const BoardContent = React.memo(function BoardContent({
  statuses,
  collapsedStatuses,
  toggleStatusCollapse,
  taskCountsByStatus,
  processedStories,
  overCell,
  activeTask,
  onDragStart,
  onDragOver,
  onDragEnd,
  handleUserStoryClick,
  handleTaskClick,
  handleRefetch,
  selectedProject,
  mapToKanbanTask,
  allTasksRef,
  optimisticUpdates,
  pageFilters,
  scrollContainerRef,
}: BoardContentProps) {
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const collisionDetection = useCallback(
    (args: Parameters<typeof pointerWithin>[0]) =>
      pointerWithin(args).length ? pointerWithin(args) : closestCenter(args),
    []
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
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
                <StatusColumnHeader
                  key={status.id}
                  status={status}
                  taskCount={taskCount}
                  isCollapsed={isCollapsed}
                  toggleStatusCollapse={toggleStatusCollapse}
                />
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
              pageFilters={pageFilters}
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
  );
});
