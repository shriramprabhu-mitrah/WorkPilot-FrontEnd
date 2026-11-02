'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Loader2, FolderKanban, Users, Settings } from 'lucide-react';
import { UnifiedSearchResultItem, useGlobalSearch } from '@/src/hooks/useGlobalSearch';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { setSelectedProject } from '@/src/store/slices/project';
import {
  SearchCategory,
} from '@/src/types/search';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';
import { usePermissions } from '@/src/hooks/usePermissions';
import { GlobalSearchContent } from './globalSearchContent';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const GlobalSearchModal = ({ isOpen, onClose }: GlobalSearchModalProps) => {
  const {
    query,
    setQuery,
    debouncedQuery,
    activeCategory,
    setActiveCategory,
    flatResults,
    counts,
    isLoading,
    isFetching,
    clearSearch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGlobalSearch();

  const { push } = useOrgNavigation();
  const { isOrgAdmin } = usePermissions();
  const dispatch = useAppDispatch();
  const { projectsWithSprints } = useGetProjectsWithSprints();
  const currentProject = useAppSelector((state) => state.project.selectedProject);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = loadMoreRef.current;
    const root = resultsContainerRef.current;
    if (!el || !root || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { root, rootMargin: '0px 0px 80px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, flatResults.length]);

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
      {
        title: 'Team Members',
        desc: 'Manage organization team and roles',
        icon: <Users size={16} className="text-emerald-600 dark:text-emerald-400" />,
        action: () => {
          onClose();
          push('/teams');
        },
      },
      ...(isOrgAdmin
        ? [
            {
              title: 'Settings',
              desc: 'Configure organization and workspace settings',
              icon: <Settings size={16} className="text-purple-600 dark:text-purple-400" />,
              action: () => {
                onClose();
                push('/settings');
              },
            },
          ]
        : []),
    ],
    [onClose, push, isOrgAdmin]
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
      if (selectedIndex < flatResults.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      } else if (hasNextPage) {
        fetchNextPage();
      } else {
        setSelectedIndex(0);
      }
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
            className="flex-1 bg-transparent border-0 outline-none text-[15px] sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-200 font-medium"
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
        <GlobalSearchContent
          resultsContainerRef={resultsContainerRef}
          loadMoreRef={loadMoreRef}
          debouncedQuery={debouncedQuery}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          flatResults={flatResults}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          handleSelectResult={handleSelectResult}
          quickLinks={quickLinks}
        />

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
