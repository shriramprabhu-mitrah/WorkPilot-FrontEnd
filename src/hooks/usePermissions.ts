import { useAppSelector } from '@/src/store';
import { ROLE_TYPE } from '@/src/app/components/common/enum';

export interface PermissionConfig {
  allowedRoles: ROLE_TYPE[];
}

export const PERMISSIONS: Record<string, PermissionConfig> = {
  // Project permissions
  PROJECT_CREATE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  PROJECT_EDIT: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  PROJECT_DELETE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  PROJECT_VIEW: {
    allowedRoles: [
      ROLE_TYPE.ORG_ADMIN,
      ROLE_TYPE.PROJECT_MANAGER,
      ROLE_TYPE.DEVELOPER,
      ROLE_TYPE.VIEWER,
    ],
  },

  // Sprint permissions
  SPRINT_CREATE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  SPRINT_EDIT: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  SPRINT_DELETE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },

  // Member permissions
  MEMBER_ADD: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  MEMBER_REMOVE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },

  // Organization permissions
  ORG_SETTINGS: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN],
  },
  ORG_MEMBERS_MANAGE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN],
  },

  // Task permissions
  TASK_CREATE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER, ROLE_TYPE.DEVELOPER],
  },
  TASK_EDIT: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER, ROLE_TYPE.DEVELOPER],
  },
  TASK_DELETE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const usePermissions = () => {
  const userRole = useAppSelector((state) => state.user.role);

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;

    const permissionConfig = PERMISSIONS[permission];
    return permissionConfig.allowedRoles.includes(userRole as unknown as ROLE_TYPE);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }

    return userRole === role;
  };

  const isAdmin = (): boolean => {
    return userRole === ROLE_TYPE.ORG_ADMIN;
  };

  const isProjectManager = (): boolean => {
    return userRole === ROLE_TYPE.PROJECT_MANAGER;
  };

  const canManageProjects = (): boolean => {
    return hasRole([ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER]);
  };

  return {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isProjectManager,
    canManageProjects,
  };
};
