import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/src/services/organization';
import { useAppDispatch } from '@/src/store';
import { updateOrganization, setOrganization } from '@/src/store/slices/organization';
import { useEffect } from 'react';
import { CountryService } from '@/src/services/common/countryservice';

// Hook for fetching organization data
export const useGetOrganization = () => {
  const {
    data: organization,
    isLoading: isOrganizationLoading,
    refetch: refetchOrganization,
  } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationService.getOrganization,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (organization) {
      dispatch(setOrganization(organization.data ?? {}));
    }
  }, [organization, dispatch]);

  return {
    organization,
    isOrganizationLoading,
    refetchOrganization,
  };
};

// Hook for creating an organization
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const mutation = useMutation({
    mutationFn: organizationService.createOrganization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      if (data?.data) {
        dispatch(setOrganization(data.data));
      }
    },
  });

  return {
    createOrg: mutation.mutateAsync,
    isCreatingOrg: mutation.isPending,
  };
};

export const useInviteUsers = () => {
  const mutation = useMutation({
    mutationFn: organizationService.inviteUsers,
  });

  return {
    inviteOrgUsers: mutation.mutateAsync,
    isInvitingUsers: mutation.isPending,
  };
};

// Hook for updating organization
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: organizationService.updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  return {
    updateOrg: mutation.mutateAsync,
    isUpdatingOrg: mutation.isPending,
  };
};

// Hook for deleting organization
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: organizationService.deleteOrganization,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['organization'] });
    },
  });

  return {
    deleteOrg: mutation.mutateAsync,
    isDeletingOrg: mutation.isPending,
  };
};

export const useGetCountries = () => {
  const {
    data: countries,
    isLoading: isCountriesLoading,
    refetch: refetchCountries,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: CountryService.getCountryList,
  });

  return {
    countries,
    isCountriesLoading,
    refetchCountries,
  };
};

// Hook for fetching organization users with pagination
export const useGetOrganizationUsers = (page = 1, pageSize = 10) => {
  const {
    data: users,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
    error,
  } = useQuery({
    queryKey: ['organizationUsers', page, pageSize],
    queryFn: () => organizationService.getUsers({ page, page_size: pageSize }),
  });

  return {
    users: users?.data ?? [],
    pagination: users?.pagination,
    isUsersLoading,
    refetchUsers,
    error,
  };
};
