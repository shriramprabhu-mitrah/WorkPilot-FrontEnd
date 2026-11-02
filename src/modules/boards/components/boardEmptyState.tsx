'use client';

import React from 'react';
import Image from 'next/image';

interface BoardEmptyStateProps {
  type: 'restricted' | 'no-tasks';
}

export const BoardEmptyState = React.memo(function BoardEmptyState({ type }: BoardEmptyStateProps) {
  if (type === 'restricted') {
    return (
      <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/images/kanban method-pana.svg"
            alt="Access Restricted"
            width={360}
            height={360}
            className="h-90 w-90 opacity-60"
          />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Restricted</h2>

          <p className="mt-3 max-w-md text-center text-gray-500 dark:text-gray-400">
            You do not have permission to view tasks on this board.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
      <div className="flex flex-col items-center justify-center text-center">
        <Image
          src="/images/kanban method-pana.svg"
          alt="No Tasks"
          width={360}
          height={360}
          className="h-90 w-90"
        />

        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">No tasks found</h2>

        <p className="mt-3 max-w-md text-center text-gray-500 dark:text-slate-200">
          There are no tasks for this selection. Try a different project or sprint.
        </p>
      </div>
    </div>
  );
});
