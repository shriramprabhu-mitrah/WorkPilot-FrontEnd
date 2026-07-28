import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/src/services/organization';
import {
  OrganizationPaylaod,
  InviteUsersPayload,
  OrganizationUpdatePaylaod,
} from '@/src/types/organization';

export const useOrganization = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: createOrg, isPending: isCreatingOrg } = useMutation({
    mutationFn: async (payload: OrganizationPaylaod) => {
      return await organizationService.createOrganization(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  const { mutateAsync: inviteOrgUsers, isPending: isInvitingUsers } = useMutation({
    mutationFn: async (payload: InviteUsersPayload) => {
      return await organizationService.inviteUsers(payload);
    },
  });

  const { mutateAsync: updateOrg, isPending: isUpdatingOrg } = useMutation({
    mutationFn: async (payload: OrganizationUpdatePaylaod) => {
      return await organizationService.updateOrganization(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
  });

  return {
    createOrg,
    isCreatingOrg,
    inviteOrgUsers,
    isInvitingUsers,
    updateOrg,
    isUpdatingOrg,
  };
};
