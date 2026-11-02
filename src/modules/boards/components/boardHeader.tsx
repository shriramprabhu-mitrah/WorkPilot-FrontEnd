'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { FilterPanel, FilterState } from '@/src/app/components/common/filter-panel';
import { CustomStatus } from '@/src/types/colors';
import { AssigneeAvatars } from './assigneeAvatar';
import { getInitials } from '../utils/boardTaskUtils';
import { LabelListItem } from '@/src/types/label';

interface BoardHeaderProps {
  storeProject: { name?: string; slug?: string } | null;
  storeSprint: { name?: string } | null;
  hasActiveFilter: boolean;
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;
  filterRef: React.RefObject<HTMLDivElement | null>;
  filters: FilterState;
  assigneeIdFilter: string[];
  allAssignees: { name: string; color: string | null }[];
  allLabels: LabelListItem[];
  allTypes: string[];
  statuses: CustomStatus[];
  handleFilterChange: (newFilters: FilterState) => void;
  handleAssigneeSearch: (search: string) => void;
  isLoadingAssignees: boolean;
  displayMembers: Parameters<typeof AssigneeAvatars>[0]['displayMembers'];
  toggleAssigneeFilter: (memberId: string, memberName: string) => void;
}

export const BoardHeader = React.memo(function BoardHeader({
  storeProject,
  storeSprint,
  hasActiveFilter,
  showFilter,
  setShowFilter,
  filterRef,
  filters,
  assigneeIdFilter,
  allAssignees,
  allLabels,
  allTypes,
  statuses,
  handleFilterChange,
  handleAssigneeSearch,
  isLoadingAssignees,
  displayMembers,
  toggleAssigneeFilter,
}: BoardHeaderProps) {
  const activeCount =
    filters.priorities.length +
    assigneeIdFilter.length +
    filters.labels.length +
    filters.types.length +
    filters.statuses.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 flex-shrink-0 px-3 sm:px-0">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Kanban Board</h1>
        <p className="text-sm text-gray-500 dark:text-slate-100">
          Visualize and manage your team&apos;s tasks across workflow stages.
        </p>
        {storeProject && (
          <p className="text-xs text-gray-400 dark:text-slate-100 mt-0.5">
            {storeProject.name}
            {storeSprint ? ` · ${storeSprint.name}` : ' · All Sprints'}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2.5 flex-wrap sm:mr-18">
        {/* Filter button */}
        <div ref={filterRef} className="relative">
          <WpButton
            variant={hasActiveFilter ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowFilter((v) => !v)}
            leftIcon={<Filter size={15} />}
            className="dark:text-white dark:border-gray-600"
          >
            <span>Filter</span>
            {hasActiveFilter && (
              <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </WpButton>

          {showFilter && (
            <FilterPanel
              filters={filters}
              allAssignees={allAssignees}
              allLabels={allLabels}
              allTypes={allTypes}
              allStatuses={statuses}
              onChange={handleFilterChange}
              onClose={() => setShowFilter(false)}
              onAssigneeSearch={handleAssigneeSearch}
              isLoadingAssignees={isLoadingAssignees}
            />
          )}
        </div>

        <AssigneeAvatars
          displayMembers={displayMembers ?? []}
          assigneeIdFilter={assigneeIdFilter}
          toggleAssigneeFilter={toggleAssigneeFilter}
          getInitials={getInitials}
        />
      </div>
    </div>
  );
});
