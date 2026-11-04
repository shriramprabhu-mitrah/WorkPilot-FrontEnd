import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { colors } from '@/src/styles/colors';
import { logger } from '@/src/lib/utils/logger';
import WpRichTextEditor from '../../htmlEditor'; // adjust path

type DescriptionPatch = { title?: string; description?: string };

interface TaskDescriptionSectionProps {
  description: string;
  canEditTask: boolean;
  isSaving: boolean;
  isEditingDesc: boolean;
  setEditingDesc: (value: boolean) => void;
  isEditingTask: boolean;
  setIsEditingTask: (value: boolean) => void;
  editTaskTitle: string;
  setEditTaskTitle: (value: string) => void;
  editTaskDescription: string;
  setEditTaskDescription: (value: string) => void;
  originalTaskTitle: string;
  setOriginalTaskTitle: (value: string) => void;
  originalTaskDescription: string;
  setOriginalTaskDescription: (value: string) => void;
  savedDescription: string;
  setSavedDescription: (value: string) => void;
  onLocalChange: (patch: DescriptionPatch) => void;
  handleUpdate: (patch: DescriptionPatch) => Promise<unknown> | void;
  onImageUpload: (file: File) => Promise<string>;
}

export const TaskDescriptionSection = ({
  description,
  canEditTask,
  isSaving,
  isEditingDesc,
  setEditingDesc,
  isEditingTask,
  setIsEditingTask,
  editTaskTitle,
  setEditTaskTitle,
  editTaskDescription,
  setEditTaskDescription,
  originalTaskTitle,
  setOriginalTaskTitle,
  originalTaskDescription,
  setOriginalTaskDescription,
  savedDescription,
  setSavedDescription,
  onLocalChange,
  handleUpdate,
  onImageUpload,
}: TaskDescriptionSectionProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditingDesc) return;
    const handler = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        setEditingDesc(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditingDesc, setEditingDesc]);

  const handleCancelTaskEdit = () => {
    setEditTaskTitle(originalTaskTitle);
    setEditTaskDescription(originalTaskDescription);
    onLocalChange({ title: originalTaskTitle, description: originalTaskDescription });
    setEditingDesc(false);
    setIsEditingTask(false);
  };

  const handleSaveTaskEdit = async () => {
    if (isSaving) return;

    const title = editTaskTitle.trim();
    const newDescription = editTaskDescription;

    try {
      await handleUpdate({ title, description: newDescription });

      onLocalChange({ title, description: newDescription });
      setOriginalTaskTitle(title);
      setOriginalTaskDescription(newDescription);
      setEditingDesc(false);
      setIsEditingTask(false);

      toast.success('Task updated successfully');
    } catch (error) {
      logger.log('Failed to update task', error);
      toast.error('Failed to update task');
    }
  };

  const handleCancelDescriptionEdit = () => {
    onLocalChange({ description: savedDescription });
    setEditingDesc(false);
  };

  const handleSaveDescriptionEdit = async () => {
    try {
      await handleUpdate({ description });
      setSavedDescription(description);
      setEditingDesc(false);
    } catch (error) {
      logger.log('Failed to update description', error);
    }
  };

  const onCancel = isEditingTask ? handleCancelTaskEdit : handleCancelDescriptionEdit;
  const onSave = isEditingTask ? handleSaveTaskEdit : handleSaveDescriptionEdit;
  const saveDisabled = isEditingTask ? isSaving || !editTaskTitle.trim() : isSaving;

  return (
    <section className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
      <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2">Description</p>

      {isEditingDesc ? (
        <div ref={editorRef}>
          <WpRichTextEditor
            value={editTaskDescription}
            onChange={(value: string) => {
              setEditTaskDescription(value);
              onLocalChange({ description: value });
            }}
            placeholder="Add a description..."
            minHeight="120px"
            onImageUpload={onImageUpload}
          />

          <div className={`flex gap-2 ${isEditingTask ? 'mt-3' : 'mt-2'}`}>
            <button
              type="button"
              disabled={isEditingTask ? isSaving : false}
              onClick={onCancel}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saveDisabled}
              onClick={onSave}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: colors.primary }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!canEditTask) return;
            setEditTaskDescription(description ?? '');
            setSavedDescription(description ?? '');
            setEditingDesc(true);
          }}
          className={`w-full min-h-[48px] ${canEditTask ? 'cursor-text' : 'cursor-default'}`}
        >
          {description ? (
            <div
              className="pointer-events-none [&_img]:max-w-[200px] [&_img]:max-h-[200px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <span className="text-gray-400 dark:text-slate-200">Add a description…</span>
          )}
        </div>
      )}
    </section>
  );
};
