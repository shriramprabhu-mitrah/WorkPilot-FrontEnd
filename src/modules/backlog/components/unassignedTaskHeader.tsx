'use client';

import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { BacklogFilterToolbar } from './backlogFilter';
import type { BacklogFilters, FilterOption } from './backlogFilter';

type Props = {
  canViewTasks: boolean;
  canCreateTask: boolean;
  selectedProject: string | null;
  unassignedTasksOpen: boolean;
  setUnassignedTasksOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingTasks: boolean;
  filteredUnassignedTasks: unknown[];
  tasksSearch: string;
  handleTasksSearchChange: (value: string) => void;
  tasksFilters: BacklogFilters;
  handleTasksFiltersChange: (filters: BacklogFilters) => void;
  taskStatusOptions: FilterOption[];
  isLoadingCustomStatuses: boolean;
  setTaskUserStoryId: (id: string) => void;
  setShowAddTaskModal: (show: boolean) => void;
  tasksSortOrder: 'ASC' | 'DESC';
  handleTasksSort: () => void;
};

export default function UnassignedTasksHeader({
  canViewTasks,
  canCreateTask,
  selectedProject,
  unassignedTasksOpen,
  setUnassignedTasksOpen,
  isLoadingTasks,
  filteredUnassignedTasks,
  tasksSearch,
  handleTasksSearchChange,
  tasksFilters,
  handleTasksFiltersChange,
  taskStatusOptions,
  isLoadingCustomStatuses,
  setTaskUserStoryId,
  setShowAddTaskModal,
  tasksSortOrder,
  handleTasksSort,
}: Props) {
  return (
    <div className="px-3 sm:px-4 py-3 border-b border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Title and count */}
        <div
          className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 cursor-pointer"
          onClick={() => setUnassignedTasksOpen((v) => !v)}
        >
          <span className="text-gray-400 dark:text-slate-500 shrink-0">
            {unassignedTasksOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>

          <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 whitespace-nowrap">
            Unassigned Tasks
          </span>
        </div>

        {/* Sorting icon and search/filter toolbar */}
        {canViewTasks && unassignedTasksOpen && (
          <div
            className="flex-1 min-w-0 flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleTasksSort}
              className="shrink-0 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              title={`Sort ${tasksSortOrder === 'DESC' ? 'ascending' : 'descending'}`}
              aria-label={`Sort ${tasksSortOrder === 'DESC' ? 'ascending' : 'descending'}`}
            >
              {tasksSortOrder === 'DESC' ? (
                <ArrowDownWideNarrow size={16} />
              ) : (
                <ArrowUpWideNarrow size={16} />
              )}
            </button>

            <BacklogFilterToolbar
              search={tasksSearch}
              onSearchChange={handleTasksSearchChange}
              filters={tasksFilters}
              onFiltersChange={handleTasksFiltersChange}
              searchPlaceholder="Search tasks..."
              statusOptions={taskStatusOptions}
              isLoadingStatuses={isLoadingCustomStatuses}
            />
          </div>
        )}

        {/* New Task button at the right end */}
        {canViewTasks && canCreateTask && selectedProject && (
          <div className="shrink-0">
            <WpButton
              size="sm"
              variant="primary"
              leftIcon={<Plus size={14} />}
              onClick={() => {
                setTaskUserStoryId('');
                setShowAddTaskModal(true);
              }}
              className="!py-1 !px-2.5 text-xs whitespace-nowrap"
            >
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </WpButton>
          </div>
        )}
      </div>
    </div>
  );
}
