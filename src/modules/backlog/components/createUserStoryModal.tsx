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
import { useUploadUserStoryAttachment } from '@/src/modules/tasks/hooks/useUserStoryAttachment';
import WpRichTextEditor from '@/src/app/components/common/htmlEditor';
import { userStoryService } from '@/src/services/userstory';

interface CreateUserStoryModalProps {
  onClose: () => void;
}

type AttachmentInfo = {
  url?: string;
  file_url?: string;
  file_path?: string;
  path?: string;
};

// Handles several upload response shapes (same helper as the task modal)
const extractUploadedUrl = (result: unknown): string | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = result as any;
  const body = r?.data ?? r;
  const payload = body?.data ?? body;
  const first: AttachmentInfo | undefined = Array.isArray(payload) ? payload[0] : payload;
  return first?.url ?? first?.file_url ?? first?.file_path ?? first?.path;
};

const CreateUserStoryModal = ({ onClose }: CreateUserStoryModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PRIORITY_TYPE>(PRIORITY_TYPE.MEDIUM);
  const [storyPoints, setStoryPoints] = useState('');
  const [pendingImages, setPendingImages] = useState<Map<string, File>>(new Map());
  const selectedProject = useAppSelector((state) => state.project.selectedProject);
  const projectId = selectedProject?.id ?? '';
  const queryClient = useQueryClient();
  const { createUserStoryAsync, isCreatingUserStory } = useCreateUserStory(projectId);
  const { uploadUserStoryAttachmentAsync, isUploadingUserStoryAttachment } =
    useUploadUserStoryAttachment(projectId);
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // The story doesn't exist yet, so keep the file and show a temporary blob URL.
  // It is swapped for the real URL after the story is created.
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const blobUrl = URL.createObjectURL(file);
    setPendingImages((prev) => new Map(prev).set(blobUrl, file));
    return blobUrl;
  };

  const handleCreate = async () => {
    if (!title.trim() || !projectId) return;

    try {
      // Snapshot before the modal closes
      const imagesToUpload = Array.from(pendingImages.entries());
      const filesToUpload = [...attachments];
      const originalDescription = description;

      // 1) Create the story
      const response = await createUserStoryAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
        story_points: storyPoints ? Number(storyPoints) : undefined,
      });

      const userStoryId = response?.data?.id;
      if (!userStoryId) return;

      onClose();
      for (const file of filesToUpload) {
        try {
          await uploadUserStoryAttachmentAsync({ userStoryId, file });
        } catch {}
      }
      if (imagesToUpload.length > 0) {
        let finalDescription = originalDescription;

        for (const [blobUrl, file] of imagesToUpload) {
          try {
            const result = await uploadUserStoryAttachmentAsync({ userStoryId, file });
            const realUrl = extractUploadedUrl(result);
            if (realUrl) {
              finalDescription = finalDescription.split(blobUrl).join(realUrl);
            } else {
            }
          } catch{
          } finally {
            URL.revokeObjectURL(blobUrl);
          }
        }

        if (finalDescription !== originalDescription) {
          await userStoryService.updateUserStory(projectId, userStoryId, {
            description: finalDescription,
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
    } catch{}
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
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Create New Story
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 overflow-y-auto flex-1 min-h-0">
          <WpInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter story title"
            showRequired
          />

          <div className="space-y-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Description
            </label>
            <WpRichTextEditor
              value={description}
              onChange={(value) => setDescription(value)}
              placeholder="Enter story description"
              onImageUpload={handleEditorImageUpload}
              minHeight="120px"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Attachments
              </label>

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
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Paperclip size={14} />
                Add
              </button>
            </div>

            {attachments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/40 px-4 py-4 text-center">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-700">
                  <Paperclip size={16} className="text-gray-400 dark:text-slate-100" />
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-100">No attachments</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-100">
                  Add files to this story
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-600">
                      <FileText size={17} className="text-gray-500 dark:text-slate-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium text-gray-700 dark:text-slate-200"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="rounded-lg p-1.5 text-gray-400 dark:text-slate-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
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
              showRequired
            />
            <WpInput
              label="Story Points"
              type="number"
              min={0}
              value={storyPoints}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || Number(value) >= 0) {
                  setStoryPoints(value);
                }
              }}
              placeholder="Enter story points"
              showRequired
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-slate-700 px-5 py-4">
          <WpButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </WpButton>
          <WpButton
            type="button"
            onClick={handleCreate}
            disabled={!title.trim() || isCreatingUserStory || isUploadingUserStoryAttachment}
            isLoading={isCreatingUserStory || isUploadingUserStoryAttachment}
          >
            Create Story
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default CreateUserStoryModal;
