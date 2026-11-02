'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface UserStoryStatusOption {
  value: string;
  label: string;
  dot: string;
}

interface UserStoryStatusConfigItem {
  bg?: string;
  dot?: string;
  label?: string;
}

interface UserStoryStatusSelectorProps {
  status: string;
  canEditUserStory: boolean;
  showStatusMenu: boolean;
  setShowStatusMenu: (show: boolean) => void;
  statusConfig: Record<string, UserStoryStatusConfigItem>;
  statusOptions: UserStoryStatusOption[];
  fallbackBg: string;
  fallbackDot: string;
  onStatusChange: (status: string) => void;
}

export default function UserStoryStatusSelector({
  status,
  canEditUserStory,
  showStatusMenu,
  setShowStatusMenu,
  statusConfig,
  statusOptions,
  fallbackBg,
  fallbackDot,
  onStatusChange,
}: UserStoryStatusSelectorProps) {
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [setShowStatusMenu]);

  const currentStatus = statusConfig[status];

  return (
    <div className="px-5 py-5 border-b border-gray-300 dark:border-slate-700">
      <p className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-2">Status</p>

      <div className="relative" ref={statusMenuRef}>
        <button
          type="button"
          disabled={!canEditUserStory}
          onClick={() => {
            if (!canEditUserStory) return;
            setShowStatusMenu(!showStatusMenu);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border text-gray-900 dark:text-slate-100 ${
            !canEditUserStory ? 'cursor-default' : ''
          }`}
          style={{
            backgroundColor: currentStatus?.bg || fallbackBg,
            borderColor: `${currentStatus?.dot || fallbackDot}55`,
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: currentStatus?.dot || fallbackDot,
              }}
            />

            {currentStatus?.label || 'To Do'}
          </span>

          {canEditUserStory && <ChevronDown size={14} />}
        </button>

        {showStatusMenu && canEditUserStory && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
            {statusOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  onStatusChange(option.value);
                  setShowStatusMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: option.dot }}
                  />

                  <span className="truncate text-sm text-gray-700 dark:text-slate-300">
                    {option.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
