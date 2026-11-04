'use client';

import { BookOpenText, Check, ChevronRight, FileText, Link2 } from 'lucide-react';
import type { KanbanTask } from '@/src/types/board';

interface TaskDetailBreadcrumbProps {
  task: KanbanTask;
  isError: boolean;
  isNotFound: boolean;
  effectiveTaskId?: string | null;
  parentStoryId?: string | null;
  parentStoryKey?: string | null;
  parentStoryTitle?: string | null;
  copiedLink: boolean;
  sprint?: string | null;
  handleParentStoryClick: () => void;
  handleCopyLink: () => void;
}

export default function TaskDetailBreadcrumb({
  task,
  isError,
  isNotFound,
  effectiveTaskId,
  parentStoryId,
  parentStoryKey,
  parentStoryTitle,
  copiedLink,
  sprint,
  handleParentStoryClick,
  handleCopyLink,
}: TaskDetailBreadcrumbProps) {
  return (
    <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-3 flex-wrap sm:flex-nowrap">
      {!isError && parentStoryId && (
        <div className="flex items-center gap-1.5 min-w-0 max-w-[240px] sm:max-w-[340px] shrink-0">
          <button
            type="button"
            onClick={handleParentStoryClick}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/50 transition-all cursor-pointer min-w-0 hover:shadow-xs active:scale-95"
            title={
              parentStoryTitle
                ? `Parent User Story: ${
                    parentStoryKey ? `${parentStoryKey} - ` : ''
                  }${parentStoryTitle}`
                : 'Open parent user story'
            }
          >
            <BookOpenText size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />

            <span className="truncate">
              {parentStoryKey
                ? parentStoryTitle
                  ? `${parentStoryKey}: ${parentStoryTitle}`
                  : parentStoryKey
                : parentStoryTitle || 'User Story'}
            </span>
          </button>

          <ChevronRight size={13} className="text-gray-400 dark:text-slate-500 shrink-0" />
        </div>
      )}

      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-6 h-6 rounded-lg ${
            isError ? 'bg-red-500' : 'bg-blue-600'
          } flex items-center justify-center shrink-0`}
        >
          <FileText size={13} className="text-white" />
        </span>

        <span
          className={`text-base font-bold truncate ${
            isError ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
          }`}
        >
          {effectiveTaskId || task.id}
        </span>

        {!isError && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={copiedLink ? 'Copied!' : 'Copy link'}
            aria-label="Copy link"
          >
            {copiedLink ? (
              <Check size={14} className="text-green-600 dark:text-green-400" />
            ) : (
              <Link2 size={14} />
            )}
          </button>
        )}

        {isError && isNotFound && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shrink-0">
            Not Found
          </span>
        )}

        {!isError && (sprint || task.sprint) && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate max-w-[140px]">
              {sprint || task.sprint}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
