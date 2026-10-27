import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Active, Over } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useUpdateUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import { UserStoryResponse } from '@/src/types/userstories';
import { SprintDetail } from '@/src/types/project';
import { resolveStoryTargetSprint } from '../utils/dropTargets';
import { normalizeStatus } from '../utils/backlogUtils';
import {
  InfiniteStoryData,
  ListCache,
  addToInfiniteCache,
  isStory,
  removeFromInfiniteCache,
} from '../utils/infiniteCache';
import type { SettleStory, StoryOptimistic } from './useBacklogOptimistic';

interface Deps {
  userStories: UserStoryResponse[];
  sprints: SprintDetail[];
  userStoryStatuses: { id: string; name: string; color?: string }[];
  storyUpdates: Map<string, StoryOptimistic>;
  setStoryUpdates: Dispatch<SetStateAction<Map<string, StoryOptimistic>>>;
  settleStory: SettleStory;
  setSelectedUserStory: Dispatch<SetStateAction<UserStoryResponse | null>>;
  canEditUserStory: boolean;
  canEditSprint: boolean;
}

export const useStoryDrop = ({
  userStories,
  sprints,
  userStoryStatuses,
  storyUpdates,
  setStoryUpdates,
  settleStory,
  setSelectedUserStory,
  canEditUserStory,
  canEditSprint,
}: Deps) => {
  const queryClient = useQueryClient();
  const updateStory = useUpdateUserStory();

  return useCallback(
    async (active: Active, over: Over, currentStory: UserStoryResponse | null, pid: string) => {
      if (!canEditUserStory) {
        toast.error("You don't have permission to modify user stories");
        return;
      }
      const storyId = (active.data.current?.storyId || currentStory?.id) as string;
      if (!storyId) return;

      const targetId = resolveStoryTargetSprint(over, (id) => userStories.find((s) => s.id === id));
      if (targetId && !canEditSprint) {
        toast.error("You don't have permission to modify sprints");
        return;
      }
      const targetSprint = targetId ? sprints.find((s) => s.id === targetId) : undefined;
      const isTargetActive = String(targetSprint?.status ?? '').toLowerCase() === 'active';

      const known =
        (active.data.current?.story as UserStoryResponse | undefined) ||
        currentStory ||
        storyUpdates.get(storyId)?.story ||
        userStories.find((s) => isStory(s, storyId));
      const currentId = storyUpdates.get(storyId)?.sprintId ?? known?.sprint_id ?? null;
      if (currentId === targetId) return; 

      const storyObj: UserStoryResponse =
        known ?? ({ id: storyId, title: 'Story' } as UserStoryResponse);

      // Todo -> active sprint = In Progress; In Progress -> non-active / backlog = Todo
      const status = normalizeStatus(storyObj.status);
      const findStatus = (name: string) =>
        userStoryStatuses.find((s) => normalizeStatus(s.name) === name);
      const nextStatus =
        targetId && isTargetActive && status === 'todo'
          ? findStatus('in progress')
          : status === 'in progress' && !isTargetActive
            ? findStatus('todo')
            : undefined;

      const updated: UserStoryResponse = {
        ...storyObj,
        sprint_id: targetId ?? undefined,
        ...(nextStatus
          ? { status_id: nextStatus.id, status: nextStatus.name, status_color: nextStatus.color }
          : {}),
      };

      setStoryUpdates((prev) =>
        new Map(prev).set(storyId, {
          sprintId: targetId,
          statusId: nextStatus?.id ?? storyObj.status_id,
          story: updated,
          timestamp: Date.now(),
        })
      );
      if (targetId) {
        const queryKey = ['sprint-user-stories', pid, targetId];
        queryClient.setQueryData<InfiniteStoryData>(queryKey, (old) =>
          addToInfiniteCache(old, updated)
        );
        queryClient.setQueriesData<InfiniteStoryData>({ queryKey }, (old) =>
          addToInfiniteCache(old, updated)
        );
      }
      if (currentId) {
        queryClient.setQueriesData<InfiniteStoryData>(
          { queryKey: ['sprint-user-stories', pid, currentId] },
          (old) => removeFromInfiniteCache(old, storyId)
        );
      }
      queryClient.setQueriesData<ListCache<UserStoryResponse>>(
        { queryKey: ['user-stories', pid] },
        (old) =>
          !old || !Array.isArray(old.data)
            ? old
            : { ...old, data: old.data.map((s) => (s.id === storyId ? updated : s)) }
      );
      setSelectedUserStory((prev) =>
        prev && isStory(prev, storyId) ? { ...prev, ...updated } : prev
      );

      try {
        await updateStory.mutateAsync({
          projectId: pid,
          userStoryId: storyId,
          payload: { sprint_id: targetId, ...(nextStatus ? { status_id: nextStatus.id } : {}) },
        });
        toast.success(
          targetId
            ? targetSprint
              ? `Story assigned to ${targetSprint.name}`
              : 'Story assigned to sprint'
            : 'Story moved to backlog'
        );
        // Single refresh after the update
        void settleStory(pid, [storyId, storyObj.key], targetId === null, [['user-story', pid]]);
      } catch {
        setStoryUpdates((prev) => {
          const next = new Map(prev);
          next.delete(storyId);
          return next;
        });
        toast.error('Failed to update user story');
        ['user-stories', 'sprint-user-stories', 'user-story'].forEach((k) =>
          queryClient.invalidateQueries({ queryKey: [k, pid] })
        );
      }
    },
    [
      userStories,
      sprints,
      userStoryStatuses,
      storyUpdates,
      setStoryUpdates,
      settleStory,
      setSelectedUserStory,
      canEditUserStory,
      canEditSprint,
      queryClient,
      updateStory,
    ]
  );
};
