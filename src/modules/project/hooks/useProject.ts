import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/src/services/project';
import {
  CreateProjectPayload,
  UpdateProjectPayload,
  AddProjectMembersPayload,
  GetProjectQueryParams,
} from '@/src/types/project';

export const useGetProjects = (params?: GetProjectQueryParams) => {
  const query = useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.getProject(params),
  });

  return {
    projects: query.data?.data,
    meta: query.data?.meta,
    isLoadingProjects: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchProjects: query.refetch,
  };
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    createProject: mutation.mutate,
    createProjectAsync: mutation.mutateAsync,
    isCreatingProject: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};

export const useGetProject = (enabled = true) => {
  const query = useQuery({
    queryKey: ['project'],
    queryFn: () => projectService.getProject(),
    enabled: enabled,
  });

  return {
    project: query.data?.data,
    isLoadingProject: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchProject: query.refetch,
  };
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: UpdateProjectPayload }) =>
      projectService.updateProject(projectId, payload),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectDetail', variables.projectId] });
    },
  });

  return {
    updateProject: mutation.mutate,
    updateProjectAsync: mutation.mutateAsync,
    isUpdatingProject: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};

export const useAddProjectMembers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddProjectMembersPayload) => projectService.addMembers(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projectDetail', variables.project_id] });
    },
  });

  return {
    addMembers: mutation.mutate,
    addMembersAsync: mutation.mutateAsync,
    isAddingMembers: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useGetProjectMembers = (projectId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: enabled && !!projectId,
  });

  return {
    members: query.data?.data,
    isLoadingMembers: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchMembers: query.refetch,
  };
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectService.removeMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectDetail', variables.projectId] });
    },
  });

  return {
    removeMember: mutation.mutate,
    removeMemberAsync: mutation.mutateAsync,
    isRemovingMember: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useGetProjectDetail = (projectId: string, enabled = true) => {
  const query = useQuery({
    queryKey: ['projectDetail', projectId],
    queryFn: () => projectService.getProjectDetail(projectId),
    enabled: enabled && !!projectId,
  });

  return {
    projectDetail: query.data?.data,
    isLoadingProjectDetail: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchProjectDetail: query.refetch,
  };
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    deleteProject: mutation.mutate,
    deleteProjectAsync: mutation.mutateAsync,
    isDeletingProject: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};
