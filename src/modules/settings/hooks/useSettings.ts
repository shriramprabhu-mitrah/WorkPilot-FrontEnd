import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { roleService } from '@/src/services/settings';
import {
  CreateRolePayload,
  UpdateRolePayload,
} from '@/src/types/settings';

const roleKeys = {
  all: ['roles'] as const,

  list: () => ['roles', 'list'] as const,

  detail: (roleId: string) =>
    ['roles', 'detail', roleId] as const,
};

export const useGetRoles = () => {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => roleService.getRoles(),
  });
};

export const useGetRoleById = (
  roleId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => roleService.getRoleById(roleId),
    enabled: enabled && !!roleId,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) =>
      roleService.createRole(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.list(),
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRolePayload;
    }) => roleService.updateRole(roleId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.list(),
      });

      queryClient.invalidateQueries({
        queryKey: roleKeys.detail(variables.roleId),
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) =>
      roleService.deleteRole(roleId),

    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.list(),
      });

      queryClient.removeQueries({
        queryKey: roleKeys.detail(roleId),
      });
    },
  });
};