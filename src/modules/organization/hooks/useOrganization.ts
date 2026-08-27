import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/src/services/organization';
import { useAppDispatch } from '@/src/store';
import { updateOrganization, setOrganization } from '@/src/store/slices/organization';
import { useEffect } from 'react';
import { CountryService } from '@/src/services/common/countryservice';
import Cookies from 'js-cookie';

// Hook for fetching organization data
export const useGetOrganization = (enabled = true) => {
  const {
    data: organization,
    isLoading: isOrganizationLoading,
    refetch: refetchOrganization,
  } = useQuery({
    queryKey: ['organization'],
    queryFn: organizationService.getOrganization,
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (organization?.data) {
      dispatch(setOrganization(organization.data));

      // Store org slug in cookie for middleware access
      if (organization.data.slug) {
        Cookies.set('org_slug', organization.data.slug, {
          expires: 365, // 1 year
          path: '/',
          sameSite: 'lax',
        });
      }
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
export const useGetOrganizationUsers = (page = 1, pageSize = 10, isActive = true) => {
  const {
    data: users,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
    error,
  } = useQuery({
    queryKey: ['organizationUsers', page, pageSize, isActive],
    queryFn: () => organizationService.getUsers({ page, page_size: pageSize, is_active: isActive }),
  });

  return {
    users: users?.data ?? [],
    meta: users?.meta,
    isUsersLoading,
    refetchUsers,
    error,
  };
};
