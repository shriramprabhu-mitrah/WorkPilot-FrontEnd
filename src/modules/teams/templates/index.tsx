'use client';

import { useEffect, useRef, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { MemberCard } from '@/src/modules/teams/components/membercard';
import { WpButton } from '@/src/app/components/common/button';
import InviteTeamModal from '../components/invitePopup';
import { useGetProject, useGetTeamMembers, useGetUserById, useRemoveUser } from '../hooks/useTeams';
import { Member } from '@/src/types/teams';
import { usePermissions } from '@/src/hooks/usePermissions';
import TeamMemberCardSkeleton from '../components/TeamSkeleton';
import { WpDropdown } from '@/src/app/components/common/dropdown';

export const TeamTemplate = () => {
  const pageSize = 8;

  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [status, setStatus] = useState('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { mutate: removeUser } = useRemoveUser();
  const { hasPermission, isAdmin } = usePermissions();
  const { teamMembers, isTeamMembersLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetTeamMembers(pageSize, status || undefined);
  const visibleMembers = teamMembers?.data ?? [];
  const { user, isUserLoading } = useGetUserById(selectedUserId);
  const { project: userProjects, isProjectLoading } = useGetProject(selectedUserId);
  const projects = userProjects?.data?.project ?? [];

  // Infinite scroll
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isTeamMembersLoading) {
    return <TeamMemberCardSkeleton />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
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
        <div className="flex items-center gap-3">
          {/* Status */}
          <div className="h-9 w-[140px]">
            <WpDropdown
              value={status}
              onChange={(value) => {
                setStatus(value);
              }}
              options={[
                { label: 'ALL', value: '' },
                { label: 'ACTIVE', value: 'active' },
                { label: 'PENDING', value: 'pending' },
                { label: 'EXPIRED', value: 'expired' },
                { label: 'INACTIVE', value: 'inactive' },
              ]}
              placeholder="Status"
            />
          </div>

          {/* Invite Member */}
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
      </div>

      {/* Members Scroll Area */}
      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        <div className="w-full">
          {/* Sticky List Header */}
          <div
            className="
              sticky top-0 z-20
              hidden md:grid
              grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px]
              items-center
              gap-4
              rounded-t-xl
              border border-b-0
              border-gray-200
              bg-gray-50
              px-5 py-3
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            {['Member', 'Progress', 'Tasks', 'Done', 'Open', ''].map((h, i) => (
              <div
                key={i}
                className={`text-xs h-7  font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 ${
                  i >= 2 && i <= 4 ? 'text-center' : ''
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Members List */}
          <div
            className="
              w-full
              overflow-hidden
              rounded-b-xl
              border border-gray-200
              bg-white
              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            {visibleMembers.map((member, index) => {
              const memberData: Member = {
                id: member.id,
                name: member.name,
                role: member.role,
                initials: member.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 4),
                avatarColor: member?.color || '',
                tasks: 0,
                done: 0,
                status:member?.status
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

            {/* Empty State */}
            {visibleMembers.length === 0 && !isTeamMembersLoading && (
              <div className="flex min-h-[160px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                    <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>

                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    No members invited
                  </p>

                  <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                    Invite members to your organization.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Infinite Scroll */}
          <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center">
            {isFetchingNextPage && (
              <p className="text-sm text-gray-500 dark:text-slate-400">Loading more members...</p>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Team Member Details
              </h2>

              <WpButton
                variant="ghost"
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUserId('');
                }}
                className="dark:text-slate-300"
              >
                ✕
              </WpButton>
            </div>

            {isUserLoading ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">Loading...</div>
            ) : (
              <div className="mt-2 space-y-5">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    {user?.data?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
                  <p className="text-gray-800 dark:text-slate-200">{user?.data?.email}</p>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                    Projects
                  </p>
                  {isProjectLoading ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400">Loading projects...</p>
                  ) : projects.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                              Project
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                              Role
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((project) => (
                            <tr
                              key={project.project_id}
                              className="border-t border-gray-200 dark:border-slate-700"
                            >
                              <td className="px-4 py-3 text-sm text-gray-800 dark:text-slate-200">
                                {project.project_name}
                              </td>
                              <td className="px-4 py-3 text-sm capitalize text-gray-800 dark:text-slate-200">
                                {project.role}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      No projects assigned.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
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
