'use client';

import { Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { WpButton } from '@/src/app/components/common/button';
import { useGetTeamMembers, useRemoveUser } from '../../teams/hooks/useTeams';
import { usePermissions } from '@/src/hooks/usePermissions';
import InviteTeamModal from '../../teams/components/invitePopup';

const MembersSettings = () => {
  const [page] = useState(1);
  const pageSize = 10;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { teamMembers, isTeamMembersLoading } = useGetTeamMembers(page, pageSize);
  const { mutate: removeUser } = useRemoveUser();
  const { isAdmin, hasPermission } = usePermissions();

  const members = teamMembers?.data ?? [];
  const visibleMembers = showAll ? members : members.slice(0, 10);

  const handleDelete = () => {
    if (!selectedMember) return;
    removeUser({ user_id: selectedMember.id });
    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  if (isTeamMembersLoading) {
    return (
      <div className="w-full px-5 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-44 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-slate-700" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 w-full rounded bg-gray-200 dark:bg-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full pb-10">
        {/* Header */}
        <div className="flex min-h-[65px] flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Manage Members
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage organization members and their roles
            </p>
          </div>
          {isAdmin() && (
            <WpButton size="sm" leftIcon={<UserPlus size={15} />} onClick={() => setIsInviteModalOpen(true)}>
              New Member
            </WpButton>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[minmax(200px,1.5fr)_80px_minmax(160px,1fr)_100px_44px] items-center gap-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-3">
            {['MEMBER', 'ADMIN', 'ROLE', 'STATUS', ''].map((h, i) => (
              <div key={i} className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400">
                {h}
              </div>
            ))}
          </div>

          {visibleMembers.length > 0 ? (
            visibleMembers.map((member, index) => {
              const initials = member.name
                ?.split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const isMemberAdmin = member.role?.toLowerCase().includes('admin');

              return (
                <div
                  key={member.id}
                  className={`flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 md:grid md:grid-cols-[minmax(200px,1.5fr)_80px_minmax(160px,1fr)_100px_44px] md:items-center md:gap-3 md:py-3 ${
                    index !== visibleMembers.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''
                  }`}
                >
                  {/* Member info */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-sm font-bold text-blue-600 dark:text-blue-300">
                      {initials || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.email ?? 'No email'}
                      </p>
                    </div>
                  </div>

                  {/* Admin badge — label on mobile */}
                  <div className="flex items-center gap-2 md:block">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 md:hidden">
                      Admin:
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isMemberAdmin
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isMemberAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {/* Role selector */}
                  <div className="flex items-center gap-2 md:block">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 md:hidden">
                      Role:
                    </span>
                    <select
                      value={member.role ?? ''}
                      onChange={() => {}}
                      className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-[13px] font-medium text-slate-700 dark:text-slate-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    >
                      <option value="">Member</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Org Admin">Org Admin</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Developer">Developer</option>
                      <option value="QA">QA</option>
                      <option value="Stakeholder">Stakeholder</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 md:block">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 md:hidden">
                      Status:
                    </span>
                    <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-300">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                      Active
                    </span>
                  </div>

                  {/* Delete */}
                  <div className="flex justify-end md:justify-end">
                    {hasPermission('TEAMS_DELETE') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMember({ id: member.id, name: member.name });
                          setShowDeleteModal(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500"
                        title="Remove member"
                      >
                        <Trash2 size={15} strokeWidth={1.8} />
                      </button>
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
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No members found</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Invite members to your organization.</p>
              </div>
            </div>
          )}
        </div>

        {/* View more / less */}
        {!showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setShowAll(true)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View More
            </button>
          </div>
        )}
        {showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={() => setShowAll(false)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View Less
            </button>
          </div>
        )}
      </div>

      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="border-b border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">Delete Member</h2>
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedMember?.name}</span>?
              </p>
            </div>
            <div className="flex justify-end gap-3 p-5">
              <WpButton variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedMember(null); }}>
                Cancel
              </WpButton>
              <WpButton variant="danger" onClick={handleDelete}>
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MembersSettings;
