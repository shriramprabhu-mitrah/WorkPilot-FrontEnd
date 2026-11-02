import { useCallback, type Dispatch, type SetStateAction, type MutableRefObject } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { logger } from '@/src/lib/utils/logger';
import { taskService } from '@/src/services/tasks';
import { TaskResponse } from '@/src/types/task';
import { KanbanTask, BoardStatusColumn } from '@/src/types/board';
import { BoardInfiniteData, OptimisticUpdate } from '../components';
import { ColumnPatch, columnsOf, isStorylessId, patchPageData } from '../utils/storylessUtils';

interface DragEndStory {
  id?: string;
  tasksByStatus: Map<string, KanbanTask[]>;
}
interface UseTaskDragEndArgs {
  processedStories: DragEndStory[];
  allTasksRef: MutableRefObject<Map<string, KanbanTask>>;
  selectedProject: string;
  selectedSprint: string;
  canEditTask: boolean;
  setActiveTask: (task: KanbanTask | null) => void;
  setOverCell: (cell: { storyId: string; statusId: string } | null) => void;
  setOptimisticUpdates: Dispatch<SetStateAction<Map<string, OptimisticUpdate>>>;
}

export const useTaskDragEnd = ({
  processedStories,
  allTasksRef,
  selectedProject,
  selectedSprint,
  canEditTask,
  setActiveTask,
  setOverCell,
  setOptimisticUpdates,
}: UseTaskDragEndArgs) => {
  const queryClient = useQueryClient();

  return useCallback(
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

      if (overData?.type === 'cell') {
        targetStatusId = overData.statusId as string;
        targetStoryId = overData.storyId as string;
      } else if (overData?.type === 'card') {
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

      const taskFromRef = allTasksRef.current.get(activeId);
      if (taskFromRef) {
        task = taskFromRef;
        for (const story of processedStories) {
          for (const [statusId, tasks] of story.tasksByStatus.entries()) {
            if (tasks.some((t: KanbanTask) => t.id === activeId)) {
              sourceStory = story;
              sourceStatusId = statusId;
              break;
            }
          }
          if (sourceStory) break;
        }

        if (!sourceStory && taskFromRef.parent && taskFromRef.columnId) {
          sourceStatusId = taskFromRef.columnId;
          sourceStory = processedStories.find((s) => s.id === taskFromRef.parent) || null;
        }
      } else {
        for (const story of processedStories) {
          for (const [statusId, tasks] of story.tasksByStatus.entries()) {
            const foundTask = tasks.find((t: KanbanTask) => t.id === activeId);
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

      if (!task || !sourceStory || !sourceStatusId || !task.taskId) return;

      const movedTask: KanbanTask = task;
      const taskId: string = task.taskId;
      const projectId = task.projectId ?? selectedProject;
      const srcStoryId = sourceStory.id ?? '';
      const srcStatusId: string = sourceStatusId;
      const tgtStoryId: string = targetStoryId;
      const tgtStatusId: string = targetStatusId;
      const statusChanged = srcStatusId !== tgtStatusId;
      const storyChanged = srcStoryId !== tgtStoryId;
      if (!statusChanged && !storyChanged) return;

      const updatePayload: {
        status_id: string;
        user_story_id?: string | null;
        sprint_id?: string | null;
      } = { status_id: tgtStatusId };

      if (storyChanged) {
        if (isStorylessId(tgtStoryId)) {
          updatePayload.user_story_id = null;
          if (selectedSprint) updatePayload.sprint_id = selectedSprint;
        } else {
          updatePayload.user_story_id = tgtStoryId;
        }
      }

      // Optimistic update
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.set(movedTask.id, {
          statusId: tgtStatusId,
          storyId: storyChanged ? tgtStoryId : srcStoryId,
          task: movedTask,
        });
        return next;
      });

      const clearOptimistic = () =>
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(movedTask.id);
          return next;
        });

      const isSameTask = (t: TaskResponse) =>
        t.id === taskId || t.id === movedTask.id || t.key === movedTask.id;

      const reconcileCaches = () => {
        let rawTask: TaskResponse | undefined;
        const cachedBoards = queryClient.getQueriesData<BoardInfiniteData>({
          queryKey: ['board', projectId],
        });
        outer: for (const [, data] of cachedBoards) {
          for (const page of data?.pages ?? []) {
            for (const { col } of columnsOf(page.data)) {
              const found = col.tasks?.find(isSameTask);
              if (found) {
                rawTask = found;
                break outer;
              }
            }
          }
        }

        let pagedSourceHasTask = false;
        const cachedSourcePages = queryClient.getQueriesData<BoardInfiniteData>({
          queryKey: ['board-status-tasks', projectId, srcStoryId, srcStatusId],
        });
        for (const [, data] of cachedSourcePages) {
          for (const page of data?.pages ?? []) {
            for (const { col } of columnsOf(page.data)) {
              if (col.status_id === srcStatusId && col.tasks?.some(isSameTask)) {
                pagedSourceHasTask = true;
              }
            }
          }
        }

        const baseTask: TaskResponse = rawTask ?? {
          id: taskId,
          project_id: projectId,
          key: movedTask.id,
          title: movedTask.title,
          type: 'task',
          status: '',
          priority: movedTask.priority?.toLowerCase() as 'low' | 'medium' | 'high' | undefined,
          assignee_id: undefined,
          assignee_name:
            typeof movedTask.assignee === 'string' ? movedTask.assignee : movedTask.assignee?.name,
          assignee: movedTask.assigneeColor
            ? {
                color: movedTask.assigneeColor,
                name:
                  typeof movedTask.assignee === 'string'
                    ? movedTask.assignee
                    : (movedTask.assignee?.name ?? ''),
              }
            : undefined,
          estimated_hours: 0,
          reporter_id: undefined,
          reporter_name: undefined,
          story_points: movedTask.storyPoints ?? 0,
          due_date: movedTask.dueDate ? `${movedTask.dueDate}T00:00:00Z` : '',
          user_story_id: movedTask.user_story_id,
          sprint_id: undefined,
          created_at: '',
          updated_at: '',
        };

        const withNewPlace = (t: TaskResponse, col: BoardStatusColumn): TaskResponse => ({
          ...t,
          status_id: tgtStatusId,
          status: col.status_name ?? t.status,
          status_color: col.color ?? t.status_color,
          user_story_id: storyChanged
            ? (updatePayload.user_story_id ?? undefined)
            : t.user_story_id,
          sprint_id: updatePayload.sprint_id ?? t.sprint_id,
        });

        const buildPatch = (insertIfMissing: boolean, countAbsentSource: boolean): ColumnPatch => {
          let inserted = false;
          return (col, sId) => {
            if (sId === srcStoryId && col.status_id === srcStatusId) {
              const present = col.tasks.some(isSameTask);
              if (!present && !countAbsentSource) return col;
              return {
                ...col,
                tasks: present ? col.tasks.filter((t) => !isSameTask(t)) : col.tasks,
                task_count: Math.max((col.task_count || 0) - 1, 0),
              };
            }
            if (sId === tgtStoryId && col.status_id === tgtStatusId) {
              if (col.tasks.some(isSameTask)) {
                return {
                  ...col,
                  tasks: col.tasks.map((t) => (isSameTask(t) ? withNewPlace(t, col) : t)),
                };
              }
              if (!insertIfMissing || inserted) return col;
              inserted = true;
              return {
                ...col,
                tasks: [...col.tasks, withNewPlace(baseTask, col)],
                task_count: (col.task_count || 0) + 1,
              };
            }
            return col;
          };
        };

        queryClient.setQueriesData<BoardInfiniteData>({ queryKey: ['board', projectId] }, (old) => {
          if (!old?.pages) return old;
          const patch = buildPatch(true, pagedSourceHasTask);
          return {
            ...old,
            pages: old.pages.map((page) => ({ ...page, data: patchPageData(page.data, patch) })),
          };
        });

        queryClient.setQueriesData<BoardInfiniteData>(
          {
            predicate: (query) => {
              const key = query.queryKey;
              return (
                Array.isArray(key) &&
                key[0] === 'board-status-tasks' &&
                key[1] === projectId &&
                ((key[2] === srcStoryId && key[3] === srcStatusId) ||
                  (key[2] === tgtStoryId && key[3] === tgtStatusId))
              );
            },
          },
          (old) => {
            if (!old?.pages) return old;
            const patch = buildPatch(true, false);
            return {
              ...old,
              pages: old.pages.map((page) => ({ ...page, data: patchPageData(page.data, patch) })),
            };
          }
        );

        queryClient.setQueriesData<{ data: TaskResponse[]; [key: string]: unknown }>(
          { queryKey: ['tasks', projectId] },
          (oldData) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((item) =>
                isSameTask(item)
                  ? {
                      ...item,
                      status_id: tgtStatusId,
                      user_story_id: storyChanged
                        ? (updatePayload.user_story_id ?? undefined)
                        : item.user_story_id,
                      sprint_id: updatePayload.sprint_id ?? item.sprint_id,
                    }
                  : item
              ),
            };
          }
        );
      };

      taskService
        .updateTask(projectId, taskId, updatePayload)
        .then(async () => {
          const snapshots: Array<[QueryKey, unknown]> = [
            ...queryClient.getQueriesData({ queryKey: ['board', projectId] }),
            ...queryClient.getQueriesData({ queryKey: ['board-status-tasks', projectId] }),
            ...queryClient.getQueriesData({ queryKey: ['tasks', projectId] }),
          ];
          try {
            reconcileCaches();
          } catch (cacheErr) {
            logger.log('Cache reconcile failed', cacheErr);
            snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
            queryClient.invalidateQueries({ queryKey: ['board', projectId] });
            queryClient.invalidateQueries({ queryKey: ['board-status-tasks', projectId] });
          }
          await new Promise((resolve) => setTimeout(resolve, 0));
          clearOptimistic();
        })
        .catch((err: Error) => {
          logger.log('Failed to update task', err);
          clearOptimistic();
          toast.error('Failed to move task');
        });
    },
    [
      processedStories,
      allTasksRef,
      selectedProject,
      selectedSprint,
      canEditTask,
      queryClient,
      setActiveTask,
      setOverCell,
      setOptimisticUpdates,
    ]
  );
};
