'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { usePermissions } from '@/src/hooks/usePermissions';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import {
  useBoardProject,
  useBoardFilters,
  useBoardModals,
  useGetBoard,
  useTaskDragEnd,
  useProcessedStories,
} from '../hooks';
import {
  BoardSkeleton,
  BoardHeader,
  BoardEmptyState,
  BoardContent,
  BoardDrawers,
  type OptimisticUpdate,
} from '../components';
import {
  resolveStatusId as resolveStatusIdUtil,
  taskMatchesFilters as taskMatchesFiltersUtil,
  mapTaskToKanban,
} from '../utils/boardTaskUtils';
import { getStorylessColumns } from '../utils/storylessUtils';

export const KanbanBoardTemplate = () => {
  const {
    orgSlug,
    projectSlug,
    taskKey,
    storeProject,
    storeSprint,
    selectedProject,
    selectedSprint,
    isProjectNotFound,
  } = useBoardProject();

  // 2. Permissions
  const { canViewTasks, canCreateTask, canEditTask, canViewUserStories, canViewSprints } =
    usePermissions();
  const canViewBoard = canViewTasks && canViewUserStories && canViewSprints;

  // 3. Filters and member query
  const {
    showFilter,
    setShowFilter,
    filterRef,
    filters,
    assigneeIdFilter,
    displayMembers,
    isLoadingFilterMembers,
    isFetchingFilterMembers,
    allLabels,
    allTypes,
    allAssignees,
    handleFilterChange,
    toggleAssigneeFilter,
    handleAssigneeSearch,
    hasActiveFilter,
    boardQueryParams,
    pageFilters,
    storylessQueryParams,
  } = useBoardFilters({ selectedProject, selectedSprint });

  // 4. Board queries (user stories and storyless tasks)
  const { boardStories, isLoadingBoard, refetchBoard } = useGetBoard(
    selectedProject,
    boardQueryParams,
    !!selectedProject && canViewBoard
  );

  const {
    boardStories: storylessStories,
    isLoadingBoard: isLoadingStorylessTasks,
    refetchBoard: refetchStorylessTasks,
  } = useGetBoard(selectedProject, storylessQueryParams, !!selectedProject && canViewBoard);

  const handleRefetch = useCallback(() => {
    refetchBoard();
    refetchStorylessTasks();
  }, [refetchBoard, refetchStorylessTasks]);

  // 5. Statuses query
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(selectedProject);

  // 6. Board DnD and layout states
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overCell, setOverCell] = useState<{ storyId: string; statusId: string } | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(
    new Map()
  );
  const [collapsedStatuses, setCollapsedStatuses] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const allTasksRef = useRef<Map<string, KanbanTask>>(new Map());

  const resolveStatusId = useCallback(
    (task: TaskResponse) => resolveStatusIdUtil(task, statuses),
    [statuses]
  );

  const taskMatchesFilters = useCallback(
    (task: TaskResponse) => taskMatchesFiltersUtil(task, filters, assigneeIdFilter, statuses),
    [filters, assigneeIdFilter, statuses]
  );

  const mapToKanbanTask = useCallback(
    (
      task: TaskResponse,
      parentStoryId: string,
      resolvedStatusId: string,
      parentStoryKey?: string,
      parentStoryTitle?: string
    ) =>
      mapTaskToKanban(
        task,
        parentStoryId,
        resolvedStatusId,
        selectedProject,
        parentStoryKey,
        parentStoryTitle
      ),
    [selectedProject]
  );

  // 7. Processed stories grouping
  const processedStories = useProcessedStories({
    boardStories,
    storylessStories,
    selectedSprint,
    hasActiveFilter,
    optimisticUpdates,
    resolveStatusId,
    taskMatchesFilters,
    mapToKanbanTask,
  });

  // 8. Drawers and Modals logic
  const {
    selectedTask,
    selectedUserStory,
    showAddTaskModal,
    taskUserStoryId,
    memberSearch,
    setMemberSearch,
    assigneeOptions,
    isLoadingProjectMembers,
    isFetchingProjectMembers,
    handleTaskClick,
    handleUserStoryClick,
    handleCloseDrawer,
    handleTaskDrawerUpdate,
    handleTaskDrawerDelete,
    handleUserStoryDrawerUpdate,
    handleOpenCreateTaskForStory,
    handleUserStoryDrawerDelete,
    handleAddTaskModalClose,
    handleAddTaskModalSuccess,
  } = useBoardModals({
    selectedProject,
    selectedSprint,
    orgSlug,
    projectSlug,
    storeProject,
    taskKey,
    boardStories,
    processedStories,
    canCreateTask,
    handleRefetch,
  });

  // 9. Status column collapse
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

  // 10. Task counts per status
  const taskCountsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    boardStories.forEach((story) => {
      story.statuses.forEach((statusCol) => {
        counts.set(
          statusCol.status_id,
          (counts.get(statusCol.status_id) ?? 0) +
            (statusCol.task_count ?? statusCol.meta?.total ?? 0)
        );
      });
    });
    const storylessStatusColumns = getStorylessColumns(storylessStories);
    storylessStatusColumns.forEach((statusCol) => {
      counts.set(
        statusCol.status_id,
        (counts.get(statusCol.status_id) ?? 0) + (statusCol.task_count ?? 0)
      );
    });
    return counts;
  }, [boardStories, storylessStories]);

  // 11. Drag and Drop events
  const onDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const taskFromRef = allTasksRef.current.get(active.id as string);
      if (taskFromRef) {
        setActiveTask(taskFromRef);
        return;
      }
      for (const story of processedStories) {
        for (const tasks of story.tasksByStatus.values()) {
          const task = tasks.find((t) => t.id === active.id);
          if (task) {
            setActiveTask(task);
            return;
          }
        }
      }
    },
    [processedStories]
  );

  const onDragOver = useCallback(({ over }: DragOverEvent) => {
    if (!over) {
      setOverCell(null);
      return;
    }
    const overData = over.data.current;
    const overId = over.id as string;

    if (overData?.type === 'cell') {
      setOverCell({ storyId: overData.storyId, statusId: overData.statusId });
    } else if (overData?.type === 'card') {
      const task = overData.task as KanbanTask;
      if (task.parent && task.columnId) {
        setOverCell({ storyId: task.parent, statusId: task.columnId });
      }
    } else if (overId.includes('-')) {
      const [storyId, statusId] = overId.split('-');
      setOverCell({ storyId, statusId });
    } else {
      setOverCell(null);
    }
  }, []);

  const onDragEnd = useTaskDragEnd({
    processedStories,
    allTasksRef,
    selectedProject,
    selectedSprint,
    canEditTask,
    setActiveTask,
    setOverCell,
    setOptimisticUpdates,
  });

  const boardLoading =
    !!selectedProject &&
    canViewBoard &&
    (isLoadingBoard || isLoadingStorylessTasks || isLoadingStatus);

  const hasTasks = processedStories.some((story) => (story.total_tasks ?? 0) > 0);

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <BoardHeader
        storeProject={storeProject}
        storeSprint={storeSprint}
        hasActiveFilter={hasActiveFilter}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        filterRef={filterRef}
        filters={filters}
        assigneeIdFilter={assigneeIdFilter}
        allAssignees={allAssignees}
        allLabels={allLabels}
        allTypes={allTypes}
        statuses={statuses}
        handleFilterChange={handleFilterChange}
        handleAssigneeSearch={handleAssigneeSearch}
        isLoadingAssignees={isLoadingFilterMembers || isFetchingFilterMembers}
        displayMembers={displayMembers ?? []}
        toggleAssigneeFilter={toggleAssigneeFilter}
      />

      {/* Main Board Area */}
      {!canViewBoard ? (
        <BoardEmptyState type="restricted" />
      ) : boardLoading ? (
        <BoardSkeleton />
      ) : !hasTasks ? (
        <BoardEmptyState type="no-tasks" />
      ) : (
        <BoardContent
          statuses={statuses}
          collapsedStatuses={collapsedStatuses}
          toggleStatusCollapse={toggleStatusCollapse}
          taskCountsByStatus={taskCountsByStatus}
          processedStories={processedStories}
          overCell={overCell}
          activeTask={activeTask}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          handleUserStoryClick={handleUserStoryClick}
          handleTaskClick={handleTaskClick}
          handleRefetch={handleRefetch}
          selectedProject={selectedProject}
          mapToKanbanTask={mapToKanbanTask}
          allTasksRef={allTasksRef}
          optimisticUpdates={optimisticUpdates}
          pageFilters={pageFilters}
          scrollContainerRef={scrollContainerRef}
        />
      )}

      {/* Drawers and Modals */}
      <BoardDrawers
        selectedTask={selectedTask}
        selectedUserStory={selectedUserStory}
        selectedProject={selectedProject}
        selectedSprint={selectedSprint}
        showAddTaskModal={showAddTaskModal}
        canCreateTask={canCreateTask}
        taskUserStoryId={taskUserStoryId}
        memberSearch={memberSearch}
        setMemberSearch={setMemberSearch}
        assigneeOptions={assigneeOptions}
        isLoadingMembers={isLoadingProjectMembers || isFetchingProjectMembers}
        handleCloseDrawer={handleCloseDrawer}
        handleTaskClick={handleTaskClick}
        handleUserStoryClick={handleUserStoryClick}
        handleTaskDrawerUpdate={handleTaskDrawerUpdate}
        handleTaskDrawerDelete={handleTaskDrawerDelete}
        handleUserStoryDrawerUpdate={handleUserStoryDrawerUpdate}
        handleOpenCreateTaskForStory={handleOpenCreateTaskForStory}
        handleUserStoryDrawerDelete={handleUserStoryDrawerDelete}
        handleAddTaskModalClose={handleAddTaskModalClose}
        handleAddTaskModalSuccess={handleAddTaskModalSuccess}
      />
    </div>
  );
};
