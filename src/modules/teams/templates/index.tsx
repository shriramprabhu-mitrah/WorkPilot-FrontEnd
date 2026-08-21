'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { MemberCard } from '@/src/modules/teams/components/membercard';
import { RoleCardView } from '../components/rolecared';
import { MEMBERS, roleOptions, ROLES } from '../data';
import { WpButton } from '@/src/app/components/common/button';
import InviteTeamModal from '../components/invitePopup';
import {
  useGetProject,
  useGetTeamMembers,
  useGetUserById,
  useRemoveUser,
  useUpdateRole,
} from '../hooks/useTeams';
import { Member } from '@/src/types/teams';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { usePermissions } from '@/src/hooks/usePermissions';
import TeamMemberCardSkeleton from '../components/TeamSkeleton';
import { ROLE_LABELS, ROLE_TYPE, PROJECT_ROLES } from '@/src/app/components/common/enum';

export const TeamTemplate = () => {
  const [page] = useState(1);
  const pageSize = 10;
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showAll, setShowAll] = useState(false);
  const { mutate: removeUser } = useRemoveUser();
  const { mutate: updateRole } = useUpdateRole();
  const { hasPermission, isAdmin } = usePermissions();
  const { teamMembers, isTeamMembersLoading } = useGetTeamMembers(page, pageSize);
  const visibleMembers = showAll ? teamMembers?.data : teamMembers?.data?.slice(0, 4);
  const { user, isUserLoading } = useGetUserById(selectedUserId);
  const { project: userProjects, isProjectLoading } = useGetProject(selectedUserId);

  const projects = userProjects?.data?.project ?? [];
  const roleOptions = PROJECT_ROLES.map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));
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
      <div className="w-full flex-shrink-0">
        {/* List Header */}
        <div
          className="hidden md:grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px] items-center gap-4 rounded-t-xl border border-b-0 bg-gray-50 px-5 py-3"
          style={{ borderColor: colors.gray200 }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.gray500 }}
          >
            Member
          </div>

          <div
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.gray500 }}
          >
            Progress
          </div>

          <div
            className="text-center text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.gray500 }}
          >
            Tasks
          </div>

          <div
            className="text-center text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.gray500 }}
          >
            Done
          </div>

          <div
            className="text-center text-xs font-semibold uppercase tracking-wide"
            style={{ color: colors.gray500 }}
          >
            Open
          </div>

          <div />
        </div>

        {/* Members */}
        <div
          className="w-full overflow-hidden rounded-xl border bg-white md:rounded-t-none"
          style={{ borderColor: colors.gray200 }}
        >
          {visibleMembers?.map((member, index) => {
            const memberData = {
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
                onClick={() => {
                  setSelectedUserId(member.id);
                  setShowUserDetails(true);
                }}
                isLast={index === visibleMembers.length - 1}
              />
            );
          })}
        </div>
      </div>
      {!showAll && teamMembers?.data && teamMembers.data.length > 4 && (
        <div className="mt-2 flex justify-center">
          <WpButton
            variant="ghost"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline p-0"
            onClick={() => setShowAll(true)}
          >
            View More
          </WpButton>
        </div>
      )}

      {/* RBAC Comment for future purpose*/}
      {/* <div className="flex-shrink-0">
        <h2 className="text-base font-bold mb-4" style={{ color: colors.gray900 }}>
          Role-Based Access Control
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((r) => (
            <RoleCardView key={r.name} role={r} />
          ))}
        </div>
      </div> */}
      {/* Invite Modal */}
      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Team Member Details</h2>

              <WpButton variant="ghost" onClick={() => setShowUserDetails(false)}>
                ✕
              </WpButton>
            </div>

            {isUserLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.data?.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user?.data?.email}</p>
                </div>
                {/* Projects */}
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700">Projects</p>

                  {isProjectLoading ? (
                    <p className="text-sm text-gray-500">Loading projects...</p>
                  ) : projects.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Project</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                          </tr>
                        </thead>

                        <tbody>
                          {projects.map((project) => (
                            <tr key={project.project_id} className="border-t border-gray-200">
                              <td className="px-4 py-3 text-sm">{project.project_name}</td>
                              <td className="px-4 py-3 text-sm capitalize">{project.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No projects assigned.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
    </div>
  );
};
