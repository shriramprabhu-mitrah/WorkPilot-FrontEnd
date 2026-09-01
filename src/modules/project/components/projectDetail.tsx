'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, X, Pencil, Trash2, Check, Loader2 } from 'lucide-react';
import { Member, Project, Sprint } from '../types/project';
import AddSprintModal from './addSprint';
import EditProjectModal from './editProjectModal';
import { useRouter } from 'next/navigation';
import { WpButton } from '@/src/app/components/common/button';
import { WpMultiSelect } from '@/src/app/components/common/multi-select';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import { useGetSprintUserStories } from '../../tasks/hooks/useUserStory';

import {
  useAddProjectMembers,
  useDeleteProject,
  useGetProjectDetail,
  useRemoveProjectMember,
  useUpdateProjectRole,
} from '@/src/modules/project/hooks/useProject';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import { showToast } from '@/src/utils/toast';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useGetRoles } from '@/src/modules/settings/hooks/useSettings';
import { useAppSelector, useAppDispatch } from '@/src/store';
import {
  AddProjectMembersPayload,
  ProjectDetailMember,
  ProjectMember,
  SprintDetail,
} from '@/src/types/project';
import { setSelectedProject } from '@/src/store/slices/project';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { projectService } from '@/src/services/project';
import StartSprintModal from '../../backlog/components/startSprintModal';
import CompleteSprintModal from '../../backlog/components/CompleteSprint';
import { sprintService } from '@/src/services/sprint';
interface ProjectDetailProps {
  project: Project & { id?: string };
}

const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const router = useRouter();
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
  const {
    canEditProject,
    canDeleteProject,
    canCreateSprint,
    canEditSprint,
    isOrgAdmin,
    canManageProjects,
  } = usePermissions();
  const [showStartSprintModal, setShowStartSprintModal] = useState(false);
  const [showCompleteSprintModal, setShowCompleteSprintModal] = useState(false);

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isStartingSprint, setIsStartingSprint] = useState(false);
  const [isCompletingSprint, setIsCompletingSprint] = useState(false);
  const { data: rolesResponse, isLoading: isRolesLoading } = useGetRoles();
  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();
  const { users, isUsersLoading } = useGetOrganizationUsers(1, 50, true);
  const { deleteProjectAsync, isDeletingProject } = useDeleteProject();
  const { removeMemberAsync, isRemovingMember } = useRemoveProjectMember();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const { updateProjectRole, isUpdatingProjectRole, updateProjectRoleAsync } =
    useUpdateProjectRole();
  const { sprints: apiSprints, isLoadingSprints, refetchSprints } = useGetSprints(project.id || '');

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const currentUser = useAppSelector((state) => state.user);

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

    const refreshSprints = async () => {
      try {
        setIsRefreshingSprints(true);
        await refetchSprints();
      } finally {
        setIsRefreshingSprints(false);
      }
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
    if (!users || users.length === 0) return [];
    return users.map((user) => ({
      label: user.name || user.email,
      value: user.id,
    }));
  }, [users]);

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {}
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getColorFromId = (userId: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-cyan-500',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
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
    } catch (error) {
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

  const handleMemberChange = (members: string[]) => {
    setSelectedMembers(members);
    setMemberRoles((prev) => {
      const updated = { ...prev };
      const defaultRole = roleOptions[0]?.value || '';
      members.forEach((id) => {
        if (!updated[id]) updated[id] = defaultRole;
      });
      Object.keys(updated).forEach((id) => {
        if (!members.includes(id)) delete updated[id];
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
    } catch (error) {
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
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className="text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-700 dark:hover:text-slate-200"
          onClick={() => push('/projects')}
        >
          Projects
        </span>
        <ChevronRight size={14} className="text-gray-400 dark:text-slate-500" />
        <span className="font-medium text-gray-900 dark:text-slate-100">{project?.name}</span>
      </div>

      {/* Project info card */}
      <div className="relative rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
        {isUpdatingProject && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-slate-900/70">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                Updating project...
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              {project?.initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {project?.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                {project?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-50 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
              {project?.status}
            </span>
            {canEditProject && (
              <WpButton
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="!p-2"
                aria-label="Edit project"
              >
                <Pencil size={16} />
              </WpButton>
            )}
            {canDeleteProject && (
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="!p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete project"
              >
                <Trash2 size={16} />
              </WpButton>
            )}
          </div>
        </div>

        <div className="my-5 border-t border-gray-100 dark:border-slate-700" />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500">CREATED</p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
              {project?.date}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500">
              TOTAL SPRINTS
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
              {sprints?.length}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500">
              PROJECT OWNER
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
              {selectedApiProject?.owner || project?.owner || 'Not assigned'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500">TEAM SIZE</p>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">
              {selectedApiProject?.members?.length || project.members.length} members
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500 mb-2">
              TEAM MEMBERS
            </p>
            {isRefreshingMembers ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-r-transparent" />
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                  updating...
                </span>
              </div>
            ) : selectedApiProject?.members && selectedApiProject.members.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {selectedApiProject.members.slice(0, 5).map((member, index) => (
                    <div
                      key={member.user_id}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 text-xs font-semibold text-white ${getColorFromId(member.user_id)}`}
                      style={{ zIndex: 5 - index }}
                      title={member.full_name || member.username}
                    >
                      {getInitials(member.full_name || member.username)}
                    </div>
                  ))}
                  {selectedApiProject.members.length > 5 && (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 bg-gray-300 dark:bg-slate-600 text-xs font-semibold text-gray-700 dark:text-slate-100"
                      style={{ zIndex: 0 }}
                    >
                      +{selectedApiProject.members.length - 5}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowViewMembersModal(true)}
                  className="whitespace-nowrap text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">No members</p>
            )}
          </div>
        </div>
      </div>

      {/* Sprints section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Sprints</h2>
        <div className="flex items-center gap-3">
          {canManageProjects() && (
            <WpButton variant="primary" size="md" onClick={() => setShowAddMemberModal(true)}>
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

      {/* Sprint list */}
      <div className="space-y-3">
        {isLoadingSprints || isRefreshingSprints ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                {isRefreshingSprints ? 'Loading updated sprints...' : 'Loading sprint details...'}
              </p>
            </div>
          </div>
        ) : sprints.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-16">
            <div className="flex flex-col items-center justify-center">
              <img src="/images/agile method-amico.svg" alt="No Sprints" className="h-72 w-72" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-slate-100">
                No Sprints Found
              </h2>
              <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                No sprints have been created for this project.
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                Create your first sprint to start planning work.
              </p>
              {canCreateSprint && (
                <WpButton
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddSprintModal(true)}
                  className="mt-8"
                >
                  + Add Sprint
                </WpButton>
              )}
            </div>
          </div>
        ) : (
          sprints.map((sprint) => {
            const isExpanded = expandedSprint === sprint.id;
            return (
              <div
                key={sprint.id}
                className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex w-full items-center justify-between p-5">
                  <button
                    type="button"
                    onClick={() => handleSprintClick(sprint)}
                    className="flex flex-1 items-start text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                          {sprint.name}
                        </h3>
                        <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                          {sprint.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                        {sprint.startDate || 'No start date'} → {sprint.endDate || 'No end date'}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {sprint.status === 'Planned' && canEditSprint && (
                      <WpButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setShowStartSprintModal(true);
                        }}
                      >
                        Start Sprint
                      </WpButton>
                    )}

                    {sprint.status === 'Active' && canEditSprint && (
                      <WpButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setShowCompleteSprintModal(true);
                        }}
                      >
                        Complete Sprint
                      </WpButton>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
                      className="rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 dark:text-slate-500 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-slate-700 p-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
                          START DATE
                        </p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                          {sprint.startDate || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
                          END DATE
                        </p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                          {sprint.endDate || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
                          TASKS
                        </p>
                        <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                          {sprint.tasks}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex h-[600px] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Add Members
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-100">
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
              <div className="mt-5 flex-1">
                {selectedMembers.length > 0 ? (
                  <>
                    <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-300">
                      Member Roles
                    </p>
                    <div className="space-y-3 pr-2">
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
                            <div className="flex-1 -mb-5">
                              <WpDropdown
                                options={roleOptions}
                                value={memberRoles[memberId] || roleOptions[0]?.value}
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
                  <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
                    <div className="text-center">
                      <p className="text-base font-medium text-gray-700 dark:text-slate-200">
                        No members selected
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                        {/* Select members above to assign project roles. */}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 p-5">
              <WpButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedMembers([]);
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
                  : `Add ${selectedMembers.length > 0 ? `${selectedMembers.length} ` : ''}Member${selectedMembers.length !== 1 ? 's' : ''}`}
              </WpButton>
            </div>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Team Members
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {selectedApiProject?.members?.length || 0} members in this project
                </p>
              </div>
              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowViewMembersModal(false)}
                className="!p-2 text-gray-400 dark:text-slate-500"
              >
                <X size={17} />
              </WpButton>
            </div>
            <div className="max-h-[60vh] overflow-y-auto overflow-x-visible p-5">
              <div className="space-y-2">
                {selectedApiProject?.members && selectedApiProject.members.length > 0 ? (
                  selectedApiProject.members.map((member) => {
                    // Check if this member is an org admin
                    const memberIsOrgAdmin =
                      member.role?.toLowerCase() === 'org_admin' ||
                      member.role?.toLowerCase() === 'org admin' ||
                      member.role?.toLowerCase() === 'organization admin' ||
                      member.role?.toLowerCase().replace(/[\s_-]+/g, '') === 'orgadmin';

                    // Org admins should not have edit/delete buttons for themselves
                    const canEdit = !memberIsOrgAdmin && canManageProjects();
                    const canDelete = !memberIsOrgAdmin && canManageProjects();

                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-3 transition-all hover:border-gray-300 dark:hover:border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${getColorFromId(member.user_id)}`}
                          >
                            {getInitials(member.full_name || member.username)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {member.full_name || member.username}
                            </p>
                            {editingMemberId === member.user_id ? (
                              <div className="mt-1 w-50 relative">
                                <WpDropdown
                                  options={roleOptions}
                                  value={selectedRole}
                                  onChange={(value) => setSelectedRole(value)}
                                  placeholder={isRolesLoading ? 'Loading roles...' : 'Select Role'}
                                  disabled={isRolesLoading}
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-slate-400 capitalize flex items-center gap-2">
                                {updatingMemberId === member.user_id ? (
                                  <>
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                    Updating...
                                  </>
                                ) : (
                                  rolesResponse?.data?.find(
                                    (r) =>
                                      r.id === member.role ||
                                      r.name.toLowerCase() === member.role?.toLowerCase()
                                  )?.name || member.role?.replace('_', ' ')
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingMemberId === member.user_id ? (
                            <>
                              <WpButton
                                variant="ghost"
                                size="sm"
                                className="!p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                onClick={() => updateMember(member)}
                                disabled={isUpdatingProjectRole}
                              >
                                <Check size={16} />
                              </WpButton>
                              <WpButton
                                variant="ghost"
                                size="sm"
                                className="!p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                                onClick={() => {
                                  setEditingMemberId(null);
                                  setSelectedRole('');
                                }}
                                disabled={isUpdatingProjectRole}
                              >
                                <X size={16} />
                              </WpButton>
                              {canDelete && (
                                <WpButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setMemberToRemove({
                                      userId: member.user_id,
                                      name: member.full_name || member.username,
                                    })
                                  }
                                  className="!p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  aria-label="Remove member"
                                >
                                  <Trash2 size={16} />
                                </WpButton>
                              )}
                            </>
                          ) : (
                            <>
                              {canEdit && (
                                <WpButton
                                  variant="ghost"
                                  size="sm"
                                  className="!p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  onClick={() => {
                                    setEditingMemberId(member.user_id);
                                    const matchingRole = rolesResponse?.data?.find(
                                      (r) =>
                                        r.id === member.role ||
                                        r.name.toLowerCase() === member.role?.toLowerCase()
                                    );
                                    setSelectedRole(matchingRole?.id || member.role || '');
                                  }}
                                >
                                  <Pencil size={16} />
                                </WpButton>
                              )}
                              {canDelete && (
                                <WpButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setMemberToRemove({
                                      userId: member.user_id,
                                      name: member.full_name || member.username,
                                    })
                                  }
                                  className="!p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  aria-label="Remove member"
                                >
                                  <Trash2 size={16} />
                                </WpButton>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      No members in this project yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 p-5">
              <WpButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setShowViewMembersModal(false)}
              >
                Close
              </WpButton>
            </div>
          </div>
        </div>
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
