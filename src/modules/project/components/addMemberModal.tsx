import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpMultiSelect } from '@/src/app/components/common/multi-select';
import { WpDropdown } from '@/src/app/components/common/dropdown';

interface Option {
  label: string;
  value: string;
}

interface AddMemberModalProps {
  memberOptions: Option[];
  selectedMembers: string[];
  memberRoles: Record<string, string>;
  roleOptions: Option[];
  isRolesLoading: boolean;
  isUsersLoading: boolean;
  isUsersFetching: boolean;
  isAddingMembers: boolean;
  onMemberChange: (selected: string[]) => void;
  onSearchChange: (value: string) => void;
  onRoleChange: (memberId: string, roleId: string) => void;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const AddMemberModal = ({
  memberOptions,
  selectedMembers,
  memberRoles,
  roleOptions,
  isRolesLoading,
  isUsersLoading,
  isUsersFetching,
  isAddingMembers,
  onMemberChange,
  onSearchChange,
  onRoleChange,
  onClose,
  onCancel,
  onSubmit,
}: AddMemberModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="flex h-[600px] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Add Members</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-100">
            Select members to add to this project.
          </p>
        </div>
        <WpButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="!p-2 text-gray-400 dark:text-slate-500"
        >
          <X size={17} />
        </WpButton>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <WpMultiSelect
          label="Members"
          options={memberOptions}
          value={selectedMembers}
          onChange={onMemberChange}
          onSearchChange={onSearchChange}
          isSearching={isUsersFetching}
          serverSideSearch
          placeholder={isUsersLoading ? 'Loading members...' : 'Search or select members'}
          hint="Type to search, or pick from the dropdown"
        />
        <div className="mt-5 flex-1">
          {selectedMembers.length > 0 ? (
            <>
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                Member Roles
              </p>
              <div className="space-y-3 pr-2">
                {selectedMembers.map((memberId) => {
                  const member = memberOptions.find((m) => m.value === memberId);
                  return (
                    <div
                      key={memberId}
                      className="flex items-center rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-3"
                    >
                      <div className="w-40 text-sm font-medium text-gray-700 dark:text-slate-200">
                        {member?.label}
                      </div>
                      <div className="flex-1 -mb-5">
                        <WpDropdown
                          options={roleOptions}
                          value={memberRoles[memberId] || roleOptions[0]?.value}
                          onChange={(value) => onRoleChange(memberId, value)}
                          disabled={isRolesLoading}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
              <div className="text-center">
                <p className="text-base font-medium text-gray-700 dark:text-slate-200">
                  No members selected
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {/* Select members above to assign project roles. */}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 p-5">
        <WpButton
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isAddingMembers}
        >
          Cancel
        </WpButton>
        <WpButton
          type="button"
          variant="primary"
          size="md"
          disabled={!selectedMembers.length || isAddingMembers}
          onClick={onSubmit}
        >
          {isAddingMembers
            ? 'Adding...'
            : `Add ${selectedMembers.length > 0 ? `${selectedMembers.length} ` : ''}Member${selectedMembers.length !== 1 ? 's' : ''}`}
        </WpButton>
      </div>
    </div>
  </div>
);

export default AddMemberModal;
