'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { MemberCard } from '@/src/modules/teams/components/membercard';
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
import { usePermissions } from '@/src/hooks/usePermissions';
import TeamMemberCardSkeleton from '../components/TeamSkeleton';
import { ROLE_LABELS, ROLE_TYPE, PROJECT_ROLES } from '@/src/app/components/common/enum';

export const TeamTemplate = () => {
  const [page] = useState(1);
  const pageSize = 10;
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { mutate: removeUser } = useRemoveUser();
  const { mutate: updateRole } = useUpdateRole();
  const { hasPermission, isAdmin } = usePermissions();
  const { teamMembers, isTeamMembersLoading } = useGetTeamMembers(page, pageSize);
  const visibleMembers = showAll ? teamMembers?.data : teamMembers?.data?.slice(0, 4);
  const { user, isUserLoading } = useGetUserById(selectedUserId);
  const { project: userProjects, isProjectLoading } = useGetProject(selectedUserId);
  const projects = userProjects?.data?.project ?? [];

  if (isTeamMembersLoading) return <TeamMemberCardSkeleton page />;

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto [scrollbar-width:thin]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Team</h1>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-slate-400">
            {teamMembers?.data?.length} members
          </p>
        </div>
        {isAdmin() && (
          <WpButton size="sm" leftIcon={<UserPlus size={16} />} onClick={() => setIsInviteModalOpen(true)}>
            Invite Member
          </WpButton>
        )}
      </div>

      <div className="w-full flex-shrink-0">
        {/* List Header — desktop only */}
        <div className="hidden md:grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px] items-center gap-4 rounded-t-xl border border-b-0 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-5 py-3">
          {['Member', 'Progress', 'Tasks', 'Done', 'Open', ''].map((h, i) => (
            <div
              key={i}
              className={`text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 ${i >= 2 && i <= 4 ? 'text-center' : ''}`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Members list */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 md:rounded-t-none">
          {visibleMembers?.map((member, index) => {
            const memberData: Member = {
              id: member.id,
              name: member.name,
              role: member.role,
              initials: member.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 4),
              avatarColor: colors.primary,
              tasks: 0,
              done: 0,
            };
            return (
              <MemberCard
                key={member.id}
                member={memberData}
                canManageUsers={hasPermission('TEAMS_DELETE')}
                onDelete={() => { setSelectedMember(memberData); setShowDeleteModal(true); }}
                onClick={() => { setSelectedUserId(member.id); setShowUserDetails(true); }}
                isLast={index === visibleMembers.length - 1}
              />
            );
          })}

          {(!visibleMembers || visibleMembers.length === 0) && (
            <div className="flex min-h-[160px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                  <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">No members yet</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Invite members to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!showAll && teamMembers?.data && teamMembers.data.length > 4 && (
        <div className="mt-2 flex justify-center">
          <WpButton variant="ghost" className="text-sm font-medium text-blue-600 dark:text-blue-400 p-0" onClick={() => setShowAll(true)}>
            View More
          </WpButton>
        </div>
      )}

      {/* Invite Modal */}
      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Team Member Details
              </h2>
              <WpButton variant="ghost" onClick={() => setShowUserDetails(false)} className="dark:text-slate-300">
                ✕
              </WpButton>
            </div>

            {isUserLoading ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">Loading...</div>
            ) : (
              <div className="mt-2 space-y-5">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-slate-100">{user?.data?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
                  <p className="text-gray-800 dark:text-slate-200">{user?.data?.email}</p>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">Projects</p>
                  {isProjectLoading ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400">Loading projects...</p>
                  ) : projects.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Project</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((project) => (
                            <tr key={project.project_id} className="border-t border-gray-200 dark:border-slate-700">
                              <td className="px-4 py-3 text-sm text-gray-800 dark:text-slate-200">{project.project_name}</td>
                              <td className="px-4 py-3 text-sm capitalize text-gray-800 dark:text-slate-200">{project.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">No projects assigned.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Delete Member</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to remove{' '}
                <span className="font-medium text-gray-800 dark:text-slate-200">{selectedMember?.name}</span>?
              </p>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-700">
              <WpButton
                variant="secondary"
                onClick={() => { setShowDeleteModal(false); setSelectedMember(null); }}
              >
                Cancel
              </WpButton>
              <WpButton
                variant="danger"
                onClick={() => {
                  if (!selectedMember) return;
                  removeUser({ user_id: selectedMember.id });
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
