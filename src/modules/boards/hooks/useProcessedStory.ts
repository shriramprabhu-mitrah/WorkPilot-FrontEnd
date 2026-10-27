import { useMemo } from 'react';
import { useGetBoard } from '@/src/modules/boards/hooks/useBoards';
import { TaskResponse } from '@/src/types/task';
import { KanbanTask } from '@/src/types/board';
import { OptimisticUpdate } from '../components';
import { getStorylessColumns, STORYLESS_ID } from '../utils/storylessUtils';

type BoardStories = ReturnType<typeof useGetBoard>['boardStories'];

interface UseProcessedStoriesArgs {
  boardStories: BoardStories;
  storylessStories: BoardStories;
  selectedSprint: string;
  hasActiveFilter: boolean;
  optimisticUpdates: Map<string, OptimisticUpdate>;
  resolveStatusId: (task: TaskResponse) => string;
  taskMatchesFilters: (task: TaskResponse) => boolean;
  mapToKanbanTask: (
    task: TaskResponse,
    parentStoryId: string,
    resolvedStatusId: string,
    parentStoryKey?: string,
    parentStoryTitle?: string
  ) => KanbanTask;
}

export const useProcessedStories = ({
  boardStories,
  storylessStories,
  selectedSprint,
  hasActiveFilter,
  optimisticUpdates,
  resolveStatusId,
  taskMatchesFilters,
  mapToKanbanTask,
}: UseProcessedStoriesArgs) => {
  return useMemo(() => {
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
            const key = task.key ?? task.id ?? '';
            const optimistic = optimisticUpdates.get(key);
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
            const key = task.key ?? task.id ?? '';
            const optimistic = optimisticUpdates.get(key);
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

        const movedInFromOtherStory: KanbanTask[] = Array.from(optimisticUpdates.entries())
          .filter(
            ([key, upd]) =>
              !!upd.task &&
              upd.storyId === story.id &&
              upd.statusId === statusCol.status_id &&
              !taskLookup.has(key)
          )
          .map(([, upd]) => ({
            ...(upd.task as KanbanTask),
            columnId: statusCol.status_id,
            parent: story.id,
          }))
          .filter((t) => !tasks.some((kt) => kt.id === t.id));

        const allTasks = [...tasks, ...movedInFromOtherStory];
        if (allTasks.length > 0) acc.set(statusCol.status_id, allTasks);
        return acc;
      }, new Map());

      return { ...story, tasksByStatus, hasMoreByStatus, total_tasks: story.total_tasks ?? 0 };
    });

    const storylessStatusColumns = getStorylessColumns(storylessStories);
    const storylessTasks = storylessStatusColumns
      .flatMap((statusCol) => statusCol.tasks ?? [])
      .filter((task) => !hasActiveFilter || taskMatchesFilters(task));

    const storylessTasksByStatus = storylessTasks.reduce<Map<string, KanbanTask[]>>((acc, task) => {
      const key = task.key ?? task.id ?? '';
      const optimistic = optimisticUpdates.get(key);
      const effectiveStoryId = optimistic?.storyId ?? STORYLESS_ID;
      if (effectiveStoryId !== STORYLESS_ID) return acc;
      const resolvedStatus = resolveStatusId(task);
      const effectiveStatusId = optimistic?.statusId ?? resolvedStatus;
      const kt = mapToKanbanTask(task, STORYLESS_ID, effectiveStatusId);
      const bucket = acc.get(effectiveStatusId) ?? [];
      if (bucket.some((t) => t.id === kt.id)) return acc;
      acc.set(effectiveStatusId, [...bucket, kt]);
      return acc;
    }, new Map());

    optimisticUpdates.forEach((upd, key) => {
      if (upd.storyId !== STORYLESS_ID || !upd.task) return;
      const bucket = storylessTasksByStatus.get(upd.statusId) ?? [];
      if (bucket.some((t) => t.id === key)) return;
      storylessTasksByStatus.set(upd.statusId, [
        ...bucket,
        { ...upd.task, columnId: upd.statusId, parent: STORYLESS_ID },
      ]);
    });

    const storylessHasMoreByStatus = new Map<string, boolean>(
      storylessStatusColumns.map((col) => [col.status_id, col.meta?.has_next ?? false])
    );

    const directSprintTotal = storylessStatusColumns.reduce(
      (sum, col) => sum + (col.task_count ?? 0),
      0
    );

    if (directSprintTotal > 0 || (!!selectedSprint && !hasActiveFilter)) {
      mappedStories.push({
        id: STORYLESS_ID,
        title: 'Storyless Tasks',
        description: selectedSprint
          ? 'Tasks assigned to this sprint without a user story'
          : 'Tasks assigned to sprints without a user story',
        priority: 'medium',
        status: 'in_progress',
        statuses: [],
        tasksByStatus: storylessTasksByStatus,
        hasMoreByStatus: storylessHasMoreByStatus,
        total_tasks: directSprintTotal,
      } as unknown as (typeof mappedStories)[0]);
    }

    return mappedStories;
  }, [
    boardStories,
    storylessStories,
    selectedSprint,
    hasActiveFilter,
    taskMatchesFilters,
    optimisticUpdates,
    resolveStatusId,
    mapToKanbanTask,
  ]);
};
