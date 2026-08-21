'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';

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

const Permissions = () => {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(INITIAL_ROLES[2]);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({});
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleError, setRoleError] = useState('');

  const newRoleRef = useRef<HTMLDivElement>(null);

  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: String(role.id),
  }));

  const handleSectionClick = (sectionId: number) => {
    setExpandedSection((previous) => (previous === sectionId ? null : sectionId));
  };

  const handlePermissionToggle = (permission: string) => {
    setPermissionStates((previous) => ({
      ...previous,
      [permission]: !(previous[permission] ?? true),
    }));
  };

  const handleNewRoleClick = () => {
    setIsAddingRole(true);
    setNewRoleName('');
    setRoleError('');
  };

  const handleCancelNewRole = () => {
    setIsAddingRole(false);
    setNewRoleName('');
    setRoleError('');
  };

  const handleAddRole = () => {
    const trimmedName = newRoleName.trim();

    if (!trimmedName) {
      setRoleError('Role name is required');
      return;
    }

    const roleExists = roles.some((role) => role.name.toLowerCase() === trimmedName.toLowerCase());

    if (roleExists) {
      setRoleError('This role already exists');
      return;
    }

    const newRole: Role = {
      id: Math.max(0, ...roles.map((role) => role.id)) + 1,
      name: trimmedName,
    };

    setRoles((previous) => [...previous, newRole]);
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

    const remainingRoles = roles.filter((role) => role.id !== selectedRole.id);

    setRoles(remainingRoles);
    setSelectedRole(remainingRoles[0]);
    setExpandedSection(null);
  };

  const handleRoleDropdownChange = (value: string) => {
    const role = roles.find((item) => String(item.id) === value);

    if (!role) {
      return;
    }

    setSelectedRole(role);
    setExpandedSection(null);
  };

  useEffect(() => {
    if (!isAddingRole) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (newRoleRef.current && !newRoleRef.current.contains(event.target as Node)) {
        handleCancelNewRole();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAddingRole]);

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full overflow-hidden bg-[#f8fafc]">
      <aside className="w-[254px] shrink-0 border-r border-[#dbe3ef] bg-[#eef3f9]">
        <div className="pt-1">
          {roles.map((role) => {
            const isSelected = selectedRole.id === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role);
                  setExpandedSection(null);
                }}
                className={`group relative flex h-[53px] w-full items-center border-b border-[#dbe3ef] px-[21px] text-left text-[14px] transition-all duration-200 ${
                  isSelected
                    ? 'bg-white font-semibold text-[#2563eb]'
                    : 'text-[#334155] hover:bg-[#f8fafc]'
                }`}
              >
                <span
                  className={`absolute left-0 top-0 h-full w-[3px] rounded-r-full ${
                    isSelected ? 'bg-[#2563eb]' : 'bg-transparent'
                  }`}
                />

                <span
                  className={`mr-3 h-[7px] w-[7px] shrink-0 rounded-full ${
                    isSelected
                      ? 'bg-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      : 'bg-transparent group-hover:bg-[#94a3b8]'
                  }`}
                />

                {role.name}
              </button>
            );
          })}
        </div>

        <div className="px-[21px]">
          {!isAddingRole ? (
            <button
              type="button"
              onClick={handleNewRoleClick}
              className="mt-[72px] flex h-[36px] w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] text-[12px] font-bold tracking-wide text-white shadow-[0_3px_10px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#1d4ed8] hover:shadow-[0_5px_14px_rgba(37,99,235,0.25)]"
            >
              <Plus size={15} strokeWidth={2.5} />
              NEW ROLE
            </button>
          ) : (
            <div
              ref={newRoleRef}
              className="mt-[72px] rounded-lg border border-[#bfdbfe] bg-white p-2 shadow-[0_4px_14px_rgba(37,99,235,0.12)]"
            >
              <WpInput
                type="text"
                autoFocus
                value={newRoleName}
                placeholder="Role name"
                error={roleError}
                onChange={(event) => {
                  setNewRoleName(event.target.value);

                  if (roleError) {
                    setRoleError('');
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddRole();
                  }

                  if (event.key === 'Escape') {
                    handleCancelNewRole();
                  }
                }}
                className="h-[34px] rounded-md px-3 py-0 text-[13px]"
                wrapperClassName="mb-0"
              />
            </div>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-[18px] pb-10">
        <div className="flex h-[65px] items-center justify-between">
          <h2 className="text-[21px] font-bold tracking-tight text-[#2563eb]">Permissions</h2>

          <button
            type="button"
            onClick={handleDeleteRole}
            disabled={roles.length <= 1}
            className="flex h-[32px] items-center gap-2 rounded-lg bg-[#ef4761] px-[15px] text-[11px] font-bold tracking-wide text-white shadow-[0_2px_7px_rgba(239,71,97,0.18)] transition-all duration-200 hover:bg-[#dc3652] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={13} />
            DELETE
          </button>
        </div>

        <div className="flex min-h-[56px] items-center justify-between gap-4 rounded-xl border border-[#dbe3ef] bg-white px-[18px] shadow-[0_2px_8px_rgba(30,60,90,0.05)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            </div>

            <h1 className="text-[20px] font-semibold tracking-tight text-[#24344d]">
              {selectedRole.name}
            </h1>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#dbe3ef] bg-white shadow-[0_3px_12px_rgba(30,60,90,0.06)]">
          {PERMISSION_SECTIONS.map((section, sectionIndex) => {
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className={
                  sectionIndex !== PERMISSION_SECTIONS.length - 1 ? 'border-b border-[#dbe3ef]' : ''
                }
              >
                <button
                  type="button"
                  onClick={() => handleSectionClick(section.id)}
                  className={`group flex min-h-[58px] w-full items-center px-[18px] text-left transition-all duration-200 ${
                    isExpanded ? 'bg-[#eff6ff]' : 'bg-white hover:bg-[#f8fafc]'
                  }`}
                >
                  <span
                    className={`mr-3 h-6 w-[3px] rounded-full ${
                      isExpanded ? 'bg-[#2563eb]' : 'bg-transparent group-hover:bg-[#cbd5e1]'
                    }`}
                  />

                  <span
                    className={`text-[15px] font-semibold ${
                      isExpanded ? 'text-[#2563eb]' : 'text-[#26364d]'
                    }`}
                  >
                    {section.name}
                  </span>

                  <span
                    className={`ml-3 inline-flex min-w-[42px] items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isExpanded ? 'bg-[#dbeafe] text-[#2563eb]' : 'bg-[#edf2f7] text-[#64748b]'
                    }`}
                  >
                    {section.allowed}/{section.total}
                  </span>

                  <span
                    className={`ml-auto flex h-7 w-7 items-center justify-center rounded-lg ${
                      isExpanded ? 'bg-[#dbeafe] text-[#2563eb]' : 'bg-[#f1f5f9] text-[#64748b]'
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
                  <div className="border-t border-[#dbe3ef] bg-[#f8fafc] px-[18px] py-2">
                    {section.permissions.map((permission, index) => {
                      const isEnabled = permissionStates[permission] ?? true;

                      return (
                        <div
                          key={permission}
                          className={`flex min-h-[43px] items-center px-[30px] ${
                            index !== section.permissions.length - 1
                              ? 'border-b border-[#e2e8f0]'
                              : ''
                          }`}
                        >
                          <span className="text-[13px] font-medium text-[#475569]">
                            {permission}
                          </span>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            onClick={() => handlePermissionToggle(permission)}
                            className={`relative ml-auto h-[20px] w-[36px] shrink-0 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 ${
                              isEnabled
                                ? 'border-[#2563eb] bg-[#2563eb]'
                                : 'border-[#cbd5e1] bg-[#d9e0e8]'
                            }`}
                          >
                            <span
                              className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.22)] transition-all duration-200 ${
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
