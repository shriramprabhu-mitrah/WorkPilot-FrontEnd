'use client';
import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, UserPlus } from 'lucide-react';
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
import DeleteConfirmModal from '@/src/app/components/common/deleteModal';
import AddMemberModal from '../../project/components/addMemberModal';
import MembersList from './memberList';

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

  useEffect(() => {
    const isAnyModalOpen = showEditModal || showDeleteModal || showAddMemberModal;
    if (!isAnyModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showEditModal, showDeleteModal, showAddMemberModal]);

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
        <MembersList
          members={visibleMembers}
          roles={roles}
          isOrgAdmin={isOrgAdmin}
          onEdit={handleOpenEdit}
          onDelete={(member) => {
            setSelectedMember(member);
            setShowDeleteModal(true);
          }}
        />

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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/40 px-4 py-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl bg-white dark:bg-slate-800 shadow-xl">
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-slate-200 dark:border-slate-700 p-4 sm:p-5">
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

            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5">
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

            {/* Footer */}
            <div className="flex shrink-0 flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5">
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
        <DeleteConfirmModal
          title="Delete Member"
          message={`Are you sure you want to remove ${selectedMember?.name || 'this member'}?`}
          isDeleting={isRemovingMember}
          onCancel={() => {
            if (isRemovingMember) return;
            setShowDeleteModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleDelete}
        />
      )}

      {/* Add member modal */}
      {showAddMemberModal && (
        <AddMemberModal
          memberOptions={memberOptions}
          selectedMembers={selectedMembers}
          memberRoles={memberRoles}
          roleOptions={roleOptions}
          isRolesLoading={isRolesLoading}
          isUsersLoading={isUsersLoading}
          isUsersFetching={isUsersFetching}
          isAddingMembers={isAddingMembers}
          onMemberChange={handleMemberChange}
          onSearchChange={setMemberSearch}
          onRoleChange={(memberId, roleId) =>
            setMemberRoles((prev) => ({
              ...prev,
              [memberId]: roleId,
            }))
          }
          onClose={() => setShowAddMemberModal(false)}
          onCancel={() => {
            setShowAddMemberModal(false);
            setSelectedMembers([]);
            setMemberRoles({});
          }}
          onSubmit={handleAddMember}
        />
      )}
    </>
  );
};

export default MembersSettings;
