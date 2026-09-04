'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Priority } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';

export interface FilterState {
  priorities: Priority[];
  assignees: string[];
  labels: string[];
  types: string[];
  statuses: string[];
}

interface Props {
  filters: FilterState;
  allAssignees: Array<{
    name: string;
    color: string | null;
  }>;
  allLabels: string[];
  allTypes: string[];
  allStatuses: Array<{ id: string; name: string; color: string }>;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
  // Server-side assignee search props
  onAssigneeSearch?: (search: string) => void;
  isLoadingAssignees?: boolean;
}

const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

const priorityColors: Record<Priority, string> = {
  Critical: colors.priorityCriticalText,
  High: colors.priorityHighText,
  Medium: colors.priorityMediumText,
  Low: colors.priorityLowText,
};

const toggle = <T,>(arr: T[], val: T): T[] =>
  arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

type FilterCategory = 'assignee' | 'status' | 'priority' | 'type' | 'label';

export const FilterPanel = ({
  filters,
  allAssignees,
  allLabels,
  allTypes,
  allStatuses,
  onChange,
  onClose,
  onAssigneeSearch,
  isLoadingAssignees = false,
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('assignee');
  const [searchTerm, setSearchTerm] = useState('');

  const hasActive =
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.labels.length > 0 ||
    filters.types.length > 0 ||
    filters.statuses.length > 0;

  const getActiveCount = (category: FilterCategory): number => {
    switch (category) {
      case 'assignee':
        return filters.assignees.length;
      case 'status':
        return filters.statuses.length;
      case 'priority':
        return filters.priorities.length;
      case 'type':
        return filters.types.length;
      case 'label':
        return filters.labels.length;
      default:
        return 0;
    }
  };

  const clearCategory = () => {
    switch (selectedCategory) {
      case 'assignee':
        onChange({ ...filters, assignees: [] });
        break;
      case 'status':
        onChange({ ...filters, statuses: [] });
        break;
      case 'priority':
        onChange({ ...filters, priorities: [] });
        break;
      case 'type':
        onChange({ ...filters, types: [] });
        break;
      case 'label':
        onChange({ ...filters, labels: [] });
        break;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Shared search input used in every category
  const SearchInput = ({ placeholder }: { placeholder: string }) => (
    <div className="border-b border-gray-200 p-2.5 dark:border-slate-700">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400"
        />

        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);

            if (placeholder === 'Search assignee' && onAssigneeSearch) {
              onAssigneeSearch(e.target.value);
            }
          }}
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 sm:text-sm"
        />
      </div>
    </div>
  );

  // Shared footer row
  const Footer = ({ selectedCount, totalCount }: { selectedCount: number; totalCount: number }) => (
    <div className="flex items-center justify-between p-2.5 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={clearCategory}
        disabled={selectedCount === 0}
        className="text-xs text-gray-600 dark:text-white hover:text-gray-900  font-medium"
      >
        Clear
      </button>
      <span className="text-xs text-gray-400 dark:text-slate-100">
        {selectedCount} of {totalCount}
      </span>
    </div>
  );

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'assignee': {
        return (
          <div className="flex flex-col h-full">
            <SearchInput placeholder="Search assignee" />
            <div className="flex-1 overflow-y-auto">
              {isLoadingAssignees ? (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  Loading...
                </div>
              ) : allAssignees.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  No assignees found
                </div>
              ) : (
                allAssignees.map((assignee) => (
                  <label
                    key={assignee.name}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.assignees.includes(assignee.name)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          assignees: toggle(filters.assignees, assignee.name),
                        })
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />

                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0"
                        style={{ backgroundColor: assignee.color ?? colors.accent }}
                      >
                        {getInitials(assignee.name)}
                      </div>

                      <span className="text-xs sm:text-sm text-gray-700 dark:text-slate-200">
                        {assignee.name}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <Footer selectedCount={filters.assignees.length} totalCount={allAssignees.length} />
          </div>
        );
      }

      case 'status': {
        const filteredStatuses = allStatuses.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <SearchInput placeholder="Search status" />
            <div className="flex-1 overflow-y-auto">
              {filteredStatuses.map((status) => (
                <label
                  key={status.id}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status.id)}
                    onChange={() =>
                      onChange({ ...filters, statuses: toggle(filters.statuses, status.id) })
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-slate-200">
                      {status.name}
                    </span>
                  </div>
                </label>
              ))}
              {filteredStatuses.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  No statuses found
                </div>
              )}
            </div>
            <Footer selectedCount={filters.statuses.length} totalCount={allStatuses.length} />
          </div>
        );
      }

      case 'priority': {
        const filteredPriorities = PRIORITIES.filter((p) =>
          p.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <SearchInput placeholder="Search priority" />
            <div className="flex-1 overflow-y-auto">
              {filteredPriorities.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.priorities.includes(priority)}
                    onChange={() =>
                      onChange({ ...filters, priorities: toggle(filters.priorities, priority) })
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <span
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: priorityColors[priority] }}
                  >
                    {priority}
                  </span>
                </label>
              ))}
              {filteredPriorities.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  No priorities found
                </div>
              )}
            </div>
            <Footer selectedCount={filters.priorities.length} totalCount={PRIORITIES.length} />
          </div>
        );
      }

      case 'type': {
        const filteredTypes = allTypes.filter((t) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <SearchInput placeholder="Search work type" />
            <div className="flex-1 overflow-y-auto">
              {filteredTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => onChange({ ...filters, types: toggle(filters.types, type) })}
                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-slate-100">
                    {type}
                  </span>
                </label>
              ))}
              {filteredTypes.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  No types found
                </div>
              )}
            </div>
            <Footer selectedCount={filters.types.length} totalCount={allTypes.length} />
          </div>
        );
      }

      case 'label': {
        const filteredLabels = allLabels.filter((l) =>
          l.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <SearchInput placeholder="Search labels" />
            <div className="flex-1 overflow-y-auto">
              {filteredLabels.map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.labels.includes(label)}
                    onChange={() => onChange({ ...filters, labels: toggle(filters.labels, label) })}
                    className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                    {label}
                  </span>
                </label>
              ))}
              {filteredLabels.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  No labels found
                </div>
              )}
            </div>
            <Footer selectedCount={filters.labels.length} totalCount={allLabels.length} />
          </div>
        );
      }
    }
  };

  const categories: { id: FilterCategory; label: string; show: boolean }[] = [
    { id: 'assignee', label: 'Assignee', show: true },
    { id: 'status', label: 'Status', show: allStatuses.length > 0 },
    { id: 'priority', label: 'Priority', show: true },
    { id: 'type', label: 'Work type', show: allTypes.length > 0 },
    { id: 'label', label: 'Labels', show: allLabels.length > 0 },
  ];

  return (
    <div
      className="absolute left-0 top-full z-50 mt-2 flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:left-auto sm:right-0"
      style={{
        width: '520px',
        maxWidth: 'calc(100vw - 32px)',
        height: '320px',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Left Sidebar */}
      <div className="flex w-40 flex-col border-r border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900/60 sm:w-44">
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-2.5 dark:border-slate-700">
          <span className="text-xs font-semibold text-gray-700 dark:text-slate-200 sm:text-sm">
            Filter by
          </span>

          <WpButton
            variant="ghost"
            size="sm"
            className="!p-1 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={onClose}
          >
            <X size={15} />
          </WpButton>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto">
          {categories
            .filter((c) => c.show)
            .map((category) => {
              const count = getActiveCount(category.id);
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchTerm('');
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors sm:text-sm ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{category.label}</span>

                  {count > 0 && (
                    <span
                      className={`rounded px-1.5 py-px text-[10px] font-medium ${
                        isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600 dark:bg-slate-600 dark:text-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
        </div>

        {/* Clear all */}
        <div className="border-t border-gray-200 p-2.5 dark:border-slate-700">
          {hasActive && (
            <WpButton
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  priorities: [],
                  assignees: [],
                  labels: [],
                  types: [],
                  statuses: [],
                })
              }
              className="w-full text-xs text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
            >
              Clear all
            </WpButton>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col bg-white dark:bg-slate-800">
        {renderCategoryContent()}
      </div>
    </div>
  );
};
