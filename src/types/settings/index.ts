export interface RolePermissionActions {
  view: boolean;
  add: boolean;
  modify: boolean;
  delete: boolean;
}

export interface RoleCommentPermissions extends RolePermissionActions {
  comment: boolean;
}

export interface RolePermissions {
  comments?: RoleCommentPermissions;
  issues?: RolePermissionActions;
  projects?: RolePermissionActions;
  sprints?: RolePermissionActions;
  tasks?: RolePermissionActions;
  user_stories?: RolePermissionActions;
}

export interface Role {
  id: string;
  organization_id?: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions: RolePermissions;
  created_at: string;
  updated_at: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: Partial<RolePermissions>;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: Partial<RolePermissions>;
}
