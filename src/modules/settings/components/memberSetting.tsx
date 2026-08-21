'use client';

import { Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { WpButton } from '@/src/app/components/common/button';
import { colors } from '@/src/styles/colors';
import { useGetTeamMembers, useRemoveUser } from '../../teams/hooks/useTeams';
import { usePermissions } from '@/src/hooks/usePermissions';
import InviteTeamModal from '../../teams/components/invitePopup';

const MembersSettings = () => {
  const [page] = useState(1);
  const pageSize = 10;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { teamMembers, isTeamMembersLoading } = useGetTeamMembers(page, pageSize);

  const { mutate: removeUser } = useRemoveUser();
  const { isAdmin, hasPermission } = usePermissions();

  const members = teamMembers?.data ?? [];
  const visibleMembers = showAll ? members : members.slice(0, 10);

  const handleDelete = () => {
    if (!selectedMember) return;

    removeUser({
      user_id: selectedMember.id,
    });

    setShowDeleteModal(false);
    setSelectedMember(null);
  };

  if (isTeamMembersLoading) {
    return (
      <div className="w-full px-5 py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-44 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-14 w-full rounded bg-gray-200" />
          <div className="h-14 w-full rounded bg-gray-200" />
          <div className="h-14 w-full rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-[18px] pb-10">
        <div className="flex min-h-[65px] items-center justify-between">
          <div>
            <h2 className="text-[21px] font-bold tracking-tight text-[#2563eb]">Manage Members</h2>

            <p className="mt-0.5 text-[12px] text-[#64748b]">
              Manage organization members and their roles
            </p>
          </div>

          {isAdmin() && (
            <WpButton
              size="sm"
              leftIcon={<UserPlus size={15} />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              New Member
            </WpButton>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#dbe3ef] bg-white shadow-[0_3px_12px_rgba(30,60,90,0.06)]">
          <div className="hidden grid-cols-[minmax(260px,1.5fr)_110px_minmax(220px,1fr)_100px_45px] items-center gap-4 border-b border-[#dbe3ef] bg-[#f8fafc] px-5 py-3 md:grid">
            <div className="text-[12px] font-bold tracking-wide text-[#334155]">MEMBER</div>
            <div className="text-[12px] font-bold tracking-wide text-[#334155]">ADMIN</div>

            <div className="text-[12px] font-bold tracking-wide text-[#334155]">ROLE</div>

            <div className="text-[12px] font-bold tracking-wide text-[#334155]">STATUS</div>

            <div />
          </div>

          {visibleMembers.length > 0 ? (
            visibleMembers.map((member, index) => {
              const initials = member.name
                ?.split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              const isMemberAdmin = member.role?.toLowerCase().includes('admin');

              return (
                <div
                  key={member.id}
                  className={`grid min-h-[68px] grid-cols-1 items-center gap-3 px-5 py-3 transition-colors hover:bg-[#f8fbff] md:grid-cols-[minmax(260px,1.5fr)_110px_minmax(220px,1fr)_100px_45px] md:gap-4 ${
                    index !== visibleMembers.length - 1 ? 'border-b border-[#e2e8f0]' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#dbeafe] text-[14px] font-bold text-[#2563eb]">
                      {initials || 'U'}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#1e293b]">
                        {member.name}
                      </p>

                      <p className="truncate text-[12px] text-[#64748b]">
                        {member.email ?? 'No email available'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center md:justify-start">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isMemberAdmin ? 'bg-[#dbeafe] text-[#2563eb]' : 'text-[#94a3b8]'
                      }`}
                    >
                      {isMemberAdmin ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div>
                    <select
                      value={member.role ?? ''}
                      onChange={(e) => {
                        // update member role here
                      }}
                      className="h-[34px] w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-[13px] font-medium text-[#475569] outline-none transition-all focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
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

                  <div>
                    <span className="inline-flex items-center rounded-md bg-[#eff6ff] px-3 py-1.5 text-[11px] font-semibold text-[#2563eb]">
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
                      Active
                    </span>
                  </div>

                  <div className="flex items-center md:justify-end">
                    {hasPermission('TEAMS_DELETE') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMember({
                            id: member.id,
                            name: member.name,
                          });
                          setShowDeleteModal(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#fee2e2] hover:text-[#ef4444]"
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
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6ff]">
                  <UserPlus size={18} className="text-[#2563eb]" />
                </div>

                <p className="text-sm font-semibold text-[#334155]">No members found</p>

                <p className="mt-1 text-xs text-[#94a3b8]">Invite members to your organization.</p>
              </div>
            </div>
          )}
        </div>

        {!showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8] hover:underline"
            >
              View More
            </button>
          </div>
        )}

        {showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-sm font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8] hover:underline"
            >
              View Less
            </button>
          </div>
        )}
      </div>

      <InviteTeamModal open={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e2e8f0] p-5">
              <h2 className="text-[17px] font-bold text-[#1e293b]">Delete Member</h2>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-[#334155]">{selectedMember?.name}</span>?
              </p>
            </div>

            <div className="flex justify-end gap-3 p-5">
              <WpButton
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
              >
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
