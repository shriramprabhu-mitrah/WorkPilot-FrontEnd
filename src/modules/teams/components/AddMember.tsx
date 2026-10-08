'use client';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Trash2, UserPlus, Pencil } from 'lucide-react';
import { WpMultiSelect } from '@/src/app/components/common/multi-select';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import {
  useAddProjectMembers,
  useUpdateProjectRole,
  useGetProjectsWithSprints,
} from '@/src/modules/project/hooks/useProject';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import { AddProjectMembersPayload } from '@/src/types/project';
import { showToast } from '@/src/utils/toast';
import { WpButton } from '@/src/app/components/common/button';
import { useGetProjectMembers, useRemoveProjectMember } from '../hooks/useTeams';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { useGetRoles } from '../../settings/hooks/useSettings';
import { Search } from 'lucide-react';
import { useDebounce } from '@/src/hooks/useDebounce';

const MembersSettings = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);

  const { users, isUsersLoading, isUsersFetching } = useGetOrganizationUsers(
    1,
    50,
    true,
    debouncedMemberSearch || undefined,
    showAddMemberModal
  );
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});
  const { mutate: removeProjectMember, isPending: isRemovingMember } = useRemoveProjectMember();
  const [nameSearch, setNameSearch] = useState('');
  const debouncedNameSearch = useDebounce(nameSearch, 500);
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
    pageSize,
    debouncedNameSearch || undefined
  );
  const { isOrgAdmin } = usePermissions();
  const { updateProjectRoleAsync } = useUpdateProjectRole();

  const members = projectMembers?.data ?? [];
  const visibleMembers = showAll ? members : members.slice(0, 10);

  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [editingMember, setEditingMember] = useState<{
    userId: string;
    name: string;
    username: string;
    originalRoleId: string;
  } | null>(null);
  const [editRoleId, setEditRoleId] = useState('');

  const handleOpenEdit = (member: {
    userId: string;
    name: string;
    username: string;
    roleId: string;
  }) => {
    setEditingMember({
      userId: member.userId,
      name: member.name,
      username: member.username,
      originalRoleId: member.roleId,
    });
    setEditRoleId(member.roleId);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (isUpdatingRole) return;
    setShowEditModal(false);
    setEditingMember(null);
    setEditRoleId('');
  };

  // Update button is enabled only when the role was actually changed
  const isRoleChanged =
    !!editingMember && !!editRoleId && editRoleId !== editingMember.originalRoleId;

  const handleUpdateRole = async () => {
    if (!editingMember || !projectId || !isRoleChanged) return;

    setIsUpdatingRole(true);
    try {
      // API is called only here, when Update is clicked
      await updateProjectRoleAsync({
        project_id: projectId,
        user_id: editingMember.userId,
        role_id: editRoleId,
      });

      await refetchProjectMembers();
      setShowEditModal(false);
      setEditingMember(null);
      setEditRoleId('');
    } catch {
      // error toast handled inside the hook
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const memberOptions = useMemo(() => {
    const fetched = users.map((user) => ({
      label: user.name || user.email,
      value: user.id,
    }));

    const fetchedIds = new Set(fetched.map((o) => o.value));
    const selectedMissing = selectedMembers
      .filter((id) => !fetchedIds.has(id))
      .map((id) => ({ label: selectedLabels[id] ?? id, value: id }));

    return [...selectedMissing, ...fetched];
  }, [users, selectedMembers, selectedLabels]);

  const roleOptions = useMemo(() => {
    return roles.map((role) => ({
      value: role.id,
      label: role.name,
    }));
  }, [roles]);

  const handleMemberChange = (selected: string[]) => {
    setSelectedMembers(selected);
  
    setSelectedLabels((prev) => {
      const next: Record<string, string> = {};
      selected.forEach((id) => {
        const user = users.find((u) => u.id === id);
        next[id] = user ? user.name || user.email : (prev[id] ?? id);
      });
      return next;
    });
  
    setMemberRoles((prev) => {
      const updated = { ...prev };
      selected.forEach((id) => {
        if (!updated[id]) updated[id] = roles.length > 0 ? roles[0].id : '';
      });
      Object.keys(updated).forEach((id) => {
        if (!selected.includes(id)) delete updated[id];
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

    if (roles.length === 0) {
      showToast.error('No roles available. Please create roles first.');
      return;
    }

    try {
      const payload: AddProjectMembersPayload = {
        project_id: projectId,
        members: selectedMembers.map((memberId) => ({
          user_id: memberId,
          role_id: memberRoles[memberId],
        })),
      };

      await addMembersAsync(payload);
      await refetchProjectMembers();
      setShowAddMemberModal(false);
      setSelectedMembers([]);
      setMemberRoles({});
    } catch {}
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
      <div className="w-full pb-10 px-3 sm:px-5">
        {/* Header */}
        <div className="flex min-h-[65px] flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              Team
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-100">
              Manage Project members and their roles
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative h-9 w-full sm:w-[220px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 z-10"
              />
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search members..."
                className="h-9 w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-3 text-sm text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            {isOrgAdmin && selectedApiProject && (
              <WpButton
                size="sm"
                leftIcon={<UserPlus size={15} />}
                onClick={() => setShowAddMemberModal(true)}
                className="w-full sm:w-auto shrink-0"
              >
                Add Member
              </WpButton>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[minmax(220px,1.5fr)_minmax(220px,1fr)_120px_88px] items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-5 py-3">
            {['MEMBER', 'ROLE', 'STATUS', ''].map((h, i) => (
              <div
                key={i}
                className={`text-[11px] font-bold tracking-wide text-slate-500 dark:text-slate-100`}
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

              const isOrgAdminRole = member.role?.toLowerCase() === 'org_admin';

              const currentRole = roles.find(
                (role) => role.name.toLowerCase() === member.role?.toLowerCase()
              );

              return (
                <div
                  key={member.user_id}
                  className={`group flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 sm:px-5 lg:grid lg:grid-cols-[minmax(220px,1.5fr)_minmax(220px,1fr)_120px_88px] lg:items-center lg:gap-4 ${
                    index !== visibleMembers.length - 1
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
                      {initials || 'U'}
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

                  {/* Role (display only) */}
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

                  {/* Status */}
                  <div className="flex items-center gap-3 lg:block">
                    <span className="min-w-[60px] text-xs font-medium text-slate-400 dark:text-slate-500 lg:hidden">
                      Status
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  {/* Actions: Edit + Delete */}
                  <div className="flex items-center justify-end gap-1 lg:justify-center">
                    {isOrgAdmin && !isOrgAdminRole && (
                      <>
                        <WpButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleOpenEdit({
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
                          onClick={() => {
                            setSelectedMember({
                              id: member.user_id,
                              name: memberName,
                            });
                            setShowDeleteModal(true);
                          }}
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

        {/* View more / less */}
        {!showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <WpButton variant="secondary" size="sm" onClick={() => setShowAll(true)}>
              View More
            </WpButton>
          </div>
        )}
        {showAll && members.length > 10 && (
          <div className="mt-4 flex justify-center">
            <WpButton variant="secondary" size="sm" onClick={() => setShowAll(false)}>
              View Less
            </WpButton>
          </div>
        )}
      </div>

      {/* Edit member popup */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-[17px] font-bold text-slate-800 dark:text-slate-100">
                  Edit Member
                </h2>
                <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
                  You can only change the role of this member.
                </p>
              </div>
              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseEdit}
                disabled={isUpdatingRole}
                className="!p-2 ml-2 shrink-0 text-gray-400 dark:text-slate-500"
              >
                <X size={17} />
              </WpButton>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {/* Name (disabled) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Name
                </label>
                <input
                  type="text"
                  value={editingMember.name}
                  disabled
                  readOnly
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
                />
              </div>

              {/* Username (disabled) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  value={editingMember.username ? `@${editingMember.username}` : 'No username'}
                  disabled
                  readOnly
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
                />
              </div>

              {/* Status (disabled) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Status
                </label>
                <input
                  type="text"
                  value="Active"
                  disabled
                  readOnly
                  className="h-10 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-500 outline-none dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
                />
              </div>

              {/* Role (editable) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Role
                </label>
                <WpDropdown
                  options={roleOptions}
                  value={editRoleId}
                  onChange={(value) => setEditRoleId(value)}
                  disabled={isRolesLoading || isUpdatingRole}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5">
              <WpButton
                variant="secondary"
                onClick={handleCloseEdit}
                disabled={isUpdatingRole}
                className="w-full sm:w-auto"
              >
                Cancel
              </WpButton>

              <WpButton
                variant="primary"
                onClick={handleUpdateRole}
                isLoading={isUpdatingRole}
                disabled={!isRoleChanged || isUpdatingRole}
                className="w-full sm:w-auto"
              >
                Update
              </WpButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            <div className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
              <h2 className="text-base sm:text-[17px] font-bold text-slate-800 dark:text-slate-100">
                Delete Member
              </h2>

              <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {selectedMember?.name}
                </span>
                ?
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-5">
              <WpButton
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedMember(null);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </WpButton>

              <WpButton
                variant="danger"
                onClick={handleDelete}
                isLoading={isRemovingMember}
                className="w-full sm:w-auto"
              >
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="flex h-auto max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between border-b border-gray-100 dark:border-slate-700 p-4 sm:p-5">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Add Members
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-100">
                  Select members to add to this project.
                </p>
              </div>

              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMemberModal(false)}
                className="!p-2 text-gray-400 dark:text-slate-500 ml-2 shrink-0"
              >
                <X size={17} />
              </WpButton>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {isRolesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500 dark:text-slate-400">Loading roles...</div>
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 mb-4">
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                    No roles available. Please create roles in Settings → Permissions before adding
                    members.
                  </p>
                </div>
              ) : null}

              <WpMultiSelect
                label="Members"
                options={memberOptions}
                value={selectedMembers}
                onChange={handleMemberChange}
                onSearchChange={setMemberSearch}
                isSearching={isUsersFetching}
                serverSideSearch
                placeholder={isUsersLoading ? 'Loading members...' : 'Select members'}
                disabled={isRolesLoading || roles.length === 0}
                hint="Type to search, or pick from the dropdown"
              />

              <div className="mt-5">
                {selectedMembers.length > 0 ? (
                  <>
                    <p className="mb-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-100">
                      Member Roles
                    </p>

                    <div className="space-y-3">
                      {selectedMembers.map((memberId) => {
                        const member = memberOptions.find((m) => m.value === memberId);

                        return (
                          <div
                            key={memberId}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 sm:px-4 py-3"
                          >
                            <div className="sm:w-40 text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 truncate">
                              {member?.label}
                            </div>

                            <div className="flex-1">
                              <WpDropdown
                                options={roleOptions}
                                value={memberRoles[memberId]}
                                onChange={(value) =>
                                  setMemberRoles((prev) => ({
                                    ...prev,
                                    [memberId]: value,
                                  }))
                                }
                                disabled={isRolesLoading}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[200px] sm:min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
                    <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-slate-200">
                      No members selected
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-100 dark:border-slate-700 p-4 sm:p-5">
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
                className="w-full sm:w-auto"
              >
                Cancel
              </WpButton>

              <WpButton
                type="button"
                variant="primary"
                size="md"
                disabled={!selectedMembers.length || isAddingMembers || roles.length === 0}
                onClick={handleAddMember}
                className="w-full sm:w-auto"
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