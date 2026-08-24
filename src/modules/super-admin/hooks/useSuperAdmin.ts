import { useQuery } from '@tanstack/react-query';
import {
  userAdminService,
  AdminOrganizationsParams,
  AdminMembersParams,
  AdminProjectsParams,
} from '@/src/services/superadmin';

export const useGetOrganizations = (params?: AdminOrganizationsParams, enabled = true) => {
  const query = useQuery({
    queryKey: ['admin-organizations', params],
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
    refetchOrganizations: query.refetch,
  };
};

export const useGetMembers = (params?: AdminMembersParams, enabled = true) => {
  const query = useQuery({
    queryKey: ['admin-members', params],
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
    refetchMembers: query.refetch,
  };
};

export const useGetAllProjects = (params?: AdminProjectsParams, enabled = true) => {
  const query = useQuery({
    queryKey: ['admin-projects', params],
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
    refetchProjects: query.refetch,
  };
};
