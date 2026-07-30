'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { Project, Sprint } from '../types/project';
import AddSprintModal from './addSprint';
import { useRouter } from 'next/navigation';
import { WpButton } from '@/src/app/components/common/button';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { useGetOrganizationUsers } from '@/src/modules/organization/hooks/useOrganization';
import { useAddProjectMembers } from '@/src/modules/project/hooks/useProject';
import { showToast } from '@/src/utils/toast';

interface ProjectDetailProps {
  project: Project & { id?: string };
}

const ProjectDetail = ({ project }: ProjectDetailProps) => {
  const router = useRouter();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');

  // Fetch organization users for member dropdown
  const { users, isUsersLoading } = useGetOrganizationUsers(1, 50);

  // Hook to add members to project
  const { addMembersAsync, isAddingMembers } = useAddProjectMembers();

  // Transform users to dropdown options
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
    if (!selectedMember) {
      showToast.error('Please select a member');
      return;
    }

    if (!project.id) {
      showToast.error('Project ID is missing');
      return;
    }

    try {
      await addMembersAsync({
        project_id: project.id,
        user_id: [selectedMember],
      });
      setShowAddMemberModal(false);
      setSelectedMember('');
    } catch (error) {}
  };

  const handleSprintClick = (sprint: Sprint) => {
    sessionStorage.setItem('selectedSprint', JSON.stringify(sprint));
    router.push('/projects/sprints/tasks');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Projects</span>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900">{project.name}</span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              {project.initials}
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            </div>
          </div>

          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
            {project.status}
          </span>
        </div>

        <div className="my-5 border-t border-gray-100" />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <p className="text-[10px] font-medium text-gray-400">CREATED</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{project.date}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400">TOTAL SPRINTS</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{sprints.length}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium text-gray-400">PROJECT OWNER</p>
            <p className="mt-2 text-sm font-medium text-gray-900">Sarah Chen</p>
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
          <WpButton variant="primary" size="md" onClick={() => setShowAddMemberModal(true)}>
            + Add Member
          </WpButton>

          <WpButton variant="primary" size="md" onClick={() => setShowAddSprintModal(true)}>
            + Add Sprint
          </WpButton>
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

              <WpButton
                variant="primary"
                size="md"
                onClick={() => setShowAddSprintModal(true)}
                className="mt-5"
              >
                + Add Sprint
              </WpButton>
            </div>
          </div>
        ) : (
          sprints.map((sprint) => {
            const isExpanded = expandedSprint === sprint.id;
            return (
              <div key={sprint.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => handleSprintClick(sprint)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{sprint.name}</h3>

                    <p className="mt-1 text-xs text-gray-400">
                      {sprint.startDate || 'No start date'} → {sprint.endDate || 'No end date'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {sprint.status}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
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
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add Member</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select a member to add to this project.
                </p>
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
              <WpDropdown
                label="Member"
                options={memberOptions}
                value={selectedMember}
                onChange={setSelectedMember}
                placeholder={isUsersLoading ? 'Loading members...' : 'Select member'}
                disabled={isUsersLoading}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
              <WpButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedMember('');
                }}
                disabled={isAddingMembers}
              >
                Cancel
              </WpButton>

              <WpButton
                type="button"
                variant="primary"
                size="md"
                disabled={!selectedMember || isAddingMembers}
                onClick={handleAddMember}
              >
                {isAddingMembers ? 'Adding...' : 'Add Member'}
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
