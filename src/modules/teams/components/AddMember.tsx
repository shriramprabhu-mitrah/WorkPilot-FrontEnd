'use client';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Trash2, UserPlus } from 'lucide-react';
import { WpMultiSelect } from '@/src/app/components/common/multi-select';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import {
  useAddProjectMembers,
  useUpdateProjectRole,
  useGetProjectsWithSprints,
} from '@/src/modules/project/hooks/useProject';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import { AddProjectMembersPayload } from '@/src/types/project';
import { ROLE_LABELS, ROLE_TYPE, PROJECT_ROLES } from '@/src/app/components/common/enum';
import { showToast } from '@/src/utils/toast';
import { WpButton } from '@/src/app/components/common/button';
import { useGetProjectMembers, useRemoveProjectMember } from '../hooks/useTeams';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { useGetRoles } from '../../settings/hooks/useSettings';

const MembersSettings = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, ROLE_TYPE>>({});
  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();
  const { users, isUsersLoading } = useGetOrganizationUsers(1, 50, true);
  const { mutate: removeProjectMember, isPending: isRemovingMember } = useRemoveProjectMember();

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

  // Find project matching current URL project slug if present
  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    const lowerSlug = projectSlug.toLowerCase();
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug?.toLowerCase() === lowerSlug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === lowerSlug ||
          p.name?.toLowerCase() === lowerSlug
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return false;
    return !matchedProject;
  }, [projectSlug, matchedProject, isLoadingProjectsWithSprints]);

  // If on a projectSlug route, strictly use matchedProject; otherwise use Redux
  const effectiveProject = projectSlug ? matchedProject : selectedApiProject;
  const projectId = effectiveProject?.id ?? '';

  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== selectedApiProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, selectedApiProject?.id, dispatch]);

  // If on legacy /teams without projectSlug in URL, redirect to /[orgSlug]/[slug]/teams
  useEffect(() => {
    if (!projectSlug && selectedApiProject?.slug && orgSlug) {
      router.replace(`/${orgSlug}/${selectedApiProject.slug}/teams`);
    }
  }, [projectSlug, selectedApiProject?.slug, orgSlug, router]);

  const [page] = useState(1);
  const pageSize = 10;
  const [showAll, setShowAll] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoles();

  const roles = rolesResponse?.data ?? [];
  const { projectMembers, isProjectMembersLoading, refetchProjectMembers } = useGetProjectMembers(
    projectId,
    page,
    pageSize
  );
  const { isOrgAdmin } = usePermissions();
  const { updateProjectRoleAsync } = useUpdateProjectRole();

  const members = projectMembers?.data ?? [];
  const visibleMembers = showAll ? members : members.slice(0, 10);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    userName: string;
    roleId: string;
    roleName: string;
  } | null>(null);
  const [showRoleConfirmModal, setShowRoleConfirmModal] = useState(false);

  const handleRoleSelect = (userId: string, userName: string, roleId: string, roleName: string) => {
    setPendingRoleChange({ userId, userName, roleId, roleName });
    setShowRoleConfirmModal(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange || !projectId) return;

    const { userId, roleId } = pendingRoleChange;

    setUpdatingMemberId(userId);
    setShowRoleConfirmModal(false);

    try {
      await updateProjectRoleAsync({
        project_id: projectId,
        user_id: userId,
        role_id: roleId,
      });

      await refetchProjectMembers();
    } catch (error) {
    } finally {
      setUpdatingMemberId(null);
      setPendingRoleChange(null);
    }
  };

  const handleCancelRoleChange = () => {
    setShowRoleConfirmModal(false);
    setPendingRoleChange(null);
  };

  const memberOptions = useMemo(() => {
    if (!users || users.length === 0) return [];
    return users.map((user) => ({
      label: user.name || user.email,
      value: user.id,
    }));
  }, [users]);

  const roleOptions = PROJECT_ROLES.map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

  const handleMemberChange = (members: string[]) => {
    setSelectedMembers(members);
    setMemberRoles((prev) => {
      const updated = { ...prev };

      members.forEach((id) => {
        if (!updated[id]) {
          updated[id] = ROLE_TYPE.DEVELOPER;
        }
      });

      Object.keys(updated).forEach((id) => {
        if (!members.includes(id)) {
          delete updated[id];
        }
      });

      return updated;
    });
  };

  const handleAddMember = async () => {
    if (!selectedMembers.length) {
      showToast.error('Please select at least one member');
      return;
    }

    if (!projectId) {
      showToast.error('Project ID is missing');
      return;
    }

    try {
      const payload: AddProjectMembersPayload = {
        project_id: projectId,
        members: selectedMembers.map((memberId) => ({
          user_id: memberId,
          project_role: memberRoles[memberId],
        })),
      };

      await addMembersAsync(payload);
      await refetchProjectMembers();
      setShowAddMemberModal(false);
      setSelectedMembers([]);
      setMemberRoles({});
    } catch (error) {}
  };

  const handleDelete = () => {
    if (!selectedMember || !projectId) return;

    removeProjectMember(
      {
        projectId,
        userId: selectedMember.id,
      },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedMember(null);
        },
      }
    );
  };

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

  if (isProjectMembersLoading) {
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
              Team
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Manage Project members and their roles
            </p>
          </div>
          {isOrgAdmin && selectedApiProject && (
            <WpButton
              size="sm"
              leftIcon={<UserPlus size={15} />}
              onClick={() => setShowAddMemberModal(true)}
            >
              Add Member
            </WpButton>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[minmax(200px,1.5fr)_80px_minmax(160px,1fr)_100px_44px] items-center gap-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-3">
            {['MEMBER', 'ADMIN', 'ROLE', 'STATUS', ''].map((h, i) => (
              <div
                key={i}
                className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-400"
              >
                {h}
              </div>
            ))}
          </div>

          {visibleMembers.length > 0 ? (
            visibleMembers.map((member, index) => {
              const memberName = member.full_name || member.username || 'User';

              const initials = memberName
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const isMemberAdmin = member.role?.toLowerCase().includes('admin');
              const currentRole = roles.find(
                (role) => role.name.toLowerCase() === member.role?.toLowerCase()
              );

              return (
                <div
                  key={member.user_id}
                  className={`flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 md:grid md:grid-cols-[minmax(200px,1.5fr)_80px_minmax(160px,1fr)_100px_44px] md:items-center md:gap-3 md:py-3 ${
                    index !== visibleMembers.length - 1
                      ? 'border-b border-slate-200 dark:border-slate-700'
                      : ''
                  }`}
                >
                  {/* Member info */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-sm font-bold text-slate-100 dark:text-blue-300"
                      style={{ backgroundColor: member.color || '' }}
                    >
                      {initials || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {memberName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.username ?? 'No username'}
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
                      value={currentRole?.id ?? ''}
                      onChange={(e) => {
                        const selectedRole = roles.find((r) => r.id === e.target.value);
                        if (!selectedRole) return;
                        handleRoleSelect(
                          member.user_id,
                          memberName,
                          selectedRole.id,
                          selectedRole.name
                        );
                      }}
                      disabled={
                        !isOrgAdmin ||
                        isMemberAdmin ||
                        isRolesLoading ||
                        updatingMemberId === member.user_id
                      }
                      className="h-8 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 text-[13px] font-medium text-slate-700 dark:text-slate-200 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
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
                    {isOrgAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMember({
                            id: member.user_id,
                            name: memberName,
                          });
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
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No members found
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Add members to your Project.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* View more / less */}
        {!showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Less
            </button>
          </div>
        )}
      </div>
      {showRoleConfirmModal && pendingRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="border-b border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">
                Change Role
              </h2>

              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                Are you sure you want to change{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pendingRoleChange.userName}
                </span>
                &apos;s role to{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pendingRoleChange.roleName}
                </span>
                ?
              </p>
            </div>

            <div className="flex justify-end gap-3 p-5">
              <WpButton variant="secondary" onClick={handleCancelRoleChange}>
                Cancel
              </WpButton>

              <WpButton
                variant="primary"
                onClick={handleConfirmRoleChange}
                isLoading={updatingMemberId === pendingRoleChange.userId}
              >
                OK
              </WpButton>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="border-b border-slate-200 dark:border-slate-700 p-5">
              <h2 className="text-[17px] font-bold text-slate-800 dark:text-slate-100">
                Delete Member
              </h2>

              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {selectedMember?.name}
                </span>
                ?
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

              <WpButton variant="danger" onClick={handleDelete} isLoading={isRemovingMember}>
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex h-[600px] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Add Members
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Select members to add to this project.
                </p>
              </div>

              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMemberModal(false)}
                className="!p-2 text-gray-400 dark:text-slate-500"
              >
                <X size={17} />
              </WpButton>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <WpMultiSelect
                label="Members"
                options={memberOptions}
                value={selectedMembers}
                onChange={handleMemberChange}
                placeholder={isUsersLoading ? 'Loading members...' : 'Select members'}
                disabled={isUsersLoading}
                hint="You can select multiple members to add to this project"
              />

              <div className="mt-5">
                {selectedMembers.length > 0 ? (
                  <>
                    <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Member Roles
                    </p>

                    <div className="space-y-3">
                      {selectedMembers.map((memberId) => {
                        const member = memberOptions.find((m) => m.value === memberId);

                        return (
                          <div
                            key={memberId}
                            className="flex items-center rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-3"
                          >
                            <div className="w-40 text-sm font-medium text-gray-700 dark:text-slate-200">
                              {member?.label}
                            </div>

                            <div className="flex-1">
                              <WpDropdown
                                options={roleOptions}
                                value={memberRoles[memberId]}
                                onChange={(value) =>
                                  setMemberRoles((prev) => ({
                                    ...prev,
                                    [memberId]: value as ROLE_TYPE,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
                    <p className="text-base font-medium text-gray-700 dark:text-slate-200">
                      No members selected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 p-5">
              <WpButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedMembers([]);
                  setMemberRoles({});
                }}
                disabled={isAddingMembers}
              >
                Cancel
              </WpButton>

              <WpButton
                type="button"
                variant="primary"
                size="md"
                disabled={!selectedMembers.length || isAddingMembers}
                onClick={handleAddMember}
              >
                {isAddingMembers
                  ? 'Adding...'
                  : `Add ${
                      selectedMembers.length > 0 ? `${selectedMembers.length} ` : ''
                    }Member${selectedMembers.length !== 1 ? 's' : ''}`}
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MembersSettings;
