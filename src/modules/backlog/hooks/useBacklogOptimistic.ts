import { useCallback, useEffect, useMemo, useState } from 'react';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';
import { isStory } from '../utils/infiniteCache';
import type { StoriesSection, TasksSection } from './useBacklogLists';

export interface StoryOptimistic {
  sprintId: string | null;
  statusId?: string;
  story?: UserStoryResponse;
  timestamp: number;
}
export interface TaskOptimistic {
  sprintId: string | null;
  userStoryId: string | null;
  task?: TaskResponse;
  timestamp: number;
}
export type SettleTask = (
  pid: string,
  ids: (string | undefined)[],
  extra?: QueryKey[]
) => Promise<void>;
export type SettleStory = (
  pid: string,
  ids: (string | undefined)[],
  keepUntilServerConfirms?: boolean,
  extra?: QueryKey[]
) => Promise<void>;

interface Args {
  projectId: string;
  stories: StoriesSection;
  tasks: TasksSection;
  userStoryStatuses: { id: string; name: string; color?: string }[];
}

const without = <V>(map: Map<string, V>, ids: (string | undefined)[]) => {
  const next = new Map(map);
  ids.forEach((id) => id && next.delete(id));
  return next;
};

export const useBacklogOptimistic = ({ projectId, stories, tasks, userStoryStatuses }: Args) => {
  const queryClient = useQueryClient();
  const [storyUpdates, setStoryUpdates] = useState<Map<string, StoryOptimistic>>(new Map());
  const [taskUpdates, setTaskUpdates] = useState<Map<string, TaskOptimistic>>(new Map());

  useEffect(() => {
    if (stories.isFetching || storyUpdates.size === 0) return;
    const confirmed: string[] = [];
    storyUpdates.forEach((u, id) => {
      if (u.sprintId !== null) return;
      const server = stories.items.find((s) => isStory(s, id));
      if (server && !server.sprint_id) confirmed.push(id);
    });
    if (confirmed.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStoryUpdates((prev) => without(prev, confirmed));
    }
  }, [stories.items, stories.isFetching, storyUpdates]);

  const settleTask = useCallback<SettleTask>(
    async (pid, ids, extra = []) => {
      const keys: QueryKey[] = [['tasks', pid], ...extra];
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      setTaskUpdates((prev) => without(prev, ids));
    },
    [queryClient]
  );

  const settleStory = useCallback<SettleStory>(
    async (pid, ids, keepUntilServerConfirms = false, extra = []) => {
      const keys: QueryKey[] = [['user-stories', pid], ['sprint-user-stories', pid], ...extra];
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      const clear = () => setStoryUpdates((prev) => without(prev, ids));
      if (keepUntilServerConfirms) setTimeout(clear, 8000);
      else clear();
    },
    [queryClient]
  );

  const optimisticStories = useMemo(() => {
    const base = [...stories.items];
    if (stories.page === 1 && !stories.debouncedSearch) {
      storyUpdates.forEach((u, id) => {
        if (u.story && u.sprintId === null && !base.some((s) => isStory(s, id))) base.push(u.story);
      });
    }
    return base.map((story) => {
      const u = storyUpdates.get(story.id);
      if (!u) return story;
      const status = u.statusId ? userStoryStatuses.find((s) => s.id === u.statusId) : undefined;
      return {
        ...story,
        sprint_id: u.sprintId ?? undefined,
        status_id: u.statusId ?? undefined,
        status: status?.name ?? story.status,
        status_color: status?.color ?? story.status_color,
      };
    });
  }, [stories.items, stories.page, stories.debouncedSearch, storyUpdates, userStoryStatuses]);

  const optimisticTasks = useMemo(() => {
    const base = [...tasks.items];
    if (tasks.page === 1 && !tasks.debouncedSearch) {
      taskUpdates.forEach((u, id) => {
        if (
          u.task &&
          u.sprintId === null &&
          u.userStoryId === null &&
          !base.some((t) => t.id === id || t.key === id)
        ) {
          base.push(u.task);
        }
      });
    }
    return base.map((task) => {
      const u = taskUpdates.get(task.id || task.key || '');
      return u
        ? { ...task, sprint_id: u.sprintId ?? undefined, user_story_id: u.userStoryId ?? undefined }
        : task;
    });
  }, [tasks.items, tasks.page, tasks.debouncedSearch, taskUpdates]);

  const unassignedStories = useMemo(
    () => (projectId ? optimisticStories.filter((s) => !s.sprint_id) : []),
    [projectId, optimisticStories]
  );
  const unassignedTasks = useMemo(
    () => (projectId ? optimisticTasks.filter((t) => !t.sprint_id && !t.user_story_id) : []),
    [projectId, optimisticTasks]
  );

  return {
    storyUpdates,
    setStoryUpdates,
    taskUpdates,
    setTaskUpdates,
    settleTask,
    settleStory,
    optimisticTasks,
    unassignedStories,
    unassignedTasks,
  };
};
