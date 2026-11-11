import { X, Pencil, Trash2, Check } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { getInitials } from '@/src/app/components/common/format';
import { ProjectDetailMember } from '@/src/types/project';

interface Option {
  label: string;
  value: string;
}

interface RoleLike {
  id: string;
  name: string;
}

interface ViewMembersModalProps {
  members: ProjectDetailMember[] | undefined;
  roles: RoleLike[] | undefined;
  roleOptions: Option[];
  isRolesLoading: boolean;
  canManage: boolean; // result of canManageProjects()
  editingMemberId: string | null;
  selectedRole: string;
  updatingMemberId: string | null;
  isUpdatingProjectRole: boolean;
  onClose: () => void;
  onStartEdit: (member: ProjectDetailMember) => void;
  onCancelEdit: () => void;
  onSelectRole: (roleId: string) => void;
  onSaveRole: (member: ProjectDetailMember) => void;
  onRequestRemove: (member: { userId: string; name: string }) => void;
}

const ViewMembersModal = ({
  members,
  roles,
  roleOptions,
  isRolesLoading,
  canManage,
  editingMemberId,
  selectedRole,
  updatingMemberId,
  isUpdatingProjectRole,
  onClose,
  onStartEdit,
  onCancelEdit,
  onSelectRole,
  onSaveRole,
  onRequestRemove,
}: ViewMembersModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Team Members</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-100">
            {members?.length || 0} members in this project
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
      <div className="max-h-[60vh] overflow-y-auto overflow-x-visible p-5">
        <div className="space-y-2">
          {members && members.length > 0 ? (
            members.map((member) => {
              const memberIsOrgAdmin =
                member.role?.toLowerCase() === 'org_admin' ||
                member.role?.toLowerCase() === 'org admin' ||
                member.role?.toLowerCase() === 'organization admin' ||
                member.role?.toLowerCase().replace(/[\s_-]+/g, '') === 'orgadmin';

              const canEdit = !memberIsOrgAdmin && canManage;
              const canDelete = !memberIsOrgAdmin && canManage;

              const removeMember = () =>
                onRequestRemove({
                  userId: member.user_id,
                  name: member.full_name || member.username,
                });

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3 transition-all hover:border-gray-300 dark:hover:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white`}
                      style={{
                        backgroundColor: member.color,
                      }}
                    >
                      {getInitials(member.full_name || member.username)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {member.full_name || member.username}
                      </p>
                      {editingMemberId === member.user_id ? (
                        <div className="mt-1 w-50 relative">
                          <WpDropdown
                            options={roleOptions}
                            value={selectedRole}
                            onChange={(value) => onSelectRole(value)}
                            placeholder={isRolesLoading ? 'Loading roles...' : 'Select Role'}
                            disabled={isRolesLoading}
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-slate-200 capitalize flex items-center gap-2">
                          {updatingMemberId === member.user_id ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                              Updating...
                            </>
                          ) : (
                            roles?.find(
                              (r) =>
                                r.id === member.role ||
                                r.name.toLowerCase() === member.role?.toLowerCase()
                            )?.name || member.role?.replace('_', ' ')
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingMemberId === member.user_id ? (
                      <>
                        <WpButton
                          variant="ghost"
                          size="sm"
                          className="!p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => onSaveRole(member)}
                          disabled={isUpdatingProjectRole}
                        >
                          <Check size={16} />
                        </WpButton>
                        <WpButton
                          variant="ghost"
                          size="sm"
                          className="!p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                          onClick={onCancelEdit}
                          disabled={isUpdatingProjectRole}
                        >
                          <X size={16} />
                        </WpButton>
                        {canDelete && (
                          <WpButton
                            variant="ghost"
                            size="sm"
                            onClick={removeMember}
                            className="!p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            aria-label="Remove member"
                          >
                            <Trash2 size={16} />
                          </WpButton>
                        )}
                      </>
                    ) : (
                      <>
                        {canEdit && (
                          <WpButton
                            variant="ghost"
                            size="sm"
                            className="!p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => onStartEdit(member)}
                          >
                            <Pencil size={16} />
                          </WpButton>
                        )}
                        {canDelete && (
                          <WpButton
                            variant="ghost"
                            size="sm"
                            onClick={removeMember}
                            className="!p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            aria-label="Remove member"
                          >
                            <Trash2 size={16} />
                          </WpButton>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                No members in this project yet.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 p-5">
        <WpButton type="button" variant="secondary" size="md" onClick={onClose}>
          Close
        </WpButton>
      </div>
    </div>
  </div>
);

export default ViewMembersModal;
