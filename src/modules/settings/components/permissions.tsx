'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { WpInput } from '@/src/app/components/common/input';

interface Role {
  id: number;
  name: string;
}

interface PermissionSection {
  id: number;
  name: string;
  allowed: number;
  total: number;
  permissions: string[];
}

interface RoleListProps {
  roles: Role[];
  selectedRole: Role;
  isAddingRole: boolean;
  newRoleName: string;
  roleError: string;
  newRoleRef: React.RefObject<HTMLDivElement | null>;
  setSelectedRole: React.Dispatch<React.SetStateAction<Role>>;
  setExpandedSection: React.Dispatch<React.SetStateAction<number | null>>;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddingRole: React.Dispatch<React.SetStateAction<boolean>>;
  setNewRoleName: React.Dispatch<React.SetStateAction<string>>;
  setRoleError: React.Dispatch<React.SetStateAction<string>>;
  handleAddRole: () => void;
}

const INITIAL_ROLES: Role[] = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Organization Admin' },
  { id: 3, name: 'Project Manager' },
  { id: 4, name: 'Developer' },
  { id: 5, name: 'QA' },
  { id: 6, name: 'Stakeholder' },
];

const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    id: 2,
    name: 'Sprints',
    allowed: 4,
    total: 4,
    permissions: ['View sprints', 'Add sprints', 'Modify sprints', 'Delete sprints'],
  },
  {
    id: 3,
    name: 'User Stories',
    allowed: 5,
    total: 5,
    permissions: [
      'View user stories',
      'Add user stories',
      'Modify user stories',
      'Comment user stories',
      'Delete user stories',
    ],
  },
  {
    id: 4,
    name: 'Tasks',
    allowed: 5,
    total: 5,
    permissions: ['View tasks', 'Add tasks', 'Modify tasks', 'Comment tasks', 'Delete tasks'],
  },
  {
    id: 5,
    name: 'Issues',
    allowed: 5,
    total: 5,
    permissions: ['View issues', 'Add issues', 'Modify issues', 'Comment issues', 'Delete issues'],
  },
];

const RoleList = ({
  roles,
  selectedRole,
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
      <div className="flex-1 overflow-y-auto">
        {roles.map((role) => {
          const isSelected = selectedRole.id === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setExpandedSection(null);
                setSidebarOpen(false);
              }}
              className={`group relative flex h-[52px] w-full items-center border-b border-slate-200 px-5 text-left text-[14px] transition-all dark:border-slate-700 ${
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

              <span
                className={`mr-3 h-[7px] w-[7px] shrink-0 rounded-full ${
                  isSelected
                    ? 'bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                    : 'bg-transparent group-hover:bg-slate-400'
                }`}
              />

              {role.name}
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
        )}
      </div>
    </div>
  );
};

const Permissions = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(INITIAL_ROLES[2]);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({});
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleError, setRoleError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const newRoleRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (sectionId: number) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const handlePermissionToggle = (permission: string) => {
    setPermissionStates((prev) => ({
      ...prev,
      [permission]: !(prev[permission] ?? true),
    }));
  };

  const handleAddRole = () => {
    const trimmed = newRoleName.trim();

    if (!trimmed) {
      setRoleError('Role name is required');
      return;
    }

    if (roles.some((role) => role.name.toLowerCase() === trimmed.toLowerCase())) {
      setRoleError('This role already exists');
      return;
    }

    const newRole: Role = {
      id: Math.max(0, ...roles.map((role) => role.id)) + 1,
      name: trimmed,
    };

    setRoles((prev) => [...prev, newRole]);
    setSelectedRole(newRole);
    setExpandedSection(null);
    setNewRoleName('');
    setRoleError('');
    setIsAddingRole(false);
  };

  const handleDeleteRole = () => {
    if (roles.length <= 1) {
      return;
    }

    const remaining = roles.filter((role) => role.id !== selectedRole.id);

    setRoles(remaining);
    setSelectedRole(remaining[0]);
    setExpandedSection(null);
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
  };

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

          {selectedRole.name}
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

          <button
            type="button"
            onClick={handleDeleteRole}
            disabled={roles.length <= 1}
            className="flex h-8 items-center gap-2 rounded-lg bg-red-500 px-4 text-[11px] font-bold tracking-wide text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={13} />
            DELETE
          </button>
        </div>

        <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          </div>

          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {selectedRole.name}
          </h1>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {PERMISSION_SECTIONS.map((section, idx) => {
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className={
                  idx !== PERMISSION_SECTIONS.length - 1
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
                    {section.allowed}/{section.total}
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
                    {section.permissions.map((permission, i) => {
                      const isEnabled = permissionStates[permission] ?? true;

                      return (
                        <div
                          key={permission}
                          className={`flex min-h-[43px] items-center px-4 sm:px-8 ${
                            i !== section.permissions.length - 1
                              ? 'border-b border-slate-100 dark:border-slate-700/50'
                              : ''
                          }`}
                        >
                          <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300">
                            {permission}
                          </span>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            onClick={() => handlePermissionToggle(permission)}
                            className={`relative ml-auto h-5 w-9 shrink-0 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                              isEnabled
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
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
      </main>
    </div>
  );
};

export default Permissions;
