import { teamService } from '@/src/services/teams';
import { RemoveUserPayload, UpdateRolePayload } from '@/src/types/teams';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
const QUERY_KEY = ['team-members'] as const;

export const useGetTeamMembers = (page: number, pageSize: number ) => {
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
