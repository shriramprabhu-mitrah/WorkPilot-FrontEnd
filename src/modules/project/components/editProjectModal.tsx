'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpTextarea } from '@/src/app/components/common/textarea';
import { WpDropdown, WpDropdownOption } from '@/src/app/components/common/dropdown';
import { useUpdateProject } from '../hooks/useProject';
import { Project } from '../types/project';
import { UpdateProjectPayload, ProjectStatus } from '@/src/types/project';

interface EditProjectModalProps {
  project: Project & { id?: string };
  onClose: () => void;
  onSuccess?: () => void;
}

const statusOptions: WpDropdownOption[] = [
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
];

const EditProjectModal = ({ project, onClose, onSuccess }: EditProjectModalProps) => {
  // Normalize status to lowercase for API compatibility
  const normalizeStatus = (status: string | undefined): ProjectStatus => {
    if (!status) return 'active';
    const normalized = status.toLowerCase().replace(/\s+/g, '_') as ProjectStatus;
    return ['active', 'on_hold', 'completed', 'archived'].includes(normalized) 
      ? normalized 
      : 'active';
  };

  const [formData, setFormData] = useState<UpdateProjectPayload>({
    name: project.name || '',
    description: project.description || '',
    status: normalizeStatus(project.status),
  });

  const { updateProjectAsync, isUpdatingProject } = useUpdateProject();

  const handleChange = (field: keyof UpdateProjectPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project.id) {
      return;
    }

    try {
      await updateProjectAsync({
        projectId: project.id,
        payload: formData,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Project</h2>
            <p className="mt-1 text-sm text-gray-500">Update project details and settings</p>
          </div>

          <WpButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-2 text-gray-400"
            disabled={isUpdatingProject}
          >
            <X size={17} />
          </WpButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 p-5">
            <WpInput
              id="project-name"
              label="Project Name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name"
              required
            />

            <WpTextarea
              id="project-description"
              label="Description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter project description"
              rows={4}
            />

            <WpDropdown
              label="Status"
              options={statusOptions}
              value={formData.status || 'active'}
              onChange={(value) => handleChange('status', value)}
              placeholder="Select status"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
            <WpButton
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isUpdatingProject}
            >
              Cancel
            </WpButton>

            <WpButton
              type="submit"
              variant="primary"
              size="md"
              disabled={isUpdatingProject || !formData.name}
            >
              {isUpdatingProject ? 'Updating...' : 'Update Project'}
            </WpButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
