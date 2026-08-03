import { teamService } from '@/src/services/teams';
import { ApiResponse } from '@/src/types/core';
import { RemoveUserPayload, UpdateRolePayload, User } from '@/src/types/teams';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
const QUERY_KEY = ['team-members'] as const;
const USER_QUERY_KEY = ['user'] as const;

export const useGetTeamMembers = (page: number, pageSize: number) => {
  const {
    data: teamMembers,
    isLoading: isTeamMembersLoading,
    refetch: refetchTeamMembers,
  } = useQuery({
    queryKey: [...QUERY_KEY, page, pageSize],
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
        queryKey: QUERY_KEY,
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
        queryKey: QUERY_KEY,
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
    queryKey: [...USER_QUERY_KEY, id],
    queryFn: () => teamService.getUserById(id),
    enabled: !!id,
  });

  return {
    user,
    isUserLoading,
    refetchUser,
  };
};
