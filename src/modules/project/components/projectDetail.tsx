'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, X, Pencil, Trash2 } from 'lucide-react';
import { Project, Sprint } from '../types/project';
import AddSprintModal from './addSprint';
import EditProjectModal from './editProjectModal';
import { useRouter } from 'next/navigation';
import { WpButton } from '@/src/app/components/common/button';
import { WpMultiSelect } from '@/src/app/components/common/multi-select';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import { useAddProjectMembers } from '@/src/modules/project/hooks/useProject';
import { showToast } from '@/src/utils/toast';
import { usePermissions } from '@/src/hooks/usePermissions';

interface ProjectDetailProps {
  project: Project & { id?: string };
}

const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const router = useRouter();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { users, isUsersLoading } = useGetOrganizationUsers(1, 50);

  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();

  const { hasPermission } = usePermissions();

  const memberOptions = useMemo(() => {
    if (!users || users.length === 0) return [];

    return users.map((user) => ({
      label: user.name || user.email,
      value: user.id,
    }));
  }, [users]);

  const handleCreateSprints = (newSprints: Sprint[]) => {
    setSprints((prev) => [...prev, ...newSprints]);
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

  const handleEditSuccess = () => {
    showToast.success('Project updated successfully');
  };

  const handleDeleteProject = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = () => {
    showToast.success('Project deleted successfully');
    setShowDeleteConfirm(false);
    router.push('/projects');
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

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
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
              {project.members.length} members
            </p>
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
        {sprints.length === 0 ? (
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
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
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
                >
                  Cancel
                </WpButton>

                <WpButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={confirmDeleteProject}
                  className="!bg-red-600 hover:!bg-red-700"
                >
                  Delete Project
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
