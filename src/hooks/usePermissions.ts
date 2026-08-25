import { useMemo } from 'react';
import { useAppSelector } from '@/src/store';
import { ROLE_TYPE } from '@/src/app/components/common/enum';
import { useGetRoles } from '@/src/modules/settings/hooks/useSettings';
import {
  Role,
  RolePermissions,
  RolePermissionActions,
  RoleCommentPermissions,
} from '@/src/types/settings';

export type PermissionResource = keyof RolePermissions;
export type PermissionAction = 'view' | 'add' | 'modify' | 'delete' | 'comment';

export type LegacyPermission =
  | 'PROJECT_CREATE'
  | 'PROJECT_EDIT'
  | 'PROJECT_DELETE'
  | 'PROJECT_VIEW'
  | 'SPRINT_CREATE'
  | 'SPRINT_EDIT'
  | 'SPRINT_DELETE'
  | 'SPRINT_VIEW'
  | 'USER_STORY_CREATE'
  | 'USER_STORY_EDIT'
  | 'USER_STORY_DELETE'
  | 'USER_STORY_VIEW'
  | 'TASK_CREATE'
  | 'TASK_EDIT'
  | 'TASK_DELETE'
  | 'TASK_VIEW'
  | 'COMMENT_CREATE'
  | 'COMMENT_ADD'
  | 'COMMENT_EDIT'
  | 'COMMENT_DELETE'
  | 'COMMENT_VIEW'
  | 'MEMBER_ADD'
  | 'MEMBER_REMOVE'
  | 'ORG_SETTINGS'
  | 'ORG_MEMBERS_MANAGE'
  | 'TEAMS_EDIT'
  | 'TEAMS_DELETE';

export type Permission = LegacyPermission | `${PermissionResource}.${PermissionAction}` | string;

const LEGACY_PERMISSION_MAP: Record<
  string,
  { section: PermissionResource; action: PermissionAction } | 'ADMIN_ONLY' | 'MEMBER_MANAGE'
> = {
  PROJECT_CREATE: { section: 'projects', action: 'add' },
  PROJECT_EDIT: { section: 'projects', action: 'modify' },
  PROJECT_DELETE: { section: 'projects', action: 'delete' },
  PROJECT_VIEW: { section: 'projects', action: 'view' },

  SPRINT_CREATE: { section: 'sprints', action: 'add' },
  SPRINT_EDIT: { section: 'sprints', action: 'modify' },
  SPRINT_DELETE: { section: 'sprints', action: 'delete' },
  SPRINT_VIEW: { section: 'sprints', action: 'view' },

  USER_STORY_CREATE: { section: 'user_stories', action: 'add' },
  USER_STORY_EDIT: { section: 'user_stories', action: 'modify' },
  USER_STORY_DELETE: { section: 'user_stories', action: 'delete' },
  USER_STORY_VIEW: { section: 'user_stories', action: 'view' },

  TASK_CREATE: { section: 'tasks', action: 'add' },
  TASK_EDIT: { section: 'tasks', action: 'modify' },
  TASK_DELETE: { section: 'tasks', action: 'delete' },
  TASK_VIEW: { section: 'tasks', action: 'view' },

  COMMENT_CREATE: { section: 'comments', action: 'comment' },
  COMMENT_ADD: { section: 'comments', action: 'add' },
  COMMENT_EDIT: { section: 'comments', action: 'modify' },
  COMMENT_DELETE: { section: 'comments', action: 'delete' },
  COMMENT_VIEW: { section: 'comments', action: 'view' },

  MEMBER_ADD: 'MEMBER_MANAGE',
  MEMBER_REMOVE: 'MEMBER_MANAGE',

  ORG_SETTINGS: 'ADMIN_ONLY',
  ORG_MEMBERS_MANAGE: 'ADMIN_ONLY',
  TEAMS_EDIT: 'ADMIN_ONLY',
  TEAMS_DELETE: 'ADMIN_ONLY',
};

const DEFAULT_ADMIN_PERMISSIONS: RolePermissions = {
  projects: { view: true, add: true, modify: true, delete: true },
  sprints: { view: true, add: true, modify: true, delete: true },
  user_stories: { view: true, add: true, modify: true, delete: true },
  tasks: { view: true, add: true, modify: true, delete: true },
  comments: { view: true, add: true, modify: true, delete: true, comment: true },
};

const FALLBACK_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  [ROLE_TYPE.ORG_ADMIN]: DEFAULT_ADMIN_PERMISSIONS,
  [ROLE_TYPE.PROJECT_MANAGER]: {
    projects: { view: true, add: true, modify: true, delete: false },
    sprints: { view: true, add: true, modify: true, delete: true },
    user_stories: { view: true, add: true, modify: true, delete: true },
    tasks: { view: true, add: true, modify: true, delete: true },
    comments: { view: true, add: true, modify: true, delete: true, comment: true },
  },
  [ROLE_TYPE.DEVELOPER]: {
    projects: { view: true, add: false, modify: false, delete: false },
    sprints: { view: true, add: false, modify: false, delete: false },
    user_stories: { view: true, add: true, modify: true, delete: false },
    tasks: { view: true, add: true, modify: true, delete: false },
    comments: { view: true, add: true, modify: false, delete: false, comment: true },
  },
  [ROLE_TYPE.QA]: {
    projects: { view: true, add: false, modify: false, delete: false },
    sprints: { view: true, add: false, modify: false, delete: false },
    user_stories: { view: true, add: true, modify: true, delete: false },
    tasks: { view: true, add: true, modify: true, delete: false },
    comments: { view: true, add: true, modify: false, delete: false, comment: true },
  },
  [ROLE_TYPE.VIEWER]: {
    projects: { view: true, add: false, modify: false, delete: false },
    sprints: { view: true, add: false, modify: false, delete: false },
    user_stories: { view: true, add: false, modify: false, delete: false },
    tasks: { view: true, add: false, modify: false, delete: false },
    comments: { view: true, add: false, modify: false, delete: false, comment: true },
  },
  [ROLE_TYPE.MEMBER]: {
    projects: { view: true, add: false, modify: false, delete: false },
    sprints: { view: true, add: false, modify: false, delete: false },
    user_stories: { view: true, add: true, modify: true, delete: false },
    tasks: { view: true, add: true, modify: true, delete: false },
    comments: { view: true, add: true, modify: false, delete: false, comment: true },
  },
};

export const usePermissions = () => {
  const orgRole = useAppSelector((state) => state.user.role) as string | null;
  const currentUsername = useAppSelector((state) => state.user.username);
  const currentEmail = useAppSelector((state) => state.user.email);
  const projectMembers = useAppSelector((state) => state.project.selectedProject?.members);

  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoles();
  const roles: Role[] = rolesResponse?.data ?? [];
  // Determine the effective role for the current context (project-level role if in project, otherwise org-level role)
  const effectiveRoleString = useMemo<string | null>(() => {
    if (orgRole === ROLE_TYPE.ORG_ADMIN || orgRole?.toLowerCase() === 'super admin') {
      return ROLE_TYPE.ORG_ADMIN;
    }

    if (projectMembers && (currentUsername || currentEmail)) {
      const self = projectMembers.find(
        (m) =>
          (currentUsername && m.username === currentUsername) ||
          (currentEmail && m.email === currentEmail)
      );
      if (self?.role) return self.role;
    }

    return orgRole;
  }, [orgRole, projectMembers, currentUsername, currentEmail]);

  // Match the effective role with dynamic backend roles list
  const currentRole = useMemo<Role | null>(() => {
    if (!effectiveRoleString || roles.length === 0) return null;

    const normalized = effectiveRoleString.toLowerCase().replace(/[\s_-]+/g, '');

    return (
      roles.find(
        (r) =>
          r.id === effectiveRoleString ||
          r.name.toLowerCase() === effectiveRoleString.toLowerCase() ||
          r.name.toLowerCase().replace(/[\s_-]+/g, '') === normalized
      ) || null
    );
  }, [effectiveRoleString, roles]);

  const isAdmin = (): boolean => {
    if (!orgRole) return false;
    const roleLower = orgRole.toLowerCase();
    return (
      roleLower === ROLE_TYPE.ORG_ADMIN ||
      roleLower === 'admin' ||
      roleLower === 'super admin' ||
      roleLower === 'organization admin'
    );
  };

  const isProjectManager = (): boolean => {
    if (isAdmin()) return true;
    if (!effectiveRoleString) return false;
    const roleLower = effectiveRoleString.toLowerCase();
    return (
      roleLower === ROLE_TYPE.PROJECT_MANAGER ||
      roleLower === 'project manager' ||
      roleLower === 'project_manager' ||
      roleLower === 'pm'
    );
  };

  // Resolved permissions map
  const userPermissions = useMemo<RolePermissions>(() => {
    if (isAdmin()) {
      return DEFAULT_ADMIN_PERMISSIONS;
    }

    if (currentRole?.permissions) {
      return currentRole.permissions;
    }

    if (effectiveRoleString && FALLBACK_ROLE_PERMISSIONS[effectiveRoleString]) {
      return FALLBACK_ROLE_PERMISSIONS[effectiveRoleString];
    }

    return (
      FALLBACK_ROLE_PERMISSIONS[ROLE_TYPE.MEMBER] || {
        projects: { view: true, add: false, modify: false, delete: false },
        sprints: { view: true, add: false, modify: false, delete: false },
        user_stories: { view: true, add: false, modify: false, delete: false },
        tasks: { view: true, add: false, modify: false, delete: false },
        comments: { view: true, add: false, modify: false, delete: false, comment: false },
      }
    );
  }, [currentRole, effectiveRoleString, orgRole]);

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
   * Check permission by legacy key (e.g. 'TASK_CREATE') or dot-notation (e.g. 'tasks.add')
   */
  const hasPermission = (permission: Permission): boolean => {
    if (isAdmin()) return true;

    // Check dot-notation format: "resource.action" (e.g. "tasks.add")
    if (permission.includes('.')) {
      const [resource, action] = permission.split('.') as [PermissionResource, PermissionAction];
      return can(resource, action);
    }

    // Check mapped legacy keys
    const mapping = LEGACY_PERMISSION_MAP[permission];
    if (mapping) {
      if (mapping === 'ADMIN_ONLY') {
        return isAdmin();
      }
      if (mapping === 'MEMBER_MANAGE') {
        return isAdmin() || isProjectManager() || can('projects', 'modify');
      }
      return can(mapping.section, mapping.action);
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

  const hasRole = (role: ROLE_TYPE | string | Array<ROLE_TYPE | string>): boolean => {
    if (!effectiveRoleString) return false;
    const currentNorm = effectiveRoleString.toLowerCase().replace(/[\s_-]+/g, '');

    const checkSingle = (r: string) => {
      const targetNorm = r.toLowerCase().replace(/[\s_-]+/g, '');
      return currentNorm === targetNorm || effectiveRoleString === r;
    };

    return Array.isArray(role) ? role.some(checkSingle) : checkSingle(role);
  };

  const canManageProjects = (): boolean =>
    isAdmin() || isProjectManager() || can('projects', 'modify');

  return {
    // Role metadata
    orgRole,
    effectiveRole: effectiveRoleString as ROLE_TYPE | string | null,
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
    isAdmin,
    isProjectManager,
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
