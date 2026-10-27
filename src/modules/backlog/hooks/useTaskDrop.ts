import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Active, Over } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useUpdateTask } from '@/src/modules/tasks/hooks/useTask';
import { KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';
import { SprintDetail } from '@/src/types/project';
import { resolveTaskTarget } from '../utils/dropTargets';
import { kanbanToTaskResponse } from '../utils/backlogUtils';
import {
  InfiniteStoryData, InfiniteTaskData, ListCache,
  addTaskToStory, addToInfiniteCache, isStory, mapInfiniteStories,
  removeFromInfiniteCache, removeTaskFromStory,
} from '../utils/infiniteCache';
import type { SettleTask, StoryOptimistic, TaskOptimistic } from './useBacklogOptimistic';

interface Deps {
  tasksList: TaskResponse[];
  userStories: UserStoryResponse[];
  sprints: SprintDetail[];
  storyUpdates: Map<string, StoryOptimistic>;
  setTaskUpdates: Dispatch<SetStateAction<Map<string, TaskOptimistic>>>;
  settleTask: SettleTask;
  setSelectedTask: Dispatch<SetStateAction<KanbanTask | null>>;
  setSelectedUserStory: Dispatch<SetStateAction<UserStoryResponse | null>>;
  canEditTask: boolean;
  canEditSprint: boolean;
}

export const useTaskDrop = ({
  tasksList, userStories, sprints, storyUpdates, setTaskUpdates, settleTask,
  setSelectedTask, setSelectedUserStory, canEditTask, canEditSprint,
}: Deps) => {
  const queryClient = useQueryClient();
  const { updateTaskAsync } = useUpdateTask();

  return useCallback(
    async (active: Active, over: Over, currentTask: KanbanTask | null, pid: string) => {
      if (!canEditTask) {
        toast.error("You don't have permission to modify tasks");
        return;
      }
      const data = active.data.current;
      const rawId = (data?.task?.id || data?.taskId || currentTask?.taskId || currentTask?.id ||
        String(active.id).replace(/^task-/, '')) as string;
      const target = resolveTaskTarget(over);
      if (!rawId || !target) return;

      // Resolve the real task UUID
      const matched =
        tasksList.find((t) => t.id === rawId || t.key === rawId) ||
        (data?.task as TaskResponse | undefined);
      let actualId = matched?.id || rawId;
      if (actualId === rawId) {
        actualId =
          userStories.flatMap((s) => s.tasks ?? []).find((t) => t.id === rawId || t.key === rawId)
            ?.id || rawId;
      }
      const ids = [actualId, rawId];
      const base: TaskResponse =
        matched ??
        (currentTask
          ? kanbanToTaskResponse(currentTask, actualId, pid)
          : { id: actualId, title: 'Task', status: 'todo', estimated_hours: 0 });

      const setEntry = (entry: TaskOptimistic | null) =>
        setTaskUpdates((prev) => {
          const next = new Map(prev);
          ids.forEach((id) => (entry ? next.set(id, entry) : next.delete(id)));
          return next;
        });
      const removeFromOrphans = () =>
        queryClient.setQueriesData<InfiniteTaskData>(
          { queryKey: ['sprint-orphan-tasks', pid] },
          (old) => removeFromInfiniteCache(old, actualId)
        );
      const fail = (message: string) => {
        setEntry(null);
        toast.error(message);
        ['tasks', 'user-stories', 'sprint-orphan-tasks', 'sprint-user-stories'].forEach((k) =>
          queryClient.invalidateQueries({ queryKey: [k, pid] })
        );
      };

      // A: dropped on a user story
      if (target.kind === 'story') {
        const { storyId } = target;
        const dropData = over.data.current;
        const story =
          (dropData?.story as UserStoryResponse | undefined) ||
          storyUpdates.get(storyId)?.story ||
          userStories.find((s) => isStory(s, storyId));
        const sprintId: string | null =
          dropData?.sprintId || story?.sprint_id || storyUpdates.get(storyId)?.sprintId || null;
        const task: TaskResponse = {
          ...base, id: actualId, key: base.key || rawId,
          user_story_id: storyId, sprint_id: sprintId ?? undefined,
        };
        const addTask = (s: UserStoryResponse) =>
          isStory(s, storyId) ? addTaskToStory(s, task, rawId) : s;

        setEntry({ sprintId, userStoryId: storyId, task, timestamp: Date.now() });
        removeFromOrphans();
        queryClient.setQueriesData<ListCache<TaskResponse>>({ queryKey: ['tasks', pid] }, (old) =>
          !old || !Array.isArray(old.data)
            ? old
            : {
                ...old,
                data: old.data.map((t) =>
                  ids.includes(t.id ?? '') || t.key === rawId
                    ? { ...t, user_story_id: storyId, sprint_id: sprintId ?? undefined }
                    : t
                ),
              }
        );
        queryClient.setQueriesData<ListCache<UserStoryResponse>>(
          { queryKey: ['user-stories', pid] },
          (old) => (!old || !Array.isArray(old.data) ? old : { ...old, data: old.data.map(addTask) })
        );
        if (sprintId) {
          queryClient.setQueriesData<InfiniteStoryData>(
            { queryKey: ['sprint-user-stories', pid, sprintId] },
            (old) => mapInfiniteStories(old, addTask)
          );
        }
        setSelectedTask((prev) =>
          prev && (ids.includes(prev.id) || prev.taskId === actualId)
            ? { ...prev, user_story_id: storyId, sprint_id: sprintId ?? undefined }
            : prev
        );
        setSelectedUserStory((prev) => (prev && isStory(prev, storyId) ? addTask(prev) : prev));

        try {
          await updateTaskAsync({
            projectId: pid,
            taskId: actualId,
            payload: { user_story_id: storyId, ...(sprintId ? { sprint_id: sprintId } : {}) },
          });
          toast.success(`Task assigned to story "${story?.title || 'User Story'}"`);
          // One refresh after the update, nothing before it
          void settleTask(pid, ids, [['task', pid], ['user-story', pid], ['user-stories', pid]]);
        } catch {
          fail('Failed to assign task to user story');
        }
        return;
      }

      // B: dropped on a sprint (or unassigned area when sprintId === null)
      const { sprintId } = target;
      if (sprintId && !canEditSprint) {
        toast.error("You don't have permission to modify sprints");
        return;
      }
      const sprint = sprintId ? sprints.find((s) => s.id === sprintId) : undefined;
      const task: TaskResponse = {
        ...base, id: actualId, sprint_id: sprintId ?? undefined, user_story_id: undefined,
      };

      setEntry({ sprintId, userStoryId: null, task, timestamp: Date.now() });
      removeFromOrphans();
      queryClient.setQueriesData<InfiniteStoryData>(
        { queryKey: ['sprint-user-stories', pid] },
        (old) => mapInfiniteStories(old, (s) => removeTaskFromStory(s, ids))
      );
      if (sprintId) {
        queryClient.setQueriesData<InfiniteTaskData>(
          { queryKey: ['sprint-orphan-tasks', pid, sprintId] },
          (old) => addToInfiniteCache(old, task)
        );
      }

      try {
        await updateTaskAsync({
          projectId: pid,
          taskId: actualId,
          payload: { sprint_id: sprintId, user_story_id: null },
        });
        toast.success(
          sprintId
            ? `Task assigned to sprint "${sprint?.name || 'Sprint'}"`
            : 'Task unassigned from sprint and story'
        );
        void settleTask(pid, ids, [['task', pid]]);
      } catch {
        fail(sprintId ? 'Failed to assign task to sprint' : 'Failed to unassign task');
      }
    },
    [
      tasksList, userStories, sprints, storyUpdates, setTaskUpdates, settleTask,
      setSelectedTask, setSelectedUserStory, canEditTask, canEditSprint,
      queryClient, updateTaskAsync,
    ]
  );
};