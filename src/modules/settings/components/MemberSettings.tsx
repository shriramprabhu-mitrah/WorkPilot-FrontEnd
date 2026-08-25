'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { colors } from '@/src/styles/colors';
import { MemberCard } from '@/src/modules/teams/components/membercard';
import { WpButton } from '@/src/app/components/common/button';
import InviteTeamModal from '@/src/modules/teams/components/invitePopup';
import {
  useGetTeamMembers,
  useRemoveUser,
} from '@/src/modules/teams/hooks/useTeams';

import { Member } from '@/src/types/teams';
import { usePermissions } from '@/src/hooks/usePermissions';
import TeamMemberCardSkeleton from '../../teams/components/TeamSkeleton';

export const MemberSettings = () => {
  const [page] = useState(1);
  const pageSize = 10;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { mutate: removeUser } = useRemoveUser();
  const { hasPermission, isAdmin } = usePermissions();

  const { teamMembers, isTeamMembersLoading } = useGetTeamMembers(
    page,
    pageSize
  );

  const members = teamMembers?.data ?? [];

  if (isTeamMembersLoading) {
    return <TeamMemberCardSkeleton />;
  }

  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto [scrollbar-width:thin]">
      {/* Header */}
      <div className="flex flex-shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 sm:text-2xl">
            Manage Members
          </h1>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage organization members and their roles
          </p>
        </div>

        {isAdmin() && (
          <WpButton
            size="sm"
            leftIcon={<UserPlus size={16} />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Member
          </WpButton>
        )}
      </div>

      {/* Members */}
      <div className="w-full flex-shrink-0">
        <div className="hidden rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-900 md:grid md:grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_50px] md:items-center md:gap-4">
          {['Member', 'Role', 'Status', 'Action', ''].map((header, index) => (
            <div
              key={index}
              className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400"
            >
              {header}
            </div>
          ))}
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800 md:rounded-t-none">
          {members.map((member, index) => {
            const memberData: Member = {
              id: member.id,
              name: member.name,
              role: member.role,
              initials: member.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 4),
              avatarColor: colors.primary,
              tasks: 0,
              done: 0,
            };

            return (
              <MemberCard
                key={member.id}
                member={memberData}
                canManageUsers={hasPermission('TEAMS_DELETE')}
                onDelete={() => {
                  setSelectedMember(memberData);
                  setShowDeleteModal(true);
                }}
                isLast={index === members.length - 1}
              />
            );
          })}

          {members.length === 0 && (
            <div className="flex min-h-[160px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <UserPlus
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  No members found
                </p>

                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                  Invite members to your organization.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member */}
      <InviteTeamModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                Delete Member
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to remove{' '}
                <span className="font-medium text-gray-800 dark:text-slate-200">
                  {selectedMember?.name}
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-5 dark:border-slate-700">
              <WpButton
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </WpButton>

              <WpButton
                variant="danger"
                onClick={() => {
                  if (!selectedMember) return;

                  removeUser({
                    user_id: selectedMember.id,
                  });

                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
              >
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};