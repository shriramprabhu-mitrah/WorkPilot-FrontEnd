'use client';

import { useState, useRef } from 'react';
import { X, Paperclip, FileText, Trash2 } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { PRIORITY_TYPE, priorityOptions } from '@/src/app/components/common/enum';
import { useCreateUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/src/store';

interface CreateUserStoryModalProps {
  onClose: () => void;
}

const CreateUserStoryModal = ({ onClose }: CreateUserStoryModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PRIORITY_TYPE>(PRIORITY_TYPE.MEDIUM);
  const [storyPoints, setStoryPoints] = useState('');

  const selectedProject = useAppSelector((state) => state.project.selectedProject);
  const projectId = selectedProject?.id ?? '';
  const queryClient = useQueryClient();
  const { createUserStoryAsync, isCreatingUserStory } = useCreateUserStory(projectId);
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const handleCreate = async () => {
    if (!title.trim() || !projectId) return;
    await createUserStoryAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
      story_points: storyPoints ? Number(storyPoints) : undefined,
    });
    queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
    onClose();
  };
  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    setAttachments((prev) => [...prev, ...files]);

    event.target.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
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
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>

              <input
                ref={attachmentInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachmentChange}
              />

              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                <Paperclip size={14} />
                Add
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-4 text-center">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <Paperclip size={16} className="text-gray-400" />
                </div>

                <p className="text-sm text-gray-500">No attachments</p>

                <p className="mt-1 text-xs text-gray-400">Add files to this story</p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <FileText size={17} className="text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-700" title={file.name}>
                        {file.name}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              placeholder="Enter story points"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <WpButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </WpButton>

          <WpButton
            type="button"
            onClick={handleCreate}
            disabled={!title.trim() || isCreatingUserStory}
            isLoading={isCreatingUserStory}
          >
            Create Story
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default CreateUserStoryModal;
