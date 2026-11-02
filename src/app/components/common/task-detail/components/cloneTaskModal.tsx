import { useState } from 'react';
import toast from 'react-hot-toast';
import { colors } from '@/src/styles/colors';
import { useCloneTask } from '@/src/modules/tasks/hooks/useTask';

interface CloneTaskModalProps {
  projectId?: string;
  taskId?: string;
  onClose: () => void;
  onCloned?: () => void;
}

export const CloneTaskModal = ({ projectId, taskId, onClose, onCloned }: CloneTaskModalProps) => {
  const [keepAssignee, setKeepAssignee] = useState(true);
  const { cloneTaskAsync, isCloningTask } = useCloneTask();

  const handleClone = async () => {
    if (!projectId || !taskId) return;

    try {
      await cloneTaskAsync({
        projectId,
        taskId,
        payload: { keep_assignee: keepAssignee },
      });
      onClose();
      onCloned?.();
    } catch {
      toast.error('Failed to clone task');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Clone Task</h3>
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
          Create a copy of this task with the same details.
        </p>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={keepAssignee}
            onChange={(e) => setKeepAssignee(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-slate-300">Keep assignee</span>
        </label>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={isCloningTask}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClone}
            disabled={isCloningTask}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: colors.primary }}
          >
            {isCloningTask ? 'Cloning...' : 'Clone'}
          </button>
        </div>
      </div>
    </div>
  );
};
