'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { MemberCard } from '@/src/modules/teams/components/membercard';
import { RoleCardView } from '../components/rolecared';
import { MEMBERS, roleOptions, ROLES } from '../data';
import { WpButton } from '@/src/app/components/common/button';
import InviteTeamModal from '../components/invitePopup';
import { useGetTeamMembers, useRemoveUser, useUpdateRole } from '../hooks/useTeams';
import { Member } from '@/src/types/teams';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { usePermissions } from '@/src/hooks/usePermissions';
import TeamMemberCardSkeleton from '../components/TeamSkeleton';

export const TeamTemplate = () => {
  const [page] = useState(1);
  const pageSize = 10;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const { mutate: removeUser } = useRemoveUser();
  const { mutate: updateRole } = useUpdateRole();
  const { hasPermission } = usePermissions();
  const { teamMembers, isTeamMembersLoading } = useGetTeamMembers(page, pageSize);

  if (isTeamMembersLoading) {
    return <TeamMemberCardSkeleton page />;
  }
  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto [scrollbar-width:thin]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.gray900 }}>
            Team
          </h1>
          <p className="text-sm mt-0.5" style={{ color: colors.gray500 }}>
            {teamMembers?.data?.length} members · Acme Corp
          </p>
        </div>
        <WpButton
          size="sm"
          leftIcon={<UserPlus size={15} />}
          onClick={() => setIsInviteModalOpen(true)}
        >
          <span className="hidden sm:inline">Invite Member</span>
          <span className="sm:hidden">Invite</span>
        </WpButton>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
        {teamMembers?.data?.map((member) => {
          const memberData = {
            id: member.id,
            name: member.name,
            role: member.role,
            initials: member.name
              .split(' ')
              .map((word) => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            avatarColor: colors.primary,
            tasks: 0,
            done: 0,
          };

          return (
            <MemberCard
              key={member.id}
              member={memberData}
              canManageUsers={hasPermission('TEAMS_DELETE')}
              openMenu={openMenuId === member.id}
              onToggleMenu={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
              onDelete={() => {
                setSelectedMember(memberData);
                setShowDeleteModal(true);
              }}
              onUpdateRole={() => {
                setSelectedMember(memberData);
                setSelectedRole(member.role);
                setShowRoleModal(true);
              }}
            />
          );
        })}
      </div>

      {/* RBAC */}
      <div className="flex-shrink-0">
        <h2 className="text-base font-bold mb-4" style={{ color: colors.gray900 }}>
          Role-Based Access Control
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((r) => (
            <RoleCardView key={r.name} role={r} />
          ))}
        </div>
      </div>
      {/* Invite Modal */}
      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className=" p-5">
              <h2 className="text-lg font-semibold">Delete Member</h2>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to remove{' '}
                <span className="font-medium">{selectedMember?.name}</span>?
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-5">
              <WpButton
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
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold">Update Role</h2>

            <div className="mt-4">
              <WpDropdown
                label="Role"
                options={roleOptions}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value)}
                placeholder="Select Role"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <WpButton
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </WpButton>
              <WpButton
                onClick={() => {
                  if (!selectedMember) return;
                  updateRole({
                    user_id: selectedMember.id,
                    role: selectedRole,
                  });
                  setShowRoleModal(false);
                  setSelectedMember(null);
                }}
              >
                Save
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
