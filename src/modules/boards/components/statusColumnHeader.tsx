import React from 'react';

interface StatusColumnHeaderProps {
  status: {
    id: string;
    name: string;
    color: string;
  };
  taskCount: number;
  isCollapsed: boolean;
  toggleStatusCollapse: (statusId: string) => void;
}

export const StatusColumnHeader = React.memo(function StatusColumnHeader({
  status,
  taskCount,
  isCollapsed,
  toggleStatusCollapse,
}: StatusColumnHeaderProps) {
  return (
    <div
      className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 dark:bg-gray-100 dark:text-slate-100 ${
        isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
      }`}
    >
      {!isCollapsed ? (
        <div className="p-3 flex items-center gap-2 dark:bg-gray-100">
          <button
            onClick={() => toggleStatusCollapse(status.id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-95 rounded transition-all duration-200"
            title="Collapse column"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-slate-300 transition-transform duration-300 ease-in-out rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: status.color }}
          />

          <span className="text-sm font-semibold text-gray-700 dark:text-slate-100 truncate">
            {status.name}
          </span>

          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium">
            {taskCount}
          </span>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-start py-3 px-2">
          <button
            onClick={() => toggleStatusCollapse(status.id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-95 rounded transition-all duration-200 mb-2"
            title="Expand column"
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-slate-300 transition-transform duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mb-2"
            style={{ backgroundColor: status.color }}
          />

          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <span
              className="text-xs font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              {status.name}
            </span>
          </div>

          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-2">
            {taskCount}
          </span>
        </div>
      )}
    </div>
  );
});
