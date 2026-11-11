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
          onMouseDown={(event) => {
            if (!canEditTask) return;
            if (event.button !== 0) return;
            const target = event.target as HTMLElement;
            const link = target.closest('a');
            if (link?.href) {
              event.preventDefault();
              window.open(link.href, '_blank', 'noopener,noreferrer');
              return;
            }
            
            setEditTaskDescription(description ?? '');
            setSavedDescription(description ?? '');
            setEditingDesc(true);
          }}
          className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed rounded-lg px-3 py-2.5 -mx-3 transition-colors min-h-[48px] ${
            canEditTask
              ? 'cursor-text hover:bg-gray-50 dark:hover:bg-slate-800'
              : 'cursor-default'
          }`}
        >
          {description ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-700 hover:[&_a]:dark:text-blue-300 [&_img]:max-w-[200px] [&_img]:max-h-[200px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5"
              style={{ pointerEvents: 'auto' }}
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
          ) : (
            <span className="text-gray-400 dark:text-slate-500">Add a description…</span>
          )}
        </div>
      )}
    </section>
  );
};
