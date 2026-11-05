'use client';

import { CornerDownLeft, Plus, Loader2 } from 'lucide-react';
import { WpInput } from '@/src/app/components/common/input';
import { Role } from '@/src/types/settings';

export interface RoleListProps {
  roles: Role[];
  isCreatingRole: boolean;
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

const RoleList = ({
  roles,
  selectedRole,
  hasChanges,
  isAddingRole,
  newRoleName,
  roleError,
  newRoleRef,
  isCreatingRole,
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
                <span className="truncate uppercase">{role.name}</span>
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
                disabled={isCreatingRole}
                className="mt-0.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                title="Create role"
              >
                {isCreatingRole ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CornerDownLeft size={16} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleList;