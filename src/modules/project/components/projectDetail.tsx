'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Pencil, Trash2 } from 'lucide-react';
import { Project, Sprint } from '../types/project';
import AddSprintModal from './addSprint';
import EditProjectModal from './editProjectModal';
import { useRouter } from 'next/navigation';
import { WpButton } from '@/src/app/components/common/button';
import { WpMultiSelect } from '@/src/app/components/common/multi-select';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import {
  useAddProjectMembers,
  useGetProjectDetail,
  useDeleteProject,
  useRemoveProjectMember,
} from '@/src/modules/project/hooks/useProject';
import { showToast } from '@/src/utils/toast';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { SprintDetail } from '@/src/types/project';
import { setSelectedProject } from '@/src/store/slices/project';
import { ROLE_TYPE } from '@/src/app/components/common/enum';

interface ProjectDetailProps {
  project: Project & { id?: string };
}

const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(
    null
  );

  const { hasPermission, isAdmin, isProjectManager } = usePermissions();

  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();
  const { users, isUsersLoading } = useGetOrganizationUsers(1, 50);
  const { deleteProjectAsync, isDeletingProject } = useDeleteProject();
  const { removeMemberAsync, isRemovingMember } = useRemoveProjectMember();

  const { projectDetail, isLoadingProjectDetail } = useGetProjectDetail(
    project.id || '',
    !!project.id
  );

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);

  useEffect(() => {
    if (projectDetail && project.id) {
      const { creator, ...restProjectDetail } = projectDetail;
      dispatch(
        setSelectedProject({
          ...selectedApiProject,
          ...restProjectDetail,
          key: selectedApiProject?.key || project.code,
          start_date: selectedApiProject?.start_date || new Date().toISOString(),
        })
      );
    }
  }, [projectDetail]);

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
    if (selectedApiProject?.sprints && Array.isArray(selectedApiProject.sprints)) {
      return selectedApiProject.sprints.map(mapApiSprintToUiSprint);
    }
    return [];
  }, [selectedApiProject?.sprints]);

  const memberOptions = useMemo(() => {
    if (!users || users.length === 0) return [];

    return users.map((user) => ({
      label: user.name || user.email,
      value: user.id,
    }));
  }, [users]);

  const handleCreateSprints = (newSprints: Sprint[]) => {
    setShowAddSprintModal(false);
  };

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
      await addMembersAsync({
        project_id: project.id,
        user_id: selectedMembers,
      });
      setShowAddMemberModal(false);
      setSelectedMembers([]);
    } catch (error) {}
  };

  const handleSprintClick = (sprint: Sprint) => {
    sessionStorage.setItem('selectedSprint', JSON.stringify(sprint));
    router.push('/projects/sprints/tasks');
  };

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleDeleteProject = () => {
    setShowDeleteConfirm(true);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
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

  const canRemoveMember = (memberRole: string): boolean => {
    if (!isAdmin() && !isProjectManager()) {
      return false;
    }

    if (isAdmin()) {
      return true;
    }

    if (isProjectManager()) {
      return memberRole !== ROLE_TYPE.ORG_ADMIN;
    }

    return false;
  };

  const confirmDeleteProject = async () => {
    if (!project.id) {
      showToast.error('Project ID is missing');
      return;
    }

    try {
      await deleteProjectAsync(project.id);
      setShowDeleteConfirm(false);
      router.push('/projects');
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
      await removeMemberAsync({
        projectId: project.id,
        userId: memberToRemove.userId,
      });
      showToast.success('Member removed successfully');
      setMemberToRemove(null);
    } catch (error) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500" onClick={() => router.push('/projects')}>
          Projects
        </span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900">{project?.name}</span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              {project?.initials}
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">{project?.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{project?.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
              {project?.status}
            </span>

            {hasPermission('PROJECT_EDIT') && (
              <WpButton
                variant="secondary"
                size="sm"
                onClick={handleEditProject}
                className="!p-2"
                aria-label="Edit project"
              >
                <Pencil size={16} />
              </WpButton>
            )}

            {hasPermission('PROJECT_DELETE') && (
              <WpButton
                variant="ghost"
                size="sm"
                onClick={handleDeleteProject}
                className="!p-2 text-red-600 hover:bg-red-50"
                aria-label="Delete project"
              >
                <Trash2 size={16} />
              </WpButton>
            )}
          </div>
        </div>

        <div className="my-5 border-t border-gray-100" />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          <div>
            <p className="text-[10px] font-medium text-gray-400">CREATED</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{project?.date}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400">TOTAL SPRINTS</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{sprints?.length}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400">PROJECT OWNER</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{project?.owner}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400">TEAM SIZE</p>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {selectedApiProject?.members?.length || project.members.length} members
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400 mb-2">TEAM MEMBERS</p>
            {selectedApiProject?.members && selectedApiProject.members.length > 0 ? (
              <div className="flex items-center gap-2">
                {/* Member Avatars - Show first 5 */}
                <div className="flex -space-x-2">
                  {selectedApiProject.members.slice(0, 5).map((member, index) => (
                    <div
                      key={member.user_id}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${getColorFromId(member.user_id)}`}
                      style={{ zIndex: 5 - index }}
                      title={member.full_name || member.username}
                    >
                      {getInitials(member.full_name || member.username)}
                    </div>
                  ))}
                  {selectedApiProject.members.length > 5 && (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs font-semibold text-gray-700"
                      style={{ zIndex: 0 }}
                    >
                      +{selectedApiProject.members.length - 5}
                    </div>
                  )}
                </div>

                {/* View All Button */}
                <button
                  onClick={() => setShowViewMembersModal(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  View
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No members</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sprints</h2>

        <div className="flex items-center gap-3">
          {hasPermission('MEMBER_ADD') && (
            <WpButton variant="primary" size="md" onClick={() => setShowAddMemberModal(true)}>
              + Add Member
            </WpButton>
          )}

          {hasPermission('SPRINT_CREATE') && (
            <WpButton variant="primary" size="md" onClick={() => setShowAddSprintModal(true)}>
              + Add Sprint
            </WpButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoadingProjectDetail ? (
          // Loading State
          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="text-sm font-medium text-gray-600">Loading sprint details...</p>
            </div>
          </div>
        ) : sprints.length === 0 ? (
          // Empty State
          <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                No sprints have been created for this project.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Create your first sprint to start planning work.
              </p>

              {hasPermission('SPRINT_CREATE') && (
                <WpButton
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddSprintModal(true)}
                  className="mt-5"
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
              <div key={sprint.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex w-full items-center justify-between p-5">
                  <button
                    type="button"
                    onClick={() => handleSprintClick(sprint)}
                    className="flex flex-1 items-start text-left"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{sprint.name}</h3>

                      <p className="mt-1 text-xs text-gray-400">
                        {sprint.startDate || 'No start date'} → {sprint.endDate || 'No end date'}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {sprint.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400">START DATE</p>

                        <p className="mt-1 text-sm text-gray-900">{sprint.startDate || '-'}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">END DATE</p>
                        <p className="mt-1 text-sm text-gray-900">{sprint.endDate || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">TASKS</p>

                        <p className="mt-1 text-sm text-gray-900">{sprint.tasks}</p>
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
          onClose={() => setShowAddSprintModal(false)}
          onCreate={handleCreateSprints}
        />
      )}

      {showEditModal && (
        <EditProjectModal project={project} onClose={() => setShowEditModal(false)} />
      )}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add Members</h2>

                <p className="mt-1 text-sm text-gray-500">Select members to add to this project.</p>
              </div>

              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMemberModal(false)}
                className="!p-2 text-gray-400"
              >
                <X size={17} />
              </WpButton>
            </div>

            <div className="p-5">
              <WpMultiSelect
                label="Members"
                options={memberOptions}
                value={selectedMembers}
                onChange={setSelectedMembers}
                placeholder={isUsersLoading ? 'Loading members...' : 'Select members'}
                disabled={isUsersLoading}
                hint="You can select multiple members to add to this project"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Delete Project</h2>
                  <p className="mt-1 text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
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

      {/* View Members Modal */}
      {showViewMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedApiProject?.members?.length || 0} members in this project
                </p>
              </div>

              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowViewMembersModal(false)}
                className="!p-2 text-gray-400"
              >
                <X size={17} />
              </WpButton>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              <div className="space-y-2">
                {selectedApiProject?.members && selectedApiProject.members.length > 0 ? (
                  selectedApiProject.members.map((member) => {
                    const canDelete = canRemoveMember(member.role);

                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-gray-300"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${getColorFromId(member.user_id)}`}
                          >
                            {getInitials(member.full_name || member.username)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.full_name || member.username}
                            </p>
                            {member.role && (
                              <p className="text-xs text-gray-500 capitalize">
                                {member.role.replace('_', ' ')}
                              </p>
                            )}
                          </div>
                        </div>

                        {hasPermission('MEMBER_REMOVE') && canDelete && (
                          <WpButton
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setMemberToRemove({
                                userId: member.user_id,
                                name: member.full_name || member.username,
                              })
                            }
                            className="!p-2 text-red-600 hover:bg-red-50"
                            aria-label="Remove member"
                          >
                            <Trash2 size={16} />
                          </WpButton>
                        )}
                        {hasPermission('MEMBER_REMOVE') && !canDelete && (
                          <div className="px-2 py-1">
                            <span
                              className="text-xs text-gray-400"
                              title="You don't have permission to remove this member"
                            >
                              No access
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500">No members in this project yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
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

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Remove Member</h2>
                  <p className="mt-1 text-sm text-gray-500">Remove member from project</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
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
