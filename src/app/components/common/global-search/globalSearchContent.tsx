'use client';

import React from 'react';
import {
  Search,
  Loader2,
  CheckSquare,
  BookOpen,
  FolderKanban,
  Zap,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../task';
import { getInitials } from '../format';
import type {
  SearchTaskItem,
  SearchUserStoryItem,
  SearchProjectItem,
  SearchMemberItem,
  SearchSprintItem,
} from '@/src/types/search';

export type UnifiedSearchResultItem =
  | { itemType: 'task'; data: SearchTaskItem }
  | { itemType: 'user_story'; data: SearchUserStoryItem }
  | { itemType: 'project'; data: SearchProjectItem }
  | { itemType: 'member'; data: SearchMemberItem }
  | { itemType: 'sprint'; data: SearchSprintItem };

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim() || !text) return <span>{text}</span>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={index}
            className="bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 font-semibold px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

interface GlobalSearchContentProps {
  resultsContainerRef: React.RefObject<HTMLDivElement | null>;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  debouncedQuery: string;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  flatResults: UnifiedSearchResultItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleSelectResult: (item: UnifiedSearchResultItem) => void;
  quickLinks: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    action: () => void;
  }[];
}

export const GlobalSearchContent = ({
  resultsContainerRef,
  loadMoreRef,
  debouncedQuery,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  flatResults,
  selectedIndex,
  setSelectedIndex,
  handleSelectResult,
  quickLinks,
}: GlobalSearchContentProps) => {
  return (
    <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
      {!debouncedQuery && (
        <div className="py-2 px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-200 mb-2 px-2">
            Quick Navigation
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickLinks.map((link) => (
              <button
                key={link.title}
                onClick={link.action}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shrink-0">
                  {link.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 dark:text-slate-200 flex items-center justify-between">
                    {link.title}
                    <ArrowRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                    {link.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/30 flex items-center gap-2.5 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold text-blue-800 dark:text-blue-200">💡 ProTip:</span>
            <span>
              Search by key like{' '}
              <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded font-semibold">
                TT-1
              </code>
              , title, project, member, or sprint.
            </span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
          <Loader2 size={28} className="animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
            Searching across workspace...
          </p>
        </div>
      )}

      {!isLoading && debouncedQuery && flatResults.length === 0 && (
        <div className="py-12 px-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 mb-3">
            <Search size={24} />
          </div>

          <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
            No results found for &ldquo;{debouncedQuery}&rdquo;
          </h4>

          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try searching for a different keyword, task key (e.g. TT-1), project name, or switch
            category filters.
          </p>
        </div>
      )}

      {!isLoading && debouncedQuery && flatResults.length > 0 && (
        <div className="space-y-1">
          {flatResults.map((item, index) => {
            const isSelected = index === selectedIndex;

            const itemClassName = `flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
            }`;

            const selectionIcon = isSelected && (
              <CornerDownLeft size={14} className="text-blue-500 hidden sm:inline" />
            );

            if (item.itemType === 'task') {
              const task = item.data;

              return (
                <div
                  key={`task-${task.id}`}
                  data-search-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={itemClassName}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                      <CheckSquare size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.key && (
                          <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                            {task.key}
                          </span>
                        )}

                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          <HighlightMatch text={task.title} query={debouncedQuery} />
                        </span>
                      </div>

                      {task.project_name && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <span className="text-gray-400">📁</span>
                          <span>{task.project_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <PriorityBadge priority={task.priority || 'medium'} />
                    <StatusBadge status={task.status || 'To Do'} />
                    {selectionIcon}
                  </div>
                </div>
              );
            }

            if (item.itemType === 'user_story') {
              const story = item.data;

              return (
                <div
                  key={`story-${story.id}`}
                  data-search-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={itemClassName}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <BookOpen size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {story.key && (
                          <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-900/40">
                            {story.key}
                          </span>
                        )}

                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          <HighlightMatch text={story.title} query={debouncedQuery} />
                        </span>
                      </div>

                      {story.project_name && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <span className="text-gray-400">📁</span>
                          <span>{story.project_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <PriorityBadge priority={story.priority || 'medium'} />
                    <StatusBadge status={story.status || 'To Do'} />
                    {selectionIcon}
                  </div>
                </div>
              );
            }

            if (item.itemType === 'project') {
              const project = item.data;
              const projectTitle = project.title || project.name || 'Untitled Project';

              return (
                <div
                  key={`project-${project.id}`}
                  data-search-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={itemClassName}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FolderKanban size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {project.key && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
                            {project.key}
                          </span>
                        )}

                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          <HighlightMatch text={projectTitle} query={debouncedQuery} />
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <StatusBadge status={project.status || 'To Do'} />
                    {selectionIcon}
                  </div>
                </div>
              );
            }

            if (item.itemType === 'member') {
              const member = item.data;
              const memberName = member.name || member.full_name || member.email || 'Member';
              const initials = getInitials(memberName);

              return (
                <div
                  key={`member-${member.id}`}
                  data-search-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={itemClassName}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        <HighlightMatch text={memberName} query={debouncedQuery} />
                      </p>

                      {member.email && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          <HighlightMatch text={member.email} query={debouncedQuery} />
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {member.role && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                        {member.role}
                      </span>
                    )}
                    {selectionIcon}
                  </div>
                </div>
              );
            }

            if (item.itemType === 'sprint') {
              const sprint = item.data;
              const sprintTitle = sprint.title || sprint.name || 'Sprint';

              return (
                <div
                  key={`sprint-${sprint.id}`}
                  data-search-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={itemClassName}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
                      <Zap size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        <HighlightMatch text={sprintTitle} query={debouncedQuery} />
                      </p>

                      {sprint.project_name && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                          <span className="text-gray-400">📁</span>
                          <span>{sprint.project_name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <StatusBadge status={sprint.status || 'To Do'} />
                    {selectionIcon}
                  </div>
                </div>
              );
            }

            return null;
          })}

          {hasNextPage && (
            <div ref={loadMoreRef} className="flex h-12 items-center justify-center">
              {isFetchingNextPage && <Loader2 size={20} className="animate-spin text-blue-500" />}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
