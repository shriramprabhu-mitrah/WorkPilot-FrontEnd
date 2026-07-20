"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search, Filter } from "lucide-react";
import { SPRINTS, BACKLOG_TASKS } from "../data";
import { SprintSection } from "../components/SprintSection";
import { BacklogRow } from "../components/BacklogRow";
import { colors } from "@/src/styles/colors";

export const BacklogTemplate = () => {
  const [backlogOpen, setBacklogOpen] = useState(true);
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const filteredBacklog = BACKLOG_TASKS.filter(
    (t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q),
  );

  const filteredSprints = SPRINTS.map((s) => ({
    ...s,
    tasks: s.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q),
    ),
  }));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: colors.gray900 }}
          >
            Backlog
          </h1>
          <p
            className="text-sm mt-0.5 truncate"
            style={{ color: colors.gray500 }}
          >
            Atlas Platform · {SPRINTS.length} sprints · {BACKLOG_TASKS.length}{" "}
            unassigned tasks
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm flex-1 sm:flex-initial min-w-0"
            style={{
              borderColor: colors.gray200,
              backgroundColor: colors.white,
            }}
          >
            <Search
              size={14}
              style={{ color: colors.gray400 }}
              className="shrink-0"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-sm w-full sm:w-40 min-w-0"
              style={{ color: colors.gray700 }}
            />
          </div>

          {/* Filter */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium shadow-sm transition-colors shrink-0"
            style={{
              borderColor: colors.gray200,
              backgroundColor: colors.white,
              color: colors.gray700,
            }}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Create Sprint */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors shrink-0"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create Sprint</span>
            <span className="sm:hidden">Sprint</span>
          </button>
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
              {backlogOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: colors.gray900 }}
            >
              Backlog
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
              style={{ color: colors.gray500, backgroundColor: colors.gray100 }}
            >
              {filteredBacklog.length} issues
            </span>
            <div className="ml-auto">
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  borderColor: colors.gray200,
                  color: colors.gray700,
                  backgroundColor: colors.white,
                }}
              >
                <Plus size={12} />
                <span className="hidden sm:inline">Add to Sprint</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {backlogOpen && (
            <div>
              {filteredBacklog.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No backlog tasks found.
                </p>
              ) : (
                filteredBacklog.map((task) => (
                  <BacklogRow key={task.id} task={task} />
                ))
              )}
              <div className="px-3 sm:px-4 py-2">
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                  <Plus size={13} />
                  Add task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
