'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, CornerDownLeft, Plus, Trash2 } from 'lucide-react';
import { WpInput } from '@/src/app/components/common/input';
import { useGetRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../hooks/useSettings';
import { Role, RolePermissions } from '@/src/types/settings';
import PermissionsSkeleton from './permissionsSkeleton';

interface PermissionAction {
  key: string;
  label: string;
}

interface PermissionSection {
  id: string;
  sectionKey: keyof RolePermissions;
  name: string;
  permissions: PermissionAction[];
}

interface RoleListProps {
  roles: Role[];
  selectedRole: Role | null;
  hasChanges: boolean;
  isAddingRole: boolean;
  newRoleName: string;
  roleError: string;
  newRoleRef: React.RefObject<HTMLDivElement | null>;
  setSelectedRole: (role: Role) => void;
  setExpandedSection: React.Dispatch<React.SetStateAction<string | null>>;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddingRole: React.Dispatch<React.SetStateAction<boolean>>;
  setNewRoleName: React.Dispatch<React.SetStateAction<string>>;
  setRoleError: React.Dispatch<React.SetStateAction<string>>;
  handleAddRole: () => void;
}

const formatSectionName = (key: string): string => {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatActionLabel = (action: string, sectionName: string): string => {
  const lowerSection = sectionName.toLowerCase();
  switch (action) {
    case 'view':
      return `View ${lowerSection}`;
    case 'add':
      return `Add ${lowerSection}`;
    case 'modify':
      return `Modify ${lowerSection}`;
    case 'delete':
      return `Delete ${lowerSection}`;
    case 'comment':
      return `Comment on ${lowerSection}`;
    default:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} ${lowerSection}`;
  }
};

const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  projects: { view: true, add: false, modify: false, delete: false },
  sprints: { view: true, add: false, modify: false, delete: false },
  user_stories: { view: true, add: false, modify: false, delete: false },
  tasks: { view: true, add: false, modify: false, delete: false },
  comments: { view: true, add: false, modify: false, delete: false, comment: false },
};

const RoleList = ({
  roles,
  selectedRole,
  hasChanges,
  isAddingRole,
  newRoleName,
  roleError,
  newRoleRef,
  setSelectedRole,
  setExpandedSection,
  setSidebarOpen,
  setIsAddingRole,
  setNewRoleName,
  setRoleError,
  handleAddRole,
}: RoleListProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className=" overflow-y-auto">
        {roles.map((role) => {
          const isSelected = selectedRole?.id === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setExpandedSection(null);
                setSidebarOpen(false);
              }}
              className={`group relative flex h-[50px] w-full items-center justify-between border-b border-slate-200 px-5 text-left text-[14px] transition-all dark:border-slate-700 ${
                isSelected
                  ? 'bg-white font-semibold text-blue-600 dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
              }`}
            >
              <span
                className={`absolute left-0 top-0 h-full w-[3px] rounded-r-full ${
                  isSelected ? 'bg-blue-600' : 'bg-transparent'
                }`}
              />

              <div className="flex min-w-0 items-center truncate">
                <span
                  className={`mr-3 h-[7px] w-[7px] shrink-0 rounded-full ${
                    isSelected
                      ? 'bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      : 'bg-transparent group-hover:bg-slate-400'
                  }`}
                />
                <span className="truncate">{role.name}</span>
              </div>

              {isSelected && hasChanges && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                  title="Unsaved changes"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {!isAddingRole ? (
          <button
            type="button"
            onClick={() => {
              setIsAddingRole(true);
              setNewRoleName('');
              setRoleError('');
            }}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-[12px] font-bold tracking-wide text-white shadow transition hover:-translate-y-px hover:bg-blue-700"
          >
            <Plus size={15} strokeWidth={2.5} />
            NEW ROLE
          </button>
        ) : (
          <div
            ref={newRoleRef}
            className="rounded-lg border border-blue-200 bg-white p-2 shadow dark:border-blue-700 dark:bg-slate-800"
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <WpInput
                  type="text"
                  autoFocus
                  value={newRoleName}
                  placeholder="Role name"
                  error={roleError}
                  onChange={(e) => {
                    setNewRoleName(e.target.value);

                    if (roleError) {
                      setRoleError('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRole();
                    }

                    if (e.key === 'Escape') {
                      setIsAddingRole(false);
                      setNewRoleName('');
                      setRoleError('');
                    }
                  }}
                  className="h-[34px] rounded-md px-3 py-0 text-[13px]"
                  wrapperClassName="mb-0"
                />
              </div>

              <button
                type="button"
                onClick={handleAddRole}
                className="mt-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Create role"
              >
                <CornerDownLeft size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Permissions = () => {
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoles();
  const { mutateAsync: createRole, isPending: isCreatingRole } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateRole();
  const { mutateAsync: deleteRole, isPending: isDeletingRole } = useDeleteRole();

  const roles = rolesResponse?.data ?? [];

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [localPermissions, setLocalPermissions] = useState<RolePermissions>({});
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleError, setRoleError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const newRoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roles.length > 0) {
      if (!selectedRoleId || !roles.some((r) => r.id === selectedRoleId)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedRoleId(roles[0].id);
      }
    } else {
      setSelectedRoleId(null);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0] || null;

  useEffect(() => {
    if (selectedRole) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPermissions(selectedRole.permissions || {});
    } else {
      setLocalPermissions({});
    }
  }, [selectedRole?.id, selectedRole?.permissions]);

  const permissionSections: PermissionSection[] = useMemo(() => {
    const perms = selectedRole?.permissions || DEFAULT_ROLE_PERMISSIONS;
    const sectionKeys = Object.keys(perms) as Array<keyof RolePermissions>;

    const SECTION_ORDER: Array<keyof RolePermissions> = [
      'projects',
      'sprints',
      'user_stories',
      'tasks',
      'comments',
      'issues',
    ];

    const sortedKeys = [...sectionKeys].sort((a, b) => {
      const idxA = SECTION_ORDER.indexOf(a);
      const idxB = SECTION_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const ACTION_ORDER = ['view', 'add', 'modify', 'delete', 'comment'];

    return sortedKeys.map((secKey) => {
      const sectionName = formatSectionName(secKey);
      const sectionObj = (perms[secKey] || {}) as Record<string, boolean>;
      const actionKeys = Object.keys(sectionObj);

      const sortedActions = [...actionKeys].sort((a, b) => {
        const idxA = ACTION_ORDER.indexOf(a);
        const idxB = ACTION_ORDER.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });

      const permissions: PermissionAction[] = sortedActions.map((actKey) => ({
        key: actKey,
        label: formatActionLabel(actKey, sectionName),
      }));

      return {
        id: secKey,
        sectionKey: secKey,
        name: sectionName,
        permissions,
      };
    });
  }, [selectedRole?.permissions]);

  const hasChanges = useMemo(() => {
    if (!selectedRole) return false;
    return JSON.stringify(localPermissions) !== JSON.stringify(selectedRole.permissions || {});
  }, [localPermissions, selectedRole]);

  const handleSectionClick = (sectionId: string) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const isPermissionEnabled = (section: PermissionSection, action: PermissionAction): boolean => {
    if (action.key === 'view') {
      return true;
    }
    const sectionPerms = localPermissions[section.sectionKey] as
      Record<string, boolean> | undefined;
    return sectionPerms?.[action.key] ?? false;
  };

  const handlePermissionToggle = (section: PermissionSection, action: PermissionAction) => {
    if (!selectedRole) return;

    const currentVal = isPermissionEnabled(section, action);
    const newVal = !currentVal;

    setLocalPermissions((prev) => {
      const sectionKey = section.sectionKey;
      const currentSectionPerms = (prev[sectionKey] || {}) as unknown as Record<string, boolean>;

      return {
        ...prev,
        [sectionKey]: {
          ...currentSectionPerms,
          [action.key]: newVal,
        },
      };
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      await updateRole({
        roleId: selectedRole.id,
        payload: {
          permissions: localPermissions,
        },
      });
    } catch {}
  };

  const handleAddRole = async () => {
    const trimmed = newRoleName.trim();

    if (!trimmed) {
      setRoleError('Role name is required');
      return;
    }

    if (roles.some((role) => role.name.toLowerCase() === trimmed.toLowerCase())) {
      setRoleError('This role already exists');
      return;
    }

    try {
      const res = await createRole({
        name: trimmed,
        description: '',
        permissions: DEFAULT_ROLE_PERMISSIONS,
      });

      if (res?.data?.id) {
        setSelectedRoleId(res.data.id);
      }
      setExpandedSection(null);
      setNewRoleName('');
      setRoleError('');
      setIsAddingRole(false);
    } catch {}
  };

  const handleDeleteRole = async () => {
    if (!selectedRole || roles.length <= 1) {
      return;
    }

    try {
      await deleteRole(selectedRole.id);
      const remaining = roles.filter((role) => role.id !== selectedRole.id);
      if (remaining.length > 0) {
        setSelectedRoleId(remaining[0].id);
      }
      setExpandedSection(null);
    } catch {}
  };

  useEffect(() => {
    if (!isAddingRole) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (newRoleRef.current && !newRoleRef.current.contains(e.target as Node)) {
        setIsAddingRole(false);
        setNewRoleName('');
        setRoleError('');
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, [isAddingRole]);

  const roleListProps: RoleListProps = {
    roles,
    selectedRole,
    hasChanges: Boolean(hasChanges),
    isAddingRole,
    newRoleName,
    roleError,
    newRoleRef,
    setSelectedRole: (role: Role) => {
      setSelectedRoleId(role.id);
    },
    setExpandedSection,
    setSidebarOpen,
    setIsAddingRole,
    setNewRoleName,
    setRoleError,
    handleAddRole,
  };

  if (isRolesLoading) {
    return <PermissionsSkeleton />;
  }

  if (!selectedRole && roles.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
        <aside className="w-[240px] shrink-0 border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 flex flex-col">
          <RoleList {...roleListProps} />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
          <div className="flex h-[65px] items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Permissions
            </h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-160px)] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
      <div className="fixed bottom-6 left-6 z-30 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${sidebarOpen ? 'rotate-180' : ''}`}
          />

          {selectedRole?.name || 'Select Role'}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />

          <div
            className="absolute bottom-0 left-0 top-0 z-30 w-64 border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <RoleList {...roleListProps} />
          </div>
        </div>
      )}

      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 lg:flex">
        <RoleList {...roleListProps} />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        <div className="flex h-[65px] items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            Permissions
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={!hasChanges || isUpdatingRole}
              className="flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-4 text-[11px] font-bold tracking-wide text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isUpdatingRole ? 'SAVING...' : 'SAVE'}
            </button>

            <button
              type="button"
              onClick={handleDeleteRole}
              disabled={roles.length <= 1 || selectedRole?.is_system || isDeletingRole}
              className="flex h-8 items-center gap-2 rounded-lg bg-red-500 px-4 text-[11px] font-bold tracking-wide text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={13} />
              {isDeletingRole ? 'DELETING...' : 'DELETE'}
            </button>
          </div>
        </div>

        {selectedRole && (
          <>
            <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                </div>

                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {selectedRole.name}
                </h1>
              </div>

              {hasChanges && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              {permissionSections.map((section, idx) => {
                const isExpanded = expandedSection === section.id;
                const allowedCount = section.permissions.filter((p) =>
                  isPermissionEnabled(section, p)
                ).length;
                const totalCount = section.permissions.length;

                return (
                  <div
                    key={section.id}
                    className={
                      idx !== permissionSections.length - 1
                        ? 'border-b border-slate-200 dark:border-slate-700'
                        : ''
                    }
                  >
                    <button
                      type="button"
                      onClick={() => handleSectionClick(section.id)}
                      className={`group flex min-h-[56px] w-full items-center px-4 text-left transition-all ${
                        isExpanded
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span
                        className={`mr-3 h-6 w-[3px] rounded-full ${
                          isExpanded
                            ? 'bg-blue-600'
                            : 'bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                        }`}
                      />

                      <span
                        className={`text-[15px] font-semibold ${
                          isExpanded
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {section.name}
                      </span>

                      <span
                        className={`ml-3 inline-flex min-w-[42px] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isExpanded
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {allowedCount}/{totalCount}
                      </span>

                      <span
                        className={`ml-auto flex h-7 w-7 items-center justify-center rounded-lg ${
                          isExpanded
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        <ChevronDown
                          size={16}
                          strokeWidth={2.3}
                          className={`transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50 px-4 py-1 dark:border-slate-700 dark:bg-slate-900/50">
                        {section.permissions.map((action, i) => {
                          const isEnabled = isPermissionEnabled(section, action);

                          return (
                            <div
                              key={action.key}
                              className={`flex min-h-[43px] items-center px-4 sm:px-8 ${
                                i !== section.permissions.length - 1
                                  ? 'border-b border-slate-100 dark:border-slate-700/50'
                                  : ''
                              }`}
                            >
                              <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                                {action.label}
                              </span>

                              <button
                                type="button"
                                role="switch"
                                aria-checked={isEnabled}
                                disabled={action.key === 'view'}
                                onClick={() => handlePermissionToggle(section, action)}
                                className={`relative ml-auto h-5 w-9 shrink-0 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                  isEnabled
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
                                } ${
                                  action.key === 'view'
                                    ? 'cursor-not-allowed opacity-70'
                                    : 'cursor-pointer'
                                }`}
                              >
                                <span
                                  className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all duration-200 ${
                                    isEnabled ? 'left-[18px]' : 'left-[2px]'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Permissions;
