import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAdminService, AdminOrganizationsParams } from '@/src/services/superadmin';
import {
  AdminMembersParams,
  AdminProjectsParams,
  UpdateOrganization,
} from '@/src/types/superadmin';

const QUERY_KEYS = {
  ADMIN_ORGANIZATION: 'admin-organizations',
  ADMIN_MEMBERS: 'admin-members',
  ADMIN_PROJECTS: 'admin-projects',
  ORGANIZATIONS: 'organizations',
} as const;

export const useGetOrganizations = (params?: AdminOrganizationsParams, enabled = true) => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ORGANIZATION, params],
    queryFn: () => userAdminService.getOrganizations(params),
    enabled,
  });

  return {
    organizations: query.data?.data,
    meta: query.data?.meta,
    isLoadingOrganizations: query.isLoading,
    isFetchingOrganizations: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

export const useGetMembers = (params?: AdminMembersParams, enabled = true) => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_MEMBERS, params],
    queryFn: () => userAdminService.getMembers(params),
    enabled,
  });

  return {
    members: query.data?.data,
    meta: query.data?.meta,
    isLoadingMembers: query.isLoading,
    isFetchingMembers: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

export const useGetAllProjects = (params?: AdminProjectsParams, enabled = true) => {
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_PROJECTS, params],
    queryFn: () => userAdminService.getAllProjects(params),
    enabled,
  });

  return {
    projects: query.data?.data,
    meta: query.data?.meta,
    isLoadingProjects: query.isLoading,
    isFetchingProjects: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, is_active }: UpdateOrganization) =>
      userAdminService.updateOrganization(organizationId, is_active),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORGANIZATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_ORGANIZATION],
      });
    },
  });
};
