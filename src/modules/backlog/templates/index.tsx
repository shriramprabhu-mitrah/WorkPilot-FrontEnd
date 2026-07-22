'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Filter } from 'lucide-react';
import { SPRINTS, BACKLOG_TASKS } from '../data';
import { SprintSection } from '../components/SprintSection';
import { BacklogRow } from '../components/BacklogRow';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';

export const BacklogTemplate = () => {
  const [backlogOpen, setBacklogOpen] = useState(true);
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filteredBacklog = BACKLOG_TASKS.filter(
    (t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  );

  const filteredSprints = SPRINTS.map((s) => ({
    ...s,
    tasks: s.tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    ),
  }));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.gray900 }}>
            Backlog
          </h1>
          <p className="text-sm mt-0.5 truncate" style={{ color: colors.gray500 }}>
            Atlas Platform · {SPRINTS.length} sprints · {BACKLOG_TASKS.length} unassigned tasks
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <WpInput
            type="text"
            placeholder="Search tasks..."
            icon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="w-full sm:w-40"
            className="!py-1.5"
          />

          {/* Filter */}
          <WpButton variant="secondary" size="sm" leftIcon={<Filter size={14} />}>
            <span className="hidden sm:inline">Filter</span>
          </WpButton>

          {/* Create Sprint */}
          <WpButton size="sm" leftIcon={<Plus size={14} />}>
            <span className="hidden sm:inline">Create Sprint</span>
            <span className="sm:hidden">Sprint</span>
          </WpButton>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1">
        {filteredSprints.map((sprint) => (
          <SprintSection key={sprint.id} sprint={sprint} />
        ))}

        {/* Backlog section */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-3">
          <div
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
            onClick={() => setBacklogOpen((v) => !v)}
          >
            <span className="text-gray-400 shrink-0">
              {backlogOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            <span className="font-semibold text-sm" style={{ color: colors.gray900 }}>
              Backlog
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
              style={{ color: colors.gray500, backgroundColor: colors.gray100 }}
            >
              {filteredBacklog.length} issues
            </span>
            <div className="ml-auto">
              <WpButton
                variant="secondary"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                leftIcon={<Plus size={12} />}
              >
                <span className="hidden sm:inline">Add to Sprint</span>
                <span className="sm:hidden">Add</span>
              </WpButton>
            </div>
          </div>

          {backlogOpen && (
            <div>
              {filteredBacklog.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No backlog tasks found.</p>
              ) : (
                filteredBacklog.map((task) => <BacklogRow key={task.id} task={task} />)
              )}
              <div className="px-3 sm:px-4 py-2">
                <WpButton
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  className="text-gray-400 hover:text-blue-600"
                >
                  Add task
                </WpButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
