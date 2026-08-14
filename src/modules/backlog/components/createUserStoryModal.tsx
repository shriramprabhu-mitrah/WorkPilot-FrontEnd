'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { PRIORITY_TYPE, priorityOptions } from '@/src/app/components/common/enum';

interface CreateUserStoryModalProps {
  onClose: () => void;
}

const CreateUserStoryModal = ({ onClose }: CreateUserStoryModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PRIORITY_TYPE>(PRIORITY_TYPE.MEDIUM);
  const [storyPoints, setStoryPoints] = useState('');

  const handleCreate = () => {
    onClose();
  };

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
            <h2 className="text-lg font-bold text-gray-900">Create New Story</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter story description"
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WpDropdown
              label="Priority"
              options={priorityOptions}
              value={priority}
              onChange={(value) => setPriority(value as PRIORITY_TYPE)}
              placeholder="Select priority"
            />
            <WpInput
              label="Story Points"
              type="number"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              placeholder="8"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <WpButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </WpButton>

          <WpButton type="button" onClick={handleCreate}>
            Create Story
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default CreateUserStoryModal;
