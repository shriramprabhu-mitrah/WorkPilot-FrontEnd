'use client';

import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { getInitials } from '@/src/app/components/common/format';

interface Member {
  user_id: string;
  full_name?: string | null;
  username?: string | null;
  role?: string | null;
  color?: string | null;
}

interface Role {
  id: string;
  name: string;
}

interface MembersListProps {
  members: Member[];
  roles: Role[];
  isOrgAdmin: boolean;
  onEdit: (member: { userId: string; name: string; username: string; roleId: string }) => void;
  onDelete: (member: { id: string; name: string }) => void;
}

const MembersList = ({ members, roles, isOrgAdmin, onEdit, onDelete }: MembersListProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      {/* Desktop header */}
      <div className="hidden lg:grid grid-cols-[minmax(220px,1.5fr)_minmax(220px,1fr)_120px_88px] items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-3">
        {['MEMBER', 'ROLE', ''].map((heading, index) => (
          <div
            key={index}
            className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-100"
          >
            {heading}
          </div>
        ))}
      </div>

      {members.length > 0 ? (
        members.map((member, index) => {
          const memberName = member.full_name || member.username || 'User';

          const isOrgAdminRole = member.role?.toLowerCase() === 'org_admin';

          const currentRole = roles.find(
            (role) => role.name.toLowerCase() === member.role?.toLowerCase()
          );

          return (
            <div
              key={member.user_id}
              className={`group flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 sm:px-5 lg:grid lg:grid-cols-[minmax(220px,1.5fr)_minmax(220px,1fr)_120px_88px] lg:items-center lg:gap-4 ${
                index !== members.length - 1
                  ? 'border-b border-slate-200 dark:border-slate-700'
                  : ''
              }`}
            >
              {/* Member */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                  style={{
                    backgroundColor: member.color || '#64748b',
                  }}
                >
                  {getInitials(member.full_name || '') || 'U'}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {memberName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {member.username ? `@${member.username}` : 'No username'}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 lg:block">
                <span className="min-w-[60px] text-xs font-medium text-slate-400 dark:text-slate-500 lg:hidden">
                  Role
                </span>

                <div className="flex-1">
                  <div className="flex h-8 items-center">
                    {isOrgAdminRole ? (
                      <span className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-300">
                        Org Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold uppercase text-slate-700 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200">
                        {currentRole?.name || member.role || '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 lg:justify-center">
                {isOrgAdmin && !isOrgAdminRole && (
                  <>
                    <WpButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onEdit({
                          userId: member.user_id,
                          name: memberName,
                          username: member.username || '',
                          roleId: currentRole?.id ?? '',
                        })
                      }
                      className="!h-8 !w-8 !p-0 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                      title="Edit role"
                    >
                      <Pencil size={15} strokeWidth={1.8} />
                    </WpButton>

                    <WpButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onDelete({
                          id: member.user_id,
                          name: memberName,
                        })
                      }
                      className="!h-8 !w-8 !p-0 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Remove member"
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </WpButton>
                  </>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No members found
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-200">
              Add members to your Project.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
