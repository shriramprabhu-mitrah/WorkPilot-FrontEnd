'use client';

import { Check, ChevronDown } from 'lucide-react';
import type { RefObject } from 'react';
import toast from 'react-hot-toast';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface SelectedStatus {
  label: string;
  color: string;
}

interface TaskStatusSectionProps {
  statusMenuRef: RefObject<HTMLDivElement | null>;
  canEditTask: boolean;
  hasHours: boolean;
  selectedStatus?: SelectedStatus | null;
  taskStatusName?: string | null;
  taskStatus?: string | null;
  showStatusMenu: boolean;
  isLoadingStatus: boolean;
  statusOptions: StatusOption[];
  setShowStatusMenu: (value: boolean) => void;
  handleUpdate: (fields: { status: string }) => unknown;
}

export default function TaskStatusSection({
  statusMenuRef,
  canEditTask,
  hasHours,
  selectedStatus,
  taskStatusName,
  taskStatus,
  showStatusMenu,
  isLoadingStatus,
  statusOptions,
  setShowStatusMenu,
  handleUpdate,
}: TaskStatusSectionProps) {
  return (
    <div className="px-5 py-5 border-b border-gray-300 dark:border-slate-700">
      <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2">Status</p>

      <div className="relative" ref={statusMenuRef}>
        <button
          type="button"
          disabled={!canEditTask}
          onClick={() => {
            if (!hasHours) {
              toast.error('Enter Estimated Hours and Actual Hours first');
              return;
            }

            setShowStatusMenu(!showStatusMenu);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold w-full justify-between transition-all shadow-sm border ${
            !canEditTask ? 'cursor-default' : ''
          }`}
          style={{
            color: selectedStatus?.color,
            borderColor: selectedStatus ? `${selectedStatus.color}55` : '#D1D5DB',
          }}
        >
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: selectedStatus?.color ?? '#9CA3AF',
              }}
            />

            {selectedStatus?.label ?? taskStatusName ?? 'Select status'}
          </span>

          {canEditTask && <ChevronDown size={14} />}
        </button>

        {showStatusMenu && canEditTask && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
            {isLoadingStatus ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400 text-center">
                Loading statuses...
              </div>
            ) : statusOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No statuses found</div>
            ) : (
              statusOptions.map((status) => {
                const isSelected = taskStatus === status.value;

                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => {
                      setShowStatusMenu(false);
                      handleUpdate({ status: status.value });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: status.color }}
                    />

                    <span className="flex-1 truncate">{status.label}</span>

                    {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
