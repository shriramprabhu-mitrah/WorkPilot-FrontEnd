'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { taskStoryRelationshipService } from '@/src/services/taskStoryRelationship';

import { CreateTaskUnderStoryPayload } from '@/src/types/taskStoryRelationship';

export const useTaskStoryRelationship = (projectId: string, userStoryId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: relatedTasks,
    isLoading: isLoadingRelatedTasks,
    isFetching: isFetchingRelatedTasks,
    refetch: refetchRelatedTasks,
  } = useQuery({
    queryKey: ['task-story-relationship', projectId, userStoryId],

    queryFn: () => taskStoryRelationshipService.getTasksByStory(projectId, userStoryId!),

    enabled: !!projectId && !!userStoryId,
  });

  const createTaskUnderStory = useMutation({
    mutationFn: (payload: CreateTaskUnderStoryPayload) =>
      taskStoryRelationshipService.createTaskUnderStory(projectId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-story-relationship', projectId],
      });
    },
  });

  const assignTaskToStory = useMutation({
    mutationFn: ({ taskId, userStoryId }: { taskId: string; userStoryId: string }) =>
      taskStoryRelationshipService.assignTaskToStory(projectId, taskId, userStoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-story-relationship', projectId],
      });
    },
  });

  const removeTaskFromStory = useMutation({
    mutationFn: (taskId: string) =>
      taskStoryRelationshipService.removeTaskFromStory(projectId, taskId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-story-relationship', projectId],
      });
    },
  });

  return {
    relatedTasks,

    isLoadingRelatedTasks,
    isFetchingRelatedTasks,
    refetchRelatedTasks,
    createTaskUnderStory,
    assignTaskToStory,
    removeTaskFromStory,
  };
};
