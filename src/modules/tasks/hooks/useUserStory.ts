import { userStoryService } from '@/src/services/userstory';
import {
  GetUserStoriesQueryParams,
  UpdateUserStoryPayload,
  UserStoryPayload,
} from '@/src/types/userstories';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetUserStories = (
  projectId: string,
  params?: GetUserStoriesQueryParams,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['user-stories', projectId, params],
    queryFn: () => userStoryService.getUserStories(projectId, params),
    enabled: enabled && !!projectId,
  });
  return {
    userStories: query.data?.data ?? [],
    isLoadingUserStories: query.isLoading,
    isFetchingUserStories: query.isFetching,
    isErrorUserStories: query.isError,
    error: query.error,
    refetchUserStories: query.refetch,
  };
};

export const useCreateUserStory = (projectId: string) => {
  const mutation = useMutation({
    mutationFn: (payload: UserStoryPayload) => userStoryService.createUserStory(projectId, payload),
  });
  return {
    createUserStory: mutation.mutate,
    createUserStoryAsync: mutation.mutateAsync,
    isCreatingUserStory: mutation.isPending,
    createUserStoryError: mutation.error,
  };
};

export const useGetUserStoryById = (projectId: string, userStoryId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['user-story', projectId, userStoryId],
    queryFn: () => userStoryService.getUserStoryById(projectId, userStoryId),
    enabled: enabled && !!projectId && !!userStoryId,
  });
  return {
    userStory: query.data?.data,
    isLoadingUserStory: query.isLoading,
    isFetchingUserStory: query.isFetching,
    refetchUserStory: query.refetch,
    error: query.error,
  };
};

export const useUpdateUserStory = () => {
  return useMutation({
    mutationFn: ({
      projectId,
      userStoryId,
      payload,
    }: {
      projectId: string;
      userStoryId: string;
      payload: UpdateUserStoryPayload;
    }) => userStoryService.updateUserStory(projectId, userStoryId, payload),
  });
};

export const useDeleteUserStory = () => {
  return useMutation({
    mutationFn: ({ projectId, userStoryId }: { projectId: string; userStoryId: string }) =>
      userStoryService.deleteUserStory(projectId, userStoryId),
  });
};
