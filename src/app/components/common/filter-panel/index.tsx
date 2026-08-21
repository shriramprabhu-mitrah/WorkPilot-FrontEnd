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
  allAssignees: string[];
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

  const getAvatarColor = (name: string) => {
    const avatarColors = [
      '#6366f1',
      '#3b82f6',
      '#ec4899',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#06b6d4',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[index % avatarColors.length];
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'assignee': {
        return (
          <div className="flex flex-col h-full">
            <div className="p-2.5 border-b" style={{ borderColor: colors.gray200 }}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search assignee"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Call server-side search if available
                    if (onAssigneeSearch) {
                      onAssigneeSearch(e.target.value);
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.gray300 }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoadingAssignees ? (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
                  Loading...
                </div>
              ) : allAssignees.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
                  No assignees found
                </div>
              ) : (
                allAssignees.map((assignee) => (
                  <label
                    key={assignee}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.assignees.includes(assignee)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          assignees: toggle(filters.assignees, assignee),
                        })
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ backgroundColor: getAvatarColor(assignee) }}
                      >
                        {getInitials(assignee)}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700">{assignee}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div
              className="flex items-center justify-between p-2.5 border-t"
              style={{ borderColor: colors.gray200 }}
            >
              <button
                onClick={clearCategory}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                disabled={filters.assignees.length === 0}
              >
                Clear
              </button>
              <span className="text-xs text-gray-500">
                {filters.assignees.length} of {allAssignees.length}
              </span>
            </div>
          </div>
        );
      }

      case 'status': {
        const filteredStatuses = allStatuses.filter((s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <div className="p-2.5 border-b" style={{ borderColor: colors.gray200 }}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search status"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.gray300 }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredStatuses.map((status) => (
                <label
                  key={status.id}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status.id)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        statuses: toggle(filters.statuses, status.id),
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{status.name}</span>
                  </div>
                </label>
              ))}
              {filteredStatuses.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
                  No statuses found
                </div>
              )}
            </div>
            <div
              className="flex items-center justify-between p-2.5 border-t"
              style={{ borderColor: colors.gray200 }}
            >
              <button
                onClick={clearCategory}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                disabled={filters.statuses.length === 0}
              >
                Clear
              </button>
              <span className="text-xs text-gray-500">
                {filters.statuses.length} of {allStatuses.length}
              </span>
            </div>
          </div>
        );
      }

      case 'priority': {
        const filteredPriorities = PRIORITIES.filter((p) =>
          p.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <div className="p-2.5 border-b" style={{ borderColor: colors.gray200 }}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search priority"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.gray300 }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredPriorities.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.priorities.includes(priority)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        priorities: toggle(filters.priorities, priority),
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className="text-xs sm:text-sm text-gray-700"
                    style={{ color: priorityColors[priority] }}
                  >
                    {priority}
                  </span>
                </label>
              ))}
              {filteredPriorities.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
                  No priorities found
                </div>
              )}
            </div>
            <div
              className="flex items-center justify-between p-2.5 border-t"
              style={{ borderColor: colors.gray200 }}
            >
              <button
                onClick={clearCategory}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                disabled={filters.priorities.length === 0}
              >
                Clear
              </button>
              <span className="text-xs text-gray-500">
                {filters.priorities.length} of {PRIORITIES.length}
              </span>
            </div>
          </div>
        );
      }

      case 'type': {
        const filteredTypes = allTypes.filter((t) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <div className="p-2.5 border-b" style={{ borderColor: colors.gray200 }}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search work type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.gray300 }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        types: toggle(filters.types, type),
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{type}</span>
                </label>
              ))}
              {filteredTypes.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
                  No types found
                </div>
              )}
            </div>
            <div
              className="flex items-center justify-between p-2.5 border-t"
              style={{ borderColor: colors.gray200 }}
            >
              <button
                onClick={clearCategory}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                disabled={filters.types.length === 0}
              >
                Clear
              </button>
              <span className="text-xs text-gray-500">
                {filters.types.length} of {allTypes.length}
              </span>
            </div>
          </div>
        );
      }

      case 'label': {
        const filteredLabels = allLabels.filter((l) =>
          l.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return (
          <div className="flex flex-col h-full">
            <div className="p-2.5 border-b" style={{ borderColor: colors.gray200 }}>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search labels"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.gray300 }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredLabels.map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.labels.includes(label)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        labels: toggle(filters.labels, label),
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{label}</span>
                </label>
              ))}
              {filteredLabels.length === 0 && searchTerm && (
                <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
                  No labels found
                </div>
              )}
            </div>
            <div
              className="flex items-center justify-between p-2.5 border-t"
              style={{ borderColor: colors.gray200 }}
            >
              <button
                onClick={clearCategory}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                disabled={filters.labels.length === 0}
              >
                Clear
              </button>
              <span className="text-xs text-gray-500">
                {filters.labels.length} of {allLabels.length}
              </span>
            </div>
          </div>
        );
      }
    }
  };

  const categories: { id: FilterCategory; label: string; show: boolean }[] = [
    { id: 'assignee', label: 'Assignee', show: true }, // Always show assignee category
    { id: 'status', label: 'Status', show: allStatuses.length > 0 },
    { id: 'priority', label: 'Priority', show: true },
    { id: 'type', label: 'Work type', show: allTypes.length > 0 },
    { id: 'label', label: 'Labels', show: allLabels.length > 0 },
  ];

  return (
    <div
      className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 rounded-lg shadow-2xl border flex overflow-hidden"
      style={{
        backgroundColor: colors.white,
        borderColor: colors.gray200,
        width: '520px',
        maxWidth: 'calc(100vw - 32px)',
        height: '320px',
        maxHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Left Sidebar */}
      <div
        className="w-40 sm:w-44 border-r flex flex-col"
        style={{ borderColor: colors.gray200, backgroundColor: colors.gray50 }}
      >
        <div
          className="flex items-center justify-between p-2.5 border-b"
          style={{ borderColor: colors.gray200 }}
        >
          <span className="text-xs sm:text-sm font-semibold text-gray-700">Filter by</span>
          <WpButton
            variant="ghost"
            size="sm"
            className="!p-1 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={15} />
          </WpButton>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories
            .filter((c) => c.show)
            .map((category) => {
              const count = getActiveCount(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition-colors flex items-center justify-between ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{category.label}</span>
                  {count > 0 && (
                    <span
                      className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                      style={{
                        backgroundColor: selectedCategory === category.id ? '#3b82f6' : '#e5e7eb',
                        color: selectedCategory === category.id ? 'white' : '#6b7280',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
        <div className="p-2.5 border-t" style={{ borderColor: colors.gray200 }}>
          {hasActive && (
            <WpButton
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({ priorities: [], assignees: [], labels: [], types: [], statuses: [] })
              }
              className="w-full text-xs text-gray-600 hover:text-gray-800"
            >
              Clear all
            </WpButton>
          )}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">{renderCategoryContent()}</div>
    </div>
  );
};
