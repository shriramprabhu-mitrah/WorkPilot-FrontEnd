'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { priorityOptions } from '@/src/app/components/common/enum';
import { useUpdateUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import { UserStoryResponse } from '@/src/types/userstories';
import { statusOptions } from '@/src/modules/project/data/project';

interface EditUserStoryModalProps {
  projectId: string;
  userStory: UserStoryResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserStoryModal = ({
  projectId,
  userStory,
  onClose,
  onSuccess,
}: EditUserStoryModalProps) => {
  const [title, setTitle] = useState(userStory.title || '');
  const [description, setDescription] = useState(userStory.description || '');
  const [priority, setPriority] = useState<string>(
    userStory.priority?.toLowerCase() || 'medium'
  );
  const [status, setStatus] = useState(userStory.status || 'todo');
  const [storyPoints, setStoryPoints] = useState(
    userStory.story_points !== undefined ? String(userStory.story_points) : ''
  );

  const updateUserStoryMutation = useUpdateUserStory();

  const handleUpdate = async () => {
    if (!title.trim()) return;

    try {
      await updateUserStoryMutation.mutateAsync({
        projectId,
        userStoryId: userStory.id!,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
          status: status as 'todo' | 'in_progress' | 'in_review' | 'testing' | 'completed' | 'blocked',
          story_points: storyPoints ? Number(storyPoints) : undefined,
        },
      });
      onSuccess();
    } catch (error) {
      // Error is handled by toast
    }
  };

  const isUpdating = updateUserStoryMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit User Story</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <WpInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter story title"
            disabled={isUpdating}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter story description"
              rows={4}
              disabled={isUpdating}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WpDropdown
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(value) => setStatus(value)}
              placeholder="Select status"
              disabled={isUpdating}
            />
            <WpDropdown
              label="Priority"
              options={priorityOptions}
              value={priority}
              onChange={(value) => setPriority(value)}
              placeholder="Select priority"
              disabled={isUpdating}
            />
          </div>

          <WpInput
            label="Story Points"
            type="number"
            value={storyPoints}
            onChange={(e) => setStoryPoints(e.target.value)}
            placeholder="Enter story points"
            disabled={isUpdating}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <WpButton type="button" variant="secondary" onClick={onClose} disabled={isUpdating}>
            Cancel
          </WpButton>

          <WpButton
            type="button"
            onClick={handleUpdate}
            disabled={!title.trim() || isUpdating}
            isLoading={isUpdating}
          >
            Update Story
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default EditUserStoryModal;
