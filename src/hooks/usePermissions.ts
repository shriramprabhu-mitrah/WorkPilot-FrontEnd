import { useMemo } from 'react';
import { useAppSelector } from '@/src/store';
import { useGetRoles } from '@/src/modules/settings/hooks/useSettings';
import { Role, RolePermissions } from '@/src/types/settings';

export type PermissionResource = keyof RolePermissions;
export type PermissionAction = 'view' | 'add' | 'modify' | 'delete' | 'comment';

export type Permission = `${PermissionResource}.${PermissionAction}` | string;

const DEFAULT_ADMIN_PERMISSIONS: RolePermissions = {
  projects: { view: true, add: true, modify: true, delete: true },
  sprints: { view: true, add: true, modify: true, delete: true },
  user_stories: { view: true, add: true, modify: true, delete: true },
  tasks: { view: true, add: true, modify: true, delete: true },
  comments: { view: true, add: true, modify: true, delete: true, comment: true },
};

// Minimal view-only permissions used as safety net while roles API is loading
const DEFAULT_LOADING_PERMISSIONS: RolePermissions = {
  projects: { view: true, add: false, modify: false, delete: false },
  sprints: { view: true, add: false, modify: false, delete: false },
  user_stories: { view: true, add: false, modify: false, delete: false },
  tasks: { view: true, add: false, modify: false, delete: false },
  comments: { view: true, add: false, modify: false, delete: false, comment: false },
};

export const usePermissions = () => {
  const orgRole = useAppSelector((state) => state.user.role) as string | null;
  const currentUsername = useAppSelector((state) => state.user.username);
  const currentEmail = useAppSelector((state) => state.user.email);
  const projectMembers = useAppSelector((state) => state.project.selectedProject?.members);
  const projectRole = useAppSelector((state) => state.project.projectRole);
  const projectRoleId = useAppSelector((state) => state.project.projectRoleId);

  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoles();
  const roles: Role[] = rolesResponse?.data ?? [];
  // Determine the effective role for the current context (project-level role if in project, otherwise org-level role)
  const effectiveRoleString = useMemo<string | null>(() => {
    if (orgRole) {
      const normalizedOrg = orgRole.toLowerCase().replace(/[\s_-]+/g, '');
      if (
        normalizedOrg === 'orgadmin' ||
        normalizedOrg === 'superadmin' ||
        normalizedOrg === 'admin' ||
        normalizedOrg === 'organizationadmin'
      ) {
        return 'org_admin';
      }
    }

    // Prioritize the project-level role from the user-role API
    if (projectRole) {
      return projectRole;
    }

    // Fallback: look up the user's role from the project members list
    if (projectMembers && (currentUsername || currentEmail)) {
      const self = projectMembers.find(
        (m) =>
          (currentUsername && m.username === currentUsername) ||
          (currentEmail && m.email === currentEmail)
      );
      if (self?.role) return self.role;
    }

    return orgRole;
  }, [orgRole, projectRole, projectMembers, currentUsername, currentEmail]);

  // Match the effective role with dynamic backend roles list
  // Prioritizes matching by role_id (UUID) from the user-role API for reliable custom role resolution
  const currentRole = useMemo<Role | null>(() => {
    if (roles.length === 0) return null;

    // First: try exact match by projectRoleId (most reliable for custom roles)
    if (projectRoleId) {
      const matchById = roles.find((r) => r.id === projectRoleId);
      if (matchById) return matchById;
    }

    // Second: try name-based matching using effectiveRoleString
    if (!effectiveRoleString) return null;
    const normalized = effectiveRoleString.toLowerCase().replace(/[\s_-]+/g, '');

    return (
      roles.find(
        (r) =>
          r.name.toLowerCase() === effectiveRoleString.toLowerCase() ||
          r.name.toLowerCase().replace(/[\s_-]+/g, '') === normalized
      ) || null
    );
  }, [effectiveRoleString, projectRoleId, roles]);

  const isAdmin = (): boolean => {
    if (!orgRole) return false;
    return orgRole === 'org_admin';
  };

  //   const isProjectManager = (): boolean => {
  //     if (isAdmin()) return true;
  //     if (!effectiveRoleString) return false;
  //     const normalized = effectiveRoleString.toLowerCase().replace(/[\s_-]+/g, '');
  //     return normalized === 'projectmanager' || normalized === 'pm';
  //   };

  // Resolved permissions map
  // Priority: admin → API role permissions → view-only fallback (while loading)
  const userPermissions = useMemo<RolePermissions>(() => {
    if (isAdmin()) {
      return DEFAULT_ADMIN_PERMISSIONS;
    }

    if (currentRole?.permissions) {
      return currentRole.permissions;
    }

    // Safety net: view-only while roles API is still loading
    return DEFAULT_LOADING_PERMISSIONS;
  }, [currentRole, orgRole]);

  /**
   * Check permission by resource section and action name
   * e.g. can('tasks', 'add'), can('comments', 'comment'), can('projects', 'modify')
   */
  const can = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (isAdmin()) return true;

    const sectionPerms = userPermissions[resource] as Record<string, boolean> | undefined;
    return Boolean(sectionPerms?.[action]);
  };

  /**
   * Check permission by dot-notation (e.g. 'tasks.add')
   */
  const hasPermission = (permission: Permission): boolean => {
    if (isAdmin()) return true;

    // Check dot-notation format: "resource.action" (e.g. "tasks.add")
    if (permission.includes('.')) {
      const [resource, action] = permission.split('.') as [PermissionResource, PermissionAction];
      return can(resource, action);
    }

    return false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean =>
    permissions.some((p) => hasPermission(p));

  const hasAllPermissions = (permissions: Permission[]): boolean =>
    permissions.every((p) => hasPermission(p));

  const canAny = (
    checks: Array<[resource: PermissionResource, action: PermissionAction]>
  ): boolean => checks.some(([res, act]) => can(res, act));

  const canAll = (
    checks: Array<[resource: PermissionResource, action: PermissionAction]>
  ): boolean => checks.every(([res, act]) => can(res, act));

  const hasRole = (role: string | string[]): boolean => {
    if (!effectiveRoleString) return false;
    const currentNorm = effectiveRoleString.toLowerCase().replace(/[\s_-]+/g, '');

    const checkSingle = (r: string) => {
      const targetNorm = r.toLowerCase().replace(/[\s_-]+/g, '');
      return currentNorm === targetNorm || effectiveRoleString === r;
    };

    return Array.isArray(role) ? role.some(checkSingle) : checkSingle(role);
  };

  const canManageProjects = (): boolean => isAdmin() || can('projects', 'modify');

  return {
    // Role metadata
    orgRole,
    effectiveRole: effectiveRoleString,
    currentRole,
    isRolesLoading,
    userPermissions,

    // Core permission checkers
    can,
    canAny,
    canAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,

    // Role helper checks
    isOrgAdmin: isAdmin(),
    // isProjectManager,
    canManageProjects,

    // Project action shortcuts
    canViewProjects: can('projects', 'view'),
    canCreateProject: can('projects', 'add'),
    canEditProject: can('projects', 'modify'),
    canDeleteProject: can('projects', 'delete'),

    // Sprint action shortcuts
    canViewSprints: can('sprints', 'view'),
    canCreateSprint: can('sprints', 'add'),
    canEditSprint: can('sprints', 'modify'),
    canDeleteSprint: can('sprints', 'delete'),

    // User Story action shortcuts
    canViewUserStories: can('user_stories', 'view'),
    canCreateUserStory: can('user_stories', 'add'),
    canEditUserStory: can('user_stories', 'modify'),
    canDeleteUserStory: can('user_stories', 'delete'),

    // Task action shortcuts
    canViewTasks: can('tasks', 'view'),
    canCreateTask: can('tasks', 'add'),
    canEditTask: can('tasks', 'modify'),
    canDeleteTask: can('tasks', 'delete'),

    // Comments action shortcuts
    canViewComments: can('comments', 'view'),
    canAddComments: can('comments', 'add'),
    canComment: can('comments', 'comment'),
    canEditComments: can('comments', 'modify'),
    canDeleteComments: can('comments', 'delete'),
  };
};

export default usePermissions;
