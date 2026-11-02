'use client';

import { Dispatch, SetStateAction } from 'react';
import WpRichTextEditor from '../../htmlEditor';
import { EditableUserStoryFields } from '@/src/types/userstories';

interface UserStoryDescriptionSectionProps {
  description: string;
  currentDescription?: string | null;
  editingDesc: boolean;
  setEditingDesc: (editing: boolean) => void;
  setEditableFields: Dispatch<SetStateAction<EditableUserStoryFields>>;
  canEditUserStory: boolean;
  isSaving: boolean;
  primaryColor: string;
  handleUpdate: (updates: Record<string, unknown>) => void;
  handleDescriptionImageUpload: (file: File) => Promise<string>;
}

export default function UserStoryDescriptionSection({
  description,
  currentDescription,
  editingDesc,
  setEditingDesc,
  setEditableFields,
  canEditUserStory,
  isSaving,
  primaryColor,
  handleUpdate,
  handleDescriptionImageUpload,
}: UserStoryDescriptionSectionProps) {
  return (
    <section className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
      <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2">Description</p>

      {editingDesc ? (
        <div>
          <WpRichTextEditor
            value={description}
            onChange={(value) =>
              setEditableFields((prev) => ({
                ...prev,
                description: value,
              }))
            }
            placeholder="Add a description..."
            minHeight="180px"
            onImageUpload={handleDescriptionImageUpload}
          />

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                setEditingDesc(false);
                handleUpdate({ description });
              }}
              disabled={isSaving}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: primaryColor }}
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                setEditableFields((prev) => ({
                  ...prev,
                  description: currentDescription ?? '',
                }));
                setEditingDesc(false);
              }}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!canEditUserStory) return;
            setEditingDesc(true);
          }}
          className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed rounded-lg px-3 py-2.5 -mx-3 transition-colors min-h-[48px] ${
            canEditUserStory
              ? 'cursor-text hover:bg-gray-50 dark:hover:bg-slate-800'
              : 'cursor-default'
          }`}
        >
          {description ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-700 hover:[&_a]:dark:text-blue-300 [&_img]:max-w-[200px] [&_img]:max-h-[200px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{
                __html: description,
              }}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                const link = target.closest('a');

                if (link?.href) {
                  event.preventDefault();
                  window.open(link.href, '_blank', 'noopener,noreferrer');
                }
              }}
            />
          ) : (
            <span className="text-gray-400 dark:text-slate-500">Add a description…</span>
          )}
        </div>
      )}
    </section>
  );
}
