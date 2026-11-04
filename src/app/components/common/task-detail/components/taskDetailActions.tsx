'use client';

import { Archive, Copy, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import type { RefObject } from 'react';
import type { KanbanTask } from '@/src/types/board';

interface TaskDetailActionsProps {
  task: KanbanTask;
  taskData: {
    title?: string | null;
    description?: string | null;
  };
  isError: boolean;
  canEditTask: boolean;
  canCreateTask: boolean;
  canDeleteTask: boolean;
  isMovingToBacklog: boolean;
  isAlreadyInBacklog: boolean;
  showActionMenu: boolean;
  actionMenuRef: RefObject<HTMLDivElement | null>;
  setShowActionMenu: (value: boolean) => void;
  setOriginalTaskTitle: (value: string) => void;
  setOriginalTaskDescription: (value: string) => void;
  setEditTaskTitle: (value: string) => void;
  setEditTaskDescription: (value: string) => void;
  setIsEditingTask: (value: boolean) => void;
  setEditingDesc: (value: boolean) => void;
  setShowCloneModal: (value: boolean) => void;
  setShowDeleteConfirm: (value: boolean) => void;
  handleMoveToBacklog: () => void;
  onClose: () => void;
}

export default function TaskDetailActions({
  task,
  taskData,
  isError,
  canEditTask,
  canCreateTask,
  canDeleteTask,
  isMovingToBacklog,
  isAlreadyInBacklog,
  showActionMenu,
  actionMenuRef,
  setShowActionMenu,
  setOriginalTaskTitle,
  setOriginalTaskDescription,
  setEditTaskTitle,
  setEditTaskDescription,
  setIsEditingTask,
  setEditingDesc,
  setShowCloneModal,
  setShowDeleteConfirm,
  handleMoveToBacklog,
  onClose,
}: TaskDetailActionsProps) {
  const handleEdit = () => {
    setShowActionMenu(false);

    const title = taskData.title || task.title || '';
    const description = taskData.description || '';

    setOriginalTaskTitle(title);
    setOriginalTaskDescription(description);
    setEditTaskTitle(title);
    setEditTaskDescription(description);
    setIsEditingTask(true);
    setEditingDesc(true);
  };

  return (
    <div className="flex items-center gap-1.5">
      {!isError && canEditTask && (
        <button
          type="button"
          onClick={handleMoveToBacklog}
          disabled={isMovingToBacklog || isAlreadyInBacklog}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border ${
            isAlreadyInBacklog
              ? 'text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/50 cursor-not-allowed'
              : 'text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600 shadow-sm cursor-pointer active:scale-95'
          }`}
          title={isAlreadyInBacklog ? 'Task is already in the backlog' : 'Move task to backlog'}
        >
          <Archive
            size={13}
            className={
              isAlreadyInBacklog
                ? 'text-gray-400 dark:text-slate-500'
                : 'text-gray-600 dark:text-slate-300'
            }
          />
          <span>
            {isMovingToBacklog
              ? 'Moving...'
              : isAlreadyInBacklog
                ? 'In Backlog'
                : 'Move to Backlog'}
          </span>
        </button>
      )}

      {!isError && (canEditTask || canCreateTask || canDeleteTask) && (
        <div className="relative" ref={actionMenuRef}>
          <button
            type="button"
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 transition-colors"
            aria-label="Task actions"
          >
            <MoreVertical size={17} />
          </button>

          {showActionMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1">
              {canEditTask && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Pencil size={14} />
                  Update
                </button>
              )}

              {canCreateTask && (
                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    setShowCloneModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Copy size={14} />
                  Clone
                </button>
              )}

              {canDeleteTask && (
                <button
                  type="button"
                  onClick={() => {
                    setShowActionMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 transition-colors"
        aria-label="Close task details"
      >
        <X size={17} />
      </button>
    </div>
  );
}
