'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Project, Sprint } from '../types/project';
import AddSprintModal from './addSprint';
import EditProjectModal from './editProjectModal';
import { WpButton } from '@/src/app/components/common/button';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import { useGetSprintUserStories } from '../../tasks/hooks/useUserStory';
import {
  useAddProjectMembers,
  useDeleteProject,
  useRemoveProjectMember,
  useUpdateProjectRole,
} from '@/src/modules/project/hooks/useProject';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { showToast } from '@/src/utils/toast';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useGetRoles } from '@/src/modules/settings/hooks/useSettings';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { AddProjectMembersPayload, ProjectDetailMember, SprintDetail } from '@/src/types/project';
import { setSelectedProject } from '@/src/store/slices/project';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { projectService } from '@/src/services/project';
import StartSprintModal from '../../backlog/components/startSprintModal';
import CompleteSprintModal from '../../backlog/components/CompleteSprint';
import { sprintService } from '@/src/services/sprint';
import { logger } from '@/src/lib/utils/logger';
import { useDebounce } from '@/src/hooks/useDebounce';
import SprintList from './sprintList';
import ProjectInfoCard from './projectInfoCard';
import AddMemberModal from './addMemberModal';
import ViewMembersModal from './viewMembersModal';
interface ProjectDetailProps {
  project: Project & { id?: string };
}

const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const { push } = useOrgNavigation();
  const dispatch = useAppDispatch();
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isRefreshingMembers, setIsRefreshingMembers] = useState(false);
  const [isRefreshingSprints, setIsRefreshingSprints] = useState(false);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(
    null
  );
  const { canEditProject, canDeleteProject, canCreateSprint, canEditSprint, canManageProjects } =
    usePermissions();
  const [showStartSprintModal, setShowStartSprintModal] = useState(false);
  const [showCompleteSprintModal, setShowCompleteSprintModal] = useState(false);

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isStartingSprint, setIsStartingSprint] = useState(false);
  const [isCompletingSprint, setIsCompletingSprint] = useState(false);
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoles();
  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});

  const { users, isUsersLoading, isUsersFetching } = useGetOrganizationUsers(
    1,
    50,
    true,
    debouncedMemberSearch || undefined,
    showAddMemberModal
  );
  const { deleteProjectAsync, isDeletingProject } = useDeleteProject();
  const { removeMemberAsync, isRemovingMember } = useRemoveProjectMember();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const { isUpdatingProjectRole, updateProjectRoleAsync } = useUpdateProjectRole();
  const { sprints: apiSprints, isLoadingSprints, refetchSprints } = useGetSprints(project.id || '');

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);

  const mapApiSprintToUiSprint = (apiSprint: SprintDetail): Sprint => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const mapStatus = (status: string): 'Planned' | 'Active' | 'Completed' => {
      const normalized = status.toLowerCase();
      if (normalized === 'active' || normalized === 'in_progress') return 'Active';
      if (normalized === 'completed' || normalized === 'done') return 'Completed';
      return 'Planned';
    };

    return {
      id: apiSprint.id,
      name: apiSprint.name,
      startDate: formatDate(apiSprint.start_date),
      endDate: formatDate(apiSprint.end_date),
      status: mapStatus(apiSprint.status),
      tasks: 0,
      goal: apiSprint.goal,
    };
  };

  const sprints = useMemo(() => {
    if (apiSprints && Array.isArray(apiSprints)) {
      return apiSprints.map(mapApiSprintToUiSprint);
    }
    if (selectedApiProject?.sprints && Array.isArray(selectedApiProject.sprints)) {
      return selectedApiProject.sprints.map(mapApiSprintToUiSprint);
    }
    return [];
  }, [apiSprints, selectedApiProject?.sprints]);

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

  const handleAddMember = async () => {
    if (!selectedMembers || selectedMembers.length === 0) {
      showToast.error('Please select at least one member');
      return;
    }
    if (!project.id) {
      showToast.error('Project ID is missing');
      return;
    }
    try {
      const payload: AddProjectMembersPayload = {
        project_id: project.id,
        members: selectedMembers.map((memberId) => ({
          user_id: memberId,
          project_role: memberRoles[memberId],
        })),
      };
      await addMembersAsync(payload);
      setShowAddMemberModal(false);
      setIsRefreshingMembers(true);
      const res = await projectService.getProjectDetail(project.id);
      if (res.data) {
        const { creator, ...rest } = res.data;
        dispatch(setSelectedProject({ ...rest, owner: creator ?? rest.owner ?? 'Unassigned' }));
      }
      setSelectedMembers([]);
      setMemberRoles({});
    } catch {
      // Error is already handled by the mutation
    } finally {
      setIsRefreshingMembers(false);
    }
  };

  const handleSprintClick = (sprint: Sprint) => {
    push(`/projects/sprints/tasks?sprintId=${sprint.id}&projectId=${project.id}`);
  };

  const confirmDeleteProject = async () => {
    if (!project.id) {
      showToast.error('Project ID is missing');
      return;
    }
    try {
      await deleteProjectAsync(project.id);
      setShowDeleteConfirm(false);
      push('/projects');
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !project.id) {
      showToast.error('Invalid member or project');
      return;
    }
    try {
      await removeMemberAsync({ projectId: project.id, userId: memberToRemove.userId });
      setMemberToRemove(null);
      const res = await projectService.getProjectDetail(project.id);
      if (res.data) {
        const { creator, ...rest } = res.data;
        dispatch(setSelectedProject({ ...rest, owner: creator ?? rest.owner ?? 'Unassigned' }));
      }
    } catch {}
  };

  const updateMember = async (member: ProjectDetailMember) => {
    if (!canManageProjects()) {
      showToast.error('You do not have permission to update member roles');
      return;
    }
    if (!selectedRole) return;
    if (!selectedApiProject?.id) return;
    try {
      setUpdatingMemberId(member.user_id);
      await updateProjectRoleAsync({
        project_id: selectedApiProject.id,
        user_id: member.user_id,
        role_id: selectedRole,
        project_role: selectedRole,
      });
      setEditingMemberId(null);
      setSelectedRole('');
      const res = await projectService.getProjectDetail(selectedApiProject.id);
      if (res?.data) {
        const { creator, ...rest } = res.data;
        dispatch(setSelectedProject({ ...rest, owner: creator ?? rest.owner ?? 'Unassigned' }));
      }
    } catch {
      showToast.error('Failed to update member role');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const roleOptions = useMemo(() => {
    return (rolesResponse?.data ?? []).map((role) => ({
      value: role.id,
      label: role.name,
    }));
  }, [rolesResponse?.data]);

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
      const defaultRole = roleOptions[0]?.value || '';
      selected.forEach((id) => {
        if (!updated[id]) updated[id] = defaultRole;
      });
      Object.keys(updated).forEach((id) => {
        if (!selected.includes(id)) delete updated[id];
      });
      return updated;
    });
  };
  const handleSprintSuccess = async () => {
    try {
      setIsRefreshingSprints(true);
    } finally {
      setIsRefreshingSprints(false);
    }
  };
  const handleStartSprint = async (payload: { start_date: string; end_date: string }) => {
    if (!selectedSprint || !project.id) return;

    try {
      setIsStartingSprint(true);

      await sprintService.startSprint(project.id, selectedSprint.id, payload);

      setShowStartSprintModal(false);
      setSelectedSprint(null);

      await refetchSprints();
    } catch {
      // Error is already handled by apiService
    } finally {
      setIsStartingSprint(false);
    }
  };
  const handleCompleteSprint = async () => {
    if (!selectedSprint || !project.id) return;

    try {
      setIsCompletingSprint(true);

      await sprintService.completeSprint(project.id, selectedSprint.id);

      setShowCompleteSprintModal(false);
      setSelectedSprint(null);

      await refetchSprints();
    } catch (error) {
      logger.log(error);
      // Error is already handled by apiService
    } finally {
      setIsCompletingSprint(false);
    }
  };
  const { userStories: sprintUserStories } = useGetSprintUserStories(
    project.id || '',
    selectedSprint?.id || '',
    !!selectedSprint && showCompleteSprintModal
  );
  const completedUserStories = sprintUserStories.filter(
    (story) => story.status === 'completed'
  ).length;

  const inProgressUserStories = sprintUserStories.filter(
    (story) => story.status === 'in_progress'
  ).length;

  const handleStartEditMember = (member: ProjectDetailMember) => {
    setEditingMemberId(member.user_id);
    const matchingRole = rolesResponse?.data?.find(
      (r) => r.id === member.role || r.name.toLowerCase() === member.role?.toLowerCase()
    );
    setSelectedRole(matchingRole?.id || member.role || '');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className="text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-700 dark:text-slate-200"
          onClick={() => push('/projects')}
        >
          Projects
        </span>
        <ChevronRight size={14} className="text-gray-400 dark:text-slate-500" />
        <span className="font-medium text-gray-900 dark:text-slate-100">{project?.name}</span>
      </div>

      {/* Project info card */}
      <ProjectInfoCard
        project={project}
        sprintsCount={sprints?.length ?? 0}
        ownerName={selectedApiProject?.owner || project?.owner || 'Not assigned'}
        teamSize={selectedApiProject?.members?.length || project?.members?.length || 0}
        members={selectedApiProject?.members}
        isUpdatingProject={isUpdatingProject}
        isRefreshingMembers={isRefreshingMembers}
        canEditProject={canEditProject}
        canDeleteProject={canDeleteProject}
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteConfirm(true)}
        onViewMembers={() => setShowViewMembersModal(true)}
      />

      {/* Sprints section header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-200">Sprints</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Plan, manage, and track your project sprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageProjects() && (
            <WpButton variant="secondary" size="md" onClick={() => setShowAddMemberModal(true)}>
              + Add Member
            </WpButton>
          )}

          {canCreateSprint && (
            <WpButton variant="primary" size="md" onClick={() => setShowAddSprintModal(true)}>
              + Add Sprint
            </WpButton>
          )}
        </div>
      </div>

      <SprintList
        sprints={sprints}
        isLoading={isLoadingSprints || isRefreshingSprints}
        isRefreshingSprints={isRefreshingSprints}
        expandedSprint={expandedSprint}
        canCreateSprint={canCreateSprint}
        canEditSprint={canEditSprint}
        onAddSprint={() => setShowAddSprintModal(true)}
        onSprintClick={handleSprintClick}
        onToggleExpand={(sprintId) =>
          setExpandedSprint(expandedSprint === sprintId ? null : sprintId)
        }
        onStartSprint={(sprint) => {
          setSelectedSprint(sprint);
          setShowStartSprintModal(true);
        }}
        onCompleteSprint={(sprint) => {
          setSelectedSprint(sprint);
          setShowCompleteSprintModal(true);
        }}
      />

      {showAddSprintModal && (
        <AddSprintModal
          projectId={project.id || ''}
          onClose={() => setShowAddSprintModal(false)}
          onSuccess={handleSprintSuccess}
        />
      )}

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onLoadingChange={setIsUpdatingProject}
        />
      )}
      {showStartSprintModal && selectedSprint && (
        <StartSprintModal
          sprint={{
            id: selectedSprint.id,
            name: selectedSprint.name,
          }}
          onClose={() => {
            setShowStartSprintModal(false);
            setSelectedSprint(null);
          }}
          isStarting={isStartingSprint}
          onStart={handleStartSprint}
        />
      )}
      {showCompleteSprintModal && selectedSprint && (
        <CompleteSprintModal
          sprint={{
            id: selectedSprint.id,
            name: selectedSprint.name,
          }}
          completedUserStories={completedUserStories}
          inProgressUserStories={inProgressUserStories}
          onClose={() => {
            setShowCompleteSprintModal(false);
            setSelectedSprint(null);
          }}
          isCompleting={isCompletingSprint}
          onComplete={handleCompleteSprint}
        />
      )}
      {/* Add Member modal */}
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
            setMemberRoles((prev) => ({ ...prev, [memberId]: roleId }))
          }
          onClose={() => setShowAddMemberModal(false)}
          onCancel={() => {
            setShowAddMemberModal(false);
            setSelectedMembers([]);
          }}
          onSubmit={handleAddMember}
        />
      )}

      {/* Delete project modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Delete Project
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">
                Are you sure you want to delete <strong>{project?.name}</strong>? All sprints,
                tasks, and data associated with this project will be permanently removed.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <WpButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingProject}
                >
                  Cancel
                </WpButton>
                <WpButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={confirmDeleteProject}
                  disabled={isDeletingProject}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  {isDeletingProject ? 'Deleting...' : 'Delete Project'}
                </WpButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View members modal */}
      {showViewMembersModal && (
        <ViewMembersModal
          members={selectedApiProject?.members}
          roles={rolesResponse?.data}
          roleOptions={roleOptions}
          isRolesLoading={isRolesLoading}
          canManage={canManageProjects()}
          editingMemberId={editingMemberId}
          selectedRole={selectedRole}
          updatingMemberId={updatingMemberId}
          isUpdatingProjectRole={isUpdatingProjectRole}
          onClose={() => setShowViewMembersModal(false)}
          onStartEdit={handleStartEditMember}
          onCancelEdit={() => {
            setEditingMemberId(null);
            setSelectedRole('');
          }}
          onSelectRole={setSelectedRole}
          onSaveRole={updateMember}
          onRequestRemove={setMemberToRemove}
        />
      )}

      {/* Remove member confirm modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Remove Member
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Remove member from project
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">
                Are you sure you want to remove <strong>{memberToRemove.name}</strong> from this
                project? They will lose access to all project resources.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <WpButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setMemberToRemove(null)}
                  disabled={isRemovingMember}
                >
                  Cancel
                </WpButton>
                <WpButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleRemoveMember}
                  disabled={isRemovingMember}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  {isRemovingMember ? 'Removing...' : 'Remove Member'}
                </WpButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
