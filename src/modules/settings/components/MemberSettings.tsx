'use client';

import { useState } from 'react';
import { UserPlus, Search } from 'lucide-react';
import { MemberCard } from '@/src/modules/teams/components/membercard';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import InviteTeamModal from '@/src/modules/teams/components/invitePopup';
import {
  useGetTeamMembers,
  useGetUserById,
  useRemoveUser,
  useGetProject,
} from '@/src/modules/teams/hooks/useTeams';
import { Member } from '@/src/types/teams';
import { usePermissions } from '@/src/hooks/usePermissions';
import TeamMemberCardSkeleton from '@/src/modules/teams/components/TeamSkeleton';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { Pagination } from '@/src/app/components/common/pagination/pagination';
import Skeleton from '@/src/app/components/common/skeleton';
import { useDebounce } from '@/src/hooks/useDebounce';

export const MemberSettings = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [status, setStatus] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const debouncedNameSearch = useDebounce(nameSearch, 500);
  const { mutate: removeUser } = useRemoveUser();
  const { isOrgAdmin } = usePermissions();
  const { teamMembers, isTeamMembersLoading, isTeamMembersFetching, isTeamMembersPlaceholderData } =
    useGetTeamMembers(page, pageSize, status || undefined, debouncedNameSearch || undefined);

  const isPaginationLoading = isTeamMembersFetching && isTeamMembersPlaceholderData;

  const visibleMembers = teamMembers?.data ?? [];
  const { user, isUserLoading } = useGetUserById(selectedUserId);
  const { project: userProjects, isProjectLoading } = useGetProject(selectedUserId);
  const projects = userProjects?.data?.project ?? [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
    setPage(1);
  };

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
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-100">
            Manage your growing organization with ease
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search by name */}
          <div className="relative h-9 w-[220px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 z-10"
            />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              placeholder="Search members..."
              className="h-9 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-3 text-sm text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Status */}
          <div className="h-9 w-[140px]">
            <WpDropdown
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
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
          {isOrgAdmin && (
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
                className={`text-xs h-7  font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-100 ${
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
            {isPaginationLoading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex items-center gap-4 border-b border-gray-200 px-5 py-4 dark:border-slate-700"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />

                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>

                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))
              : visibleMembers.map((member, index) => {
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
                    tasks: member.total_assigned ?? 0,
                    done: member.completed ?? 0,
                    inProgress: member.in_progress ?? 0,
                    completionPercentage: member.completion_percentage ?? 0,
                    status: member?.status,
                  };

                  return (
                    <MemberCard
                      key={member.id}
                      member={memberData}
                      canManageUsers={isOrgAdmin}
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

                  <p className="mt-1 text-xs text-gray-400 dark:text-slate-200">
                    Invite members to your organization.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <Pagination
          meta={teamMembers?.meta}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Invite Modal */}
      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Team Member Details
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                  Member information and assigned projects
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUserId('');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {isUserLoading ? (
                <div className="space-y-4">
                  <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
                  <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
                  <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Member Info */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{
                          backgroundColor:
                            visibleMembers.find((member) => member.id === selectedUserId)?.color ||
                            '#6366f1',
                        }}
                      >
                        {user?.data?.name
                          ?.split(' ')
                          .map((word) => word[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-gray-900 dark:text-slate-100">
                          {user?.data?.name || '—'}
                        </h3>

                        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-slate-400">
                          {user?.data?.email || '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        Projects
                      </h3>

                      {projects.length > 0 && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                          {projects.length}
                        </span>
                      )}
                    </div>

                    {isProjectLoading ? (
                      <div className="space-y-2">
                        <div className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
                        <div className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
                      </div>
                    ) : projects.length > 0 ? (
                      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                        {projects.map((project, index) => (
                          <div
                            key={project.project_id}
                            className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
                              index !== projects.length - 1
                                ? 'border-b border-gray-200 dark:border-slate-700'
                                : ''
                            } hover:bg-gray-50 dark:hover:bg-slate-700/40`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {project.project_name?.charAt(0)?.toUpperCase() || 'P'}
                              </div>

                              <p className="truncate text-sm font-medium text-gray-800 dark:text-slate-200">
                                {project.project_name}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                              {project.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center dark:border-slate-700">
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                          No projects assigned
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-900/50">
              <WpButton
                variant="secondary"
                onClick={() => {
                  setShowUserDetails(false);
                  setSelectedUserId('');
                }}
              >
                Close
              </WpButton>
            </div>
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
