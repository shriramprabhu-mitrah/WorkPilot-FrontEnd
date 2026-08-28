import { teamService } from '@/src/services/teams';
import { ApiResponse } from '@/src/types/core';
import {
  GetUserProjectsResponse,
  RemoveUserPayload,
  UpdateRolePayload,
  User,
} from '@/src/types/teams';
import { AddProjectMembersPayload, ProjectMember } from '@/src/types/project';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
export const QUERY_KEYS = {
  TEAM_MEMBERS: 'team-members',
  PROJECT_MEMBERS: 'project-members',
  USER: 'user',
  PROJECT: 'project',
} as const;

export const useGetProjectMembers = (projectId: string, page: number, pageSize: number) => {
  const {
    data: projectMembers,
    isLoading: isProjectMembersLoading,
    refetch: refetchProjectMembers,
  } = useQuery({
    queryKey: [QUERY_KEYS.PROJECT_MEMBERS, projectId, page, pageSize],
    queryFn: () => teamService.getProjectMembers(projectId, page, pageSize),
    enabled: !!projectId,
  });

  return {
    projectMembers,
    isProjectMembersLoading,
    refetchProjectMembers,
  };
};

export const useAddProjectMembers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddProjectMembersPayload) => teamService.addProjectMembers(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_MEMBERS, variables.project_id],
      });
    },
  });

  return {
    addMembers: mutation.mutate,
    addMembersAsync: mutation.mutateAsync,
    isAddingMembers: mutation.isPending,
    addMembersError: mutation.error,
  };
};

export const useGetTeamMembers = (page: number, pageSize: number, status?: string) => {
  const {
    data,
    isLoading: isTeamMembersLoading,
    isFetching: isTeamMembersFetching,
    refetch: refetchTeamMembers,
  } = useQuery({
    queryKey: [QUERY_KEYS.TEAM_MEMBERS, page, pageSize, status],
    queryFn: () => teamService.getTeamMembers(page, pageSize, status),
    placeholderData: (previousData) => previousData,
  });

  return {
    teamMembers: data,
    isTeamMembersLoading,
    isTeamMembersFetching,
    refetchTeamMembers,
  };
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      teamService.removeProjectMember(projectId, userId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_MEMBERS, variables.projectId],
      });
    },
  });
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
