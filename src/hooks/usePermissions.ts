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
      ROLE_TYPE.QA,
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

  // Organization permissions — org_admin only
  ORG_SETTINGS: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN],
  },
  ORG_MEMBERS_MANAGE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN],
  },

  // Task permissions
  TASK_CREATE: {
    allowedRoles: [
      ROLE_TYPE.ORG_ADMIN,
      ROLE_TYPE.PROJECT_MANAGER,
      ROLE_TYPE.DEVELOPER,
      ROLE_TYPE.QA,
    ],
  },
  TASK_EDIT: {
    allowedRoles: [
      ROLE_TYPE.ORG_ADMIN,
      ROLE_TYPE.PROJECT_MANAGER,
      ROLE_TYPE.DEVELOPER,
      ROLE_TYPE.QA,
    ],
  },
  TASK_DELETE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },

  // User Story permissions
  USER_STORY_CREATE: {
    allowedRoles: [
      ROLE_TYPE.ORG_ADMIN,
      ROLE_TYPE.PROJECT_MANAGER,
      ROLE_TYPE.DEVELOPER,
      ROLE_TYPE.QA,
    ],
  },
  USER_STORY_EDIT: {
    allowedRoles: [
      ROLE_TYPE.ORG_ADMIN,
      ROLE_TYPE.PROJECT_MANAGER,
      ROLE_TYPE.DEVELOPER,
      ROLE_TYPE.QA,
    ],
  },
  USER_STORY_DELETE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },

  // Team permissions
  TEAMS_EDIT: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER],
  },
  TEAMS_DELETE: {
    allowedRoles: [ROLE_TYPE.ORG_ADMIN],
  },
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const usePermissions = () => {
  const orgRole = useAppSelector((state) => state.user.role) as ROLE_TYPE | null;
  const currentUsername = useAppSelector((state) => state.user.username);
  const projectMembers = useAppSelector((state) => state.project.selectedProject?.members);

  const effectiveRole: ROLE_TYPE | null = (() => {
    if (orgRole === ROLE_TYPE.ORG_ADMIN) return ROLE_TYPE.ORG_ADMIN;

    if (projectMembers && currentUsername) {
      const self = projectMembers.find((m) => m.username === currentUsername);
      if (self?.role) return self.role as ROLE_TYPE;
    }

    return orgRole;
  })();

  const hasPermission = (permission: Permission): boolean => {
    if (!effectiveRole) return false;
    return PERMISSIONS[permission].allowedRoles.includes(effectiveRole);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some((p) => hasPermission(p));

  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every((p) => hasPermission(p));

  const hasRole = (role: ROLE_TYPE | ROLE_TYPE[]): boolean => {
    if (!effectiveRole) return false;
    return Array.isArray(role) ? role.includes(effectiveRole) : effectiveRole === role;
  };

  const isAdmin = (): boolean => orgRole === ROLE_TYPE.ORG_ADMIN;

  const isProjectManager = (): boolean =>
    effectiveRole === ROLE_TYPE.PROJECT_MANAGER || orgRole === ROLE_TYPE.ORG_ADMIN;

  const canManageProjects = (): boolean =>
    hasRole([ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.PROJECT_MANAGER]);

  return {
    orgRole,
    effectiveRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isProjectManager,
    canManageProjects,
  };
};
