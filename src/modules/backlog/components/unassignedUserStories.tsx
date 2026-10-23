'use client';

import { ArrowDownWideNarrow, ArrowUpWideNarrow, ChevronDown, ChevronRight } from 'lucide-react';
import { BacklogFilterToolbar } from './backlogFilter';
import type { BacklogFilters, FilterOption } from './backlogFilter';

type Props = {
  canViewUserStories: boolean;
  isOverBacklog: boolean;
  unassignedUserStoriesOpen: boolean;
  setUnassignedUserStoriesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingUserStories: boolean;
  selectedProject: string | null;
  unassignedStories: unknown[];
  userStoriesSearch: string;
  handleUserStoriesSearchChange: (value: string) => void;
  userStoriesFilters: BacklogFilters;
  handleUserStoriesFiltersChange: (filters: BacklogFilters) => void;
  userStoryStatusOptions: FilterOption[];
  isLoadingUserStoryStatuses: boolean;
  userStoriesSortOrder: 'ASC' | 'DESC';
  handleUserStoriesSort: () => void;
};

export default function UnassignedUserStoriesHeader({
  canViewUserStories,
  isOverBacklog,
  unassignedUserStoriesOpen,
  setUnassignedUserStoriesOpen,
  isLoadingUserStories,
  selectedProject,
  unassignedStories,
  userStoriesSearch,
  handleUserStoriesSearchChange,
  userStoriesFilters,
  handleUserStoriesFiltersChange,
  userStoryStatusOptions,
  isLoadingUserStoryStatuses,
  userStoriesSortOrder,
  handleUserStoriesSort,
}: Props) {
  return (
    <div
      className={`px-3 sm:px-4 py-3 border-b ${
        canViewUserStories && isOverBacklog
          ? 'border-green-200 bg-green-100 dark:bg-green-900/20'
          : 'border-gray-100 dark:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Title and count */}
        <div
          className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0 cursor-pointer"
          onClick={() => setUnassignedUserStoriesOpen((v) => !v)}
        >
          <span className="text-gray-400 dark:text-slate-500 shrink-0">
            {unassignedUserStoriesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>

          <span
            className={`font-semibold text-sm transition-colors ${
              canViewUserStories && isOverBacklog
                ? 'text-green-700 dark:text-green-400'
                : 'text-gray-900 dark:text-slate-100'
            }`}
          >
            Unassigned UserStories
          </span>
        </div>

        {/* Sorting button and filter toolbar */}
        {canViewUserStories && unassignedUserStoriesOpen && (
          <div
            className="flex-1 min-w-0 flex items-center justify-end gap-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sorting icon button */}
            <button
              type="button"
              onClick={handleUserStoriesSort}
              className="shrink-0 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              title={`Sort ${userStoriesSortOrder === 'DESC' ? 'ascending' : 'descending'}`}
              aria-label={`Sort ${userStoriesSortOrder === 'DESC' ? 'ascending' : 'descending'}`}
            >
              {userStoriesSortOrder === 'DESC' ? (
                <ArrowDownWideNarrow size={16} />
              ) : (
                <ArrowUpWideNarrow size={16} />
              )}
            </button>

            {/* Search and filter */}
            <BacklogFilterToolbar
              search={userStoriesSearch}
              onSearchChange={handleUserStoriesSearchChange}
              filters={userStoriesFilters}
              onFiltersChange={handleUserStoriesFiltersChange}
              searchPlaceholder="Search user stories..."
              statusOptions={userStoryStatusOptions}
              isLoadingStatuses={isLoadingUserStoryStatuses}
            />
          </div>
        )}
      </div>
    </div>
  );
}
