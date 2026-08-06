import { teamService } from '@/src/services/teams';
import { ApiResponse } from '@/src/types/core';
import { GetUserProjectsResponse, RemoveUserPayload, UpdateRolePayload, User } from '@/src/types/teams';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
export const QUERY_KEYS = {
  TEAM_MEMBERS: 'team-members',
  USER: 'user',
  PROJECT: 'project',
} as const;

export const useGetTeamMembers = (page: number, pageSize: number) => {
  const {
    data: teamMembers,
    isLoading: isTeamMembersLoading,
    refetch: refetchTeamMembers,
  } = useQuery({
    queryKey: [QUERY_KEYS.TEAM_MEMBERS, page, pageSize],
    queryFn: () => teamService.getTeamMembers(page, pageSize),
  });
  return {
    teamMembers,
    isTeamMembersLoading,
    refetchTeamMembers,
  };
};

export const useRemoveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RemoveUserPayload) => teamService.removeUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM_MEMBERS],
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => teamService.updateRole(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEAM_MEMBERS],
      });
    },
  });
};

export const useGetUserById = (id: string) => {
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery<ApiResponse<User>>({
    queryKey: [QUERY_KEYS.USER, id],
    queryFn: () => teamService.getUserById(id),
    enabled: !!id,
  });

  return {
    user,
    isUserLoading,
    refetchUser,
  };
};


export const useGetProject = (userId: string) => {
  const {
    data: project,
    isLoading: isProjectLoading,
    refetch: refetchProject,
  } = useQuery<ApiResponse<GetUserProjectsResponse>>({
    queryKey: [QUERY_KEYS.PROJECT, userId],
    queryFn: () => teamService.getProject(userId),
    enabled: !!userId,
  });

  return {
    project,
    isProjectLoading,
    refetchProject,
  };
};