import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/src/services/project';
import {
  CreateProjectPayload,
  UpdateProjectPayload,
  AddProjectMembersPayload,
  GetProjectQueryParams,
  GetProjectMembersParams,
  ActivityFilters,
} from '@/src/types/project';
import { UpdateProjectRolePayload } from '../types/project';

export const useGetProjectsWithSprints = () => {
  const query = useQuery({
    queryKey: ['projects-with-sprints'],
    queryFn: () => projectService.getProject({ include_sprints: true }),
    staleTime: 5 * 60 * 1000,
  });

  return {
    projectsWithSprints: query.data?.data ?? [],
    isLoadingProjectsWithSprints: query.isLoading,
  };
};

export const useGetProjects = (params?: GetProjectQueryParams) => {
  const query = useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.getProject(params),
  });

  return {
    projects: query.data?.data,
    meta: query.data?.meta,
    isLoadingProjects: query.isLoading,
    isFetchingProjects: query.isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['projects-with-sprints'] });
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

export const useGetProjectMembers = (
  projectId: string,
  params?: GetProjectMembersParams,
  enabled = true
) => {
  const query = useQuery({
    queryKey: [
      'projectMembers',
      projectId,
      params?.page ?? 1,
      params?.page_size ?? 10,
      params?.name ?? '',
    ],
    queryFn: () => projectService.getProjectMembers(projectId, params),
    enabled: enabled && Boolean(projectId),
    staleTime: 30 * 1000,
  });
  return {
    members: query.data?.data ?? [],
    isLoadingMembers: query.isLoading,
    isFetchingMembers: query.isFetching,
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

export const useUpdateProjectRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: UpdateProjectRolePayload) => projectService.updateProjectRole(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projectMembers', variables.project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projectDetail'],
      });
    },
  });
  return {
    updateProjectRole: mutation.mutate,
    updateProjectRoleAsync: mutation.mutateAsync,
    isUpdatingProjectRole: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useGetProjectActivities = (
  projectId: string,
  filters: ActivityFilters,
  enabled = true
) => {
  const query = useQuery({
    queryKey: [
      'projectActivities',
      projectId,
      filters.type,
      filters.page,
      filters.page_size,
      filters.resource_type,
      filters.resource_id,
      filters.user_story_id,
      filters.task_id,
      filters.sprint_id,
      filters.user_id,
      filters.activity_type,
      filters.start_date,
      filters.end_date,
    ],
    queryFn: () => projectService.getActivities(projectId, filters),
    enabled: enabled && Boolean(projectId),
    staleTime: 30 * 1000,
  });

  return {
    activities: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoadingActivities: query.isLoading,
    isFetchingActivities: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

