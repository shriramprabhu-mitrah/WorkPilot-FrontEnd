'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Loader2,
  CheckSquare,
  BookOpen,
  FolderKanban,
  User,
  Zap,
  ArrowRight,
  CornerDownLeft,
  LayoutGrid,
  FileText,
  Users,
  Settings,
  ListTodo,
} from 'lucide-react';
import { useGlobalSearch } from '@/src/hooks/useGlobalSearch';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { setSelectedProject } from '@/src/store/slices/project';
import {
  SearchTaskItem,
  SearchUserStoryItem,
  SearchProjectItem,
  SearchMemberItem,
  SearchSprintItem,
  SearchCategory,
} from '@/src/types/search';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';
import { getInitials } from '../format';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UnifiedSearchResultItem =
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
        regex.test(part) ? (
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

const PriorityBadge = ({ priority }: { priority?: string }) => {
  if (!priority) return null;
  const p = priority.toLowerCase();
  let colorClass =
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  if (p === 'low') {
    colorClass =
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800';
  } else if (p === 'medium') {
    colorClass =
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  } else if (p === 'high') {
    colorClass =
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800';
  } else if (p === 'urgent' || p === 'critical') {
    colorClass =
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
  }

  return (
    <span
      className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${colorClass}`}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;
  const s = status.toLowerCase().replace(/_/g, ' ');
  let colorClass =
    'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-slate-700';

  if (s.includes('done') || s.includes('complete')) {
    colorClass =
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  } else if (s.includes('progress') || s.includes('active')) {
    colorClass =
      'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  } else if (s.includes('planning') || s.includes('todo') || s.includes('backlog')) {
    colorClass =
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }

  return (
    <span
      className={`text-[10px] capitalize font-medium px-1.5 py-0.5 rounded border ${colorClass}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export const GlobalSearchModal = ({ isOpen, onClose }: GlobalSearchModalProps) => {
  const {
    query,
    setQuery,
    debouncedQuery,
    activeCategory,
    setActiveCategory,
    searchData,
    counts,
    isLoading,
    isFetching,
    clearSearch,
  } = useGlobalSearch();

  const { push } = useOrgNavigation();
  const dispatch = useAppDispatch();
  const { projectsWithSprints } = useGetProjectsWithSprints();
  const currentProject = useAppSelector((state) => state.project.selectedProject);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      clearSearch();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
    }
  }, [isOpen, clearSearch]);

  // Flatten active search results for keyboard navigation
  const flatResults = useMemo((): UnifiedSearchResultItem[] => {
    const list: UnifiedSearchResultItem[] = [];

    if (activeCategory === 'all' || activeCategory === 'tasks') {
      searchData.tasks.forEach((item) => list.push({ itemType: 'task', data: item }));
    }
    if (activeCategory === 'all' || activeCategory === 'user_stories') {
      searchData.user_stories.forEach((item) => list.push({ itemType: 'user_story', data: item }));
    }
    if (activeCategory === 'all' || activeCategory === 'projects') {
      searchData.projects.forEach((item) => list.push({ itemType: 'project', data: item }));
    }
    if (activeCategory === 'all' || activeCategory === 'members') {
      searchData.members.forEach((item) => list.push({ itemType: 'member', data: item }));
    }
    if (activeCategory === 'all' || activeCategory === 'sprints') {
      searchData.sprints.forEach((item) => list.push({ itemType: 'sprint', data: item }));
    }

    return list;
  }, [searchData, activeCategory]);

  // Reset selected index when query or results change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(0);
  }, [debouncedQuery, activeCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-search-index="${selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Handle navigation to clicked/selected search item
  const handleSelectResult = useCallback(
    (item: UnifiedSearchResultItem) => {
      onClose();

      if (item.itemType === 'task') {
        const task = item.data;
        const matched = projectsWithSprints?.find(
          (p) =>
            (task.project_slug && p.slug === task.project_slug) ||
            (task.project_id && p.id === task.project_id) ||
            (task.project_name && p.name?.toLowerCase() === task.project_name.toLowerCase())
        );
        const projSlug =
          task.project_slug ||
          matched?.slug ||
          matched?.key ||
          currentProject?.slug ||
          currentProject?.key ||
          task.project_id;
        const taskIdentifier = task.key || task.id;

        if (projSlug && taskIdentifier) {
          if (matched && matched.id !== currentProject?.id) {
            dispatch(setSelectedProject(matched as Parameters<typeof setSelectedProject>[0]));
          }
          push(`/${projSlug}/boards/${taskIdentifier}`);
        } else {
          push('/tasks');
        }
      } else if (item.itemType === 'user_story') {
        const story = item.data;
        const matched = projectsWithSprints?.find(
          (p) =>
            (story.project_slug && p.slug === story.project_slug) ||
            (story.project_id && p.id === story.project_id) ||
            (story.project_name && p.name?.toLowerCase() === story.project_name.toLowerCase())
        );
        const projSlug =
          story.project_slug ||
          matched?.slug ||
          matched?.key ||
          currentProject?.slug ||
          currentProject?.key ||
          story.project_id;
        const storyIdentifier = story.key || story.id;

        if (projSlug && storyIdentifier) {
          if (matched && matched.id !== currentProject?.id) {
            dispatch(setSelectedProject(matched as Parameters<typeof setSelectedProject>[0]));
          }
          push(`/${projSlug}/boards/${storyIdentifier}`);
        } else {
          push('/backlog');
        }
      } else if (item.itemType === 'project') {
        const project = item.data;
        const matched = projectsWithSprints?.find(
          (p) =>
            (project.slug && p.slug === project.slug) ||
            (project.project_slug && p.slug === project.project_slug) ||
            p.id === project.id
        );
        if (matched) {
          dispatch(setSelectedProject(matched as Parameters<typeof setSelectedProject>[0]));
        }
        const projSlug =
          project.project_slug ||
          project.slug ||
          matched?.slug ||
          matched?.key ||
          project.key ||
          project.id;
        push(`/${projSlug}/boards`);
      } else if (item.itemType === 'member') {
        push('/teams');
      } else if (item.itemType === 'sprint') {
        const sprint = item.data;
        const matched = projectsWithSprints?.find(
          (p) =>
            (sprint.project_slug && p.slug === sprint.project_slug) ||
            (sprint.project_id && p.id === sprint.project_id) ||
            (sprint.project_name && p.name?.toLowerCase() === sprint.project_name.toLowerCase())
        );
        if (matched && matched.id !== currentProject?.id) {
          dispatch(setSelectedProject(matched as Parameters<typeof setSelectedProject>[0]));
        }
        const projSlug = sprint.project_slug || matched?.slug || matched?.key || sprint.project_id;
        if (projSlug) {
          push(`/${projSlug}/backlog`);
        } else {
          push('/sprint');
        }
      }
    },
    [onClose, projectsWithSprints, currentProject, dispatch, push]
  );

  // Quick navigation shortcuts when query is empty
  const quickLinks = useMemo(
    () => [
      {
        title: 'Projects',
        desc: 'View all projects and workspaces',
        icon: <FolderKanban size={16} className="text-blue-600 dark:text-blue-400" />,
        action: () => {
          onClose();
          push('/projects');
        },
      },
      //   {
      //     title: 'Tasks',
      //     desc: 'View and manage all organization tasks',
      //     icon: <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400" />,
      //     action: () => {
      //       onClose();
      //       push('/tasks');
      //     },
      //   },
      //   {
      //     title: 'Issues',
      //     desc: 'Review tracker issues and tickets',
      //     icon: <ListTodo size={16} className="text-amber-600 dark:text-amber-400" />,
      //     action: () => {
      //       onClose();
      //       push('/issues');
      //     },
      //   },
      {
        title: 'Team Members',
        desc: 'Manage organization team and roles',
        icon: <Users size={16} className="text-emerald-600 dark:text-emerald-400" />,
        action: () => {
          onClose();
          push('/teams');
        },
      },
      {
        title: 'Settings',
        desc: 'Configure organization and workspace settings',
        icon: <Settings size={16} className="text-purple-600 dark:text-purple-400" />,
        action: () => {
          onClose();
          push('/settings');
        },
      },
    ],
    [onClose, push]
  );

  // Keyboard navigation listener inside modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelectResult(flatResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const categories: { key: SearchCategory; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'tasks', label: 'Tasks', count: counts.tasks },
    { key: 'user_stories', label: 'User Stories', count: counts.user_stories },
    { key: 'projects', label: 'Projects', count: counts.projects },
    { key: 'members', label: 'Members', count: counts.members },
    { key: 'sprints', label: 'Sprints', count: counts.sprints },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] z-10 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-slate-800 gap-3 bg-white dark:bg-slate-900">
          <Search size={19} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, user stories, projects, members, sprints..."
            className="flex-1 bg-transparent border-0 outline-none text-[15px] sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 font-medium"
          />

          {isFetching && <Loader2 size={17} className="animate-spin text-blue-500 shrink-0" />}

          {query && (
            <button
              onClick={() => {
                clearSearch();
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Category Tabs */}
        {debouncedQuery.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/70 dark:bg-slate-900/60 overflow-x-auto no-scrollbar shrink-0">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-blue-700/80 text-white'
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
          {/* Initial State (Query is empty) */}
          {!debouncedQuery && (
            <div className="py-2 px-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2 px-2">
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

              {/* Pro Search Tip */}
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

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                Searching across workspace...
              </p>
            </div>
          )}

          {/* No Results State */}
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

          {/* Results List */}
          {!isLoading && debouncedQuery && flatResults.length > 0 && (
            <div className="space-y-1">
              {flatResults.map((item, index) => {
                const isSelected = index === selectedIndex;

                if (item.itemType === 'task') {
                  const task = item.data;
                  return (
                    <div
                      key={`task-${task.id}`}
                      data-search-index={index}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
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
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        {isSelected && (
                          <CornerDownLeft size={14} className="text-blue-500 hidden sm:inline" />
                        )}
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
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
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
                        <PriorityBadge priority={story.priority} />
                        <StatusBadge status={story.status} />
                        {isSelected && (
                          <CornerDownLeft size={14} className="text-blue-500 hidden sm:inline" />
                        )}
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
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
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
                        <StatusBadge status={project.status} />
                        {isSelected && (
                          <CornerDownLeft size={14} className="text-blue-500 hidden sm:inline" />
                        )}
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
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
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
                        {isSelected && (
                          <CornerDownLeft size={14} className="text-blue-500 hidden sm:inline" />
                        )}
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
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
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
                        <StatusBadge status={sprint.status} />
                        {isSelected && (
                          <CornerDownLeft size={14} className="text-blue-500 hidden sm:inline" />
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ↓
              </kbd>
              <span className="text-[11px]">Navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ↵
              </kbd>
              <span className="text-[11px]">Select</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-[10px] font-semibold">
                ESC
              </kbd>
              <span className="text-[11px]">Close</span>
            </span>
          </div>

          {debouncedQuery && !isLoading && (
            <span className="text-[11px] font-medium text-gray-600 dark:text-slate-300">
              {flatResults.length} {flatResults.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
