'use client';

import { useEffect, useRef, useState } from 'react';
import { Archive, BookOpenText, Check, Link2, MoreHorizontal, Trash2, X } from 'lucide-react';

interface DrawerHeaderProps {
  displayKey: string;
  isStoryError: boolean;
  isNotFound: boolean;
  copiedLink: boolean;
  onCopyLink: () => void;
  sprintName?: string;
  canEditUserStory: boolean;
  canDeleteUserStory: boolean;
  isSaving: boolean;
  isAlreadyInBacklog: boolean;
  onMoveToBacklog: () => void;
  onDeleteClick: () => void;
  onClose: () => void;
}

export const DrawerHeader = ({
  displayKey,
  isStoryError,
  isNotFound,
  copiedLink,
  onCopyLink,
  sprintName,
  canEditUserStory,
  canDeleteUserStory,
  isSaving,
  isAlreadyInBacklog,
  onMoveToBacklog,
  onDeleteClick,
  onClose,
}: DrawerHeaderProps) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Moved from the parent's document mousedown handler (more-menu part only)
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative z-20 flex items-center justify-between px-6 py-3.5 border-b border-gray-300 dark:border-slate-700 shrink-0">
      <div className="flex items-center gap-2">
        <span
          className={`w-6 h-6 rounded-lg ${
            isStoryError ? 'bg-red-500' : 'bg-blue-600'
          } flex items-center justify-center shrink-0`}
        >
          <BookOpenText size={13} className="text-white" />
        </span>
        <span
          className={`text-base font-bold ${
            isStoryError ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
          }`}
        >
          {displayKey}
        </span>
        {!isStoryError && (
          <button
            type="button"
            onClick={onCopyLink}
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
        {isStoryError && isNotFound && (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            Not Found
          </span>
        )}
        {!isStoryError && sprintName && (
          <>
            <span className="text-gray-300 dark:text-slate-600">/</span>
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
              {sprintName}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Move to Backlog Button */}
        {!isStoryError && canEditUserStory && (
          <button
            type="button"
            onClick={onMoveToBacklog}
            disabled={isSaving || isAlreadyInBacklog}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border ${
              isAlreadyInBacklog
                ? 'text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700/50 cursor-not-allowed'
                : 'text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600 shadow-sm cursor-pointer active:scale-95'
            }`}
            title={
              isAlreadyInBacklog
                ? 'User story is already in the backlog'
                : 'Move user story to backlog'
            }
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
              {isSaving && !isAlreadyInBacklog
                ? 'Moving...'
                : isAlreadyInBacklog
                  ? 'In Backlog'
                  : 'Move to Backlog'}
            </span>
          </button>
        )}

        {!isStoryError && (canEditUserStory || canDeleteUserStory) && (
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 transition-colors"
            >
              <MoreHorizontal size={17} />
            </button>
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                {canDeleteUserStory && (
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      onDeleteClick();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
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
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 transition-colors"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
};
