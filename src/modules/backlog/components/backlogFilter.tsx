'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { PriorityBadge } from '@/src/app/components/common/task';
export type FilterOption = { value: string; label: string; color?: string };
export type BacklogFilters = {
  statuses: string[];
  priorities: string[];
};

export const EMPTY_BACKLOG_FILTERS: BacklogFilters = {
  statuses: [],
  priorities: [],
};
export const DEFAULT_PRIORITY_OPTIONS: FilterOption[] = [
  { value: 'critical', label: 'Critical', color: '#EF4444' },
  { value: 'high', label: 'High', color: '#F97316' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'low', label: 'Low', color: '#22C55E' },
];

export const countActiveFilters = (f: BacklogFilters) => f.statuses.length + f.priorities.length;

export const filtersToParams = (f: BacklogFilters) => ({
  status: f.statuses.length ? f.statuses.join(',') : undefined,
  priority: f.priorities.length ? f.priorities.join(',') : undefined,
});

export const taskFiltersToParams = (f: BacklogFilters) => ({
  status_id: f.statuses.length ? f.statuses.join(',') : undefined,
  priority: f.priorities.length ? f.priorities.join(',') : undefined,
});

interface BacklogFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: BacklogFilters;
  onFiltersChange: (filters: BacklogFilters) => void;
  searchPlaceholder?: string;
  statusOptions: FilterOption[];
  priorityOptions?: FilterOption[];
  isLoadingStatuses?: boolean;
}

export const BacklogFilterToolbar = ({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  searchPlaceholder = 'Search by task, ID or keyword',
  statusOptions,
  priorityOptions = DEFAULT_PRIORITY_OPTIONS,
  isLoadingStatuses = false,
}: BacklogFilterToolbarProps) => {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [draftFilters, setDraftFilters] = useState<BacklogFilters>(() => ({
    statuses: [...filters.statuses],
    priorities: [...filters.priorities],
  }));

  const rootRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleValue = useCallback((key: keyof BacklogFilters, value: string) => {
    setDraftFilters((prev) => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  }, []);

  const handleToggleSearch = () => {
    if (showSearch && search) {
      onSearchChange('');
    }
    setShowSearch((v) => !v);
  };

  const handleResetFilters = useCallback(() => {
    setDraftFilters({
      statuses: [],
      priorities: [],
    });
    onFiltersChange({
      statuses: [],
      priorities: [],
    });
  }, [onFiltersChange]);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange({
      statuses: [...draftFilters.statuses],
      priorities: [...draftFilters.priorities],
    });
    setOpen(false);
  }, [draftFilters, onFiltersChange]);

  const handleClose = () => {
    setDraftFilters({
      statuses: [...filters.statuses],
      priorities: [...filters.priorities],
    });
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className="flex items-center gap-2 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      {showSearch && (
        <WpInput
          type="text"
          placeholder={searchPlaceholder}
          icon={<Search size={14} className="dark:text-slate-100" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          wrapperClassName="w-40 sm:w-56"
        />
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (open) {
              handleClose();
            } else {
              setDraftFilters({
                statuses: [...filters.statuses],
                priorities: [...filters.priorities],
              });
              setOpen(true);
            }
          }}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            open || activeCount > 0
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Filter size={14} />
          Filter
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full z-30 mt-2 w-[300px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                Filters &amp; view
              </h3>

              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-800 dark:text-slate-300 dark:hover:text-slate-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Show search bar
                </p>

                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Turn on to show search in the toolbar
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showSearch}
                onClick={handleToggleSearch}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  showSearch ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    showSearch ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Status
            </p>
            {isLoadingStatuses ? (
              <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-5 animate-pulse rounded bg-gray-100 dark:bg-slate-700"
                  />
                ))}
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {statusOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={draftFilters.statuses.includes(opt.value)}
                      onChange={() => toggleValue('statuses', opt.value)}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />

                    <span className="flex items-center gap-1.5">
                      {opt.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
              Priority
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = draftFilters.priorities.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleValue('priorities', opt.value)}
                    aria-pressed={isSelected}
                    className={`rounded-lg px-1 py-1 ${
                      isSelected
                        ? 'rounded-lg ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800'
                        : ''
                    }`}
                  >
                    <PriorityBadge priority={opt.value} />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
              >
                Reset filters
              </button>

              <WpButton size="sm" onClick={handleApplyFilters}>
                Done
              </WpButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
