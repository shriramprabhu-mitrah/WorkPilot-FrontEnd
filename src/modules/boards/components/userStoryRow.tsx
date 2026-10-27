import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Layers } from 'lucide-react';
import { UserStoryResponse } from '@/src/types/userstories';
import { CustomStatus } from '@/src/types/colors';
import { KanbanTask } from '@/src/types/board';
import { BoardPageFilters } from '@/src/modules/boards/hooks/useBoards';
import { StatusCell } from './statusCell';
import { OptimisticUpdate, MapTaskFn } from './types';
import { isStorylessId } from '../utils/storylessUtils';

interface UserStoryRowProps {
  story: UserStoryResponse & { tasksByStatus: Map<string, KanbanTask[]> };
  statuses: CustomStatus[];
  overCell: { storyId: string; statusId: string } | null;
  onUserStoryClick: (story: UserStoryResponse) => void;
  onTaskClick?: (task: KanbanTask) => void;
  onRefetch: () => void;
  collapsedStatuses: Set<string>;
  hasMoreByStatus: Map<string, boolean>;
  projectId: string;
  mapTask: MapTaskFn;
  allTasksRef: React.MutableRefObject<Map<string, KanbanTask>>;
  optimisticUpdates: Map<string, OptimisticUpdate>;
  pageFilters: BoardPageFilters;
}

const UserStoryRowComponent: React.FC<UserStoryRowProps> = ({
  story,
  statuses,
  overCell,
  onUserStoryClick,
  onTaskClick,
  onRefetch,
  collapsedStatuses,
  hasMoreByStatus,
  projectId,
  mapTask,
  allTasksRef,
  optimisticUpdates,
  pageFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const isSpecialStory = isStorylessId(story.id);

  return (
    <div
      className={`border-b border-gray-200 ${isSpecialStory ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
    >
      <div className="flex items-stretch">
        {/* Sticky User Story Column on the left */}
        <div
          className={`sticky left-0 z-10 border-r w-[200px] sm:w-[250px] flex-shrink-0 p-3 flex flex-col justify-start transition-colors ${
            isSpecialStory
              ? 'bg-indigo-50 border-indigo-200/80 dark:bg-slate-900/90 dark:border-indigo-900/50'
              : 'bg-gray-50 border-gray-200 dark:bg-gray-800/90 dark:border-gray-700'
          }`}
        >
          <div className="flex items-start gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 rounded transition-all duration-200 mt-0.5"
              aria-label={isExpanded ? 'Collapse story tasks' : 'Expand story tasks'}
            >
              <svg
                className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-300 ease-in-out ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div
              onClick={() => {
                if (!isSpecialStory) {
                  onUserStoryClick(story);
                }
              }}
              onMouseEnter={(e) => {
                if (isSpecialStory) return;
                setShowStoryPopup(true);
                setPopupPosition({
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onMouseMove={(e) => {
                if (isSpecialStory) return;
                setPopupPosition({
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onMouseLeave={() => setShowStoryPopup(false)}
              className={`relative flex items-start gap-2 flex-1 min-w-0 ${
                !isSpecialStory ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              {isSpecialStory ? (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-200 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs">
                      <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      Storyless Tasks
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-100 mt-1 pl-0.5">
                    {story.total_tasks ?? 0} {story.total_tasks === 1 ? 'task' : 'tasks'} (no story)
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{
                      backgroundColor:
                        story.priority === 'high'
                          ? '#dc2626'
                          : story.priority === 'medium'
                            ? '#f59e0b'
                            : '#10b981',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold text-gray-800 truncate dark:text-slate-100 ${
                        !isSpecialStory ? 'group-hover:text-blue-600 transition-colors' : ''
                      } ${story.is_closed ? 'line-through' : ''}`}
                    >
                      {story.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-200 mt-0.5">
                      {story.total_tasks ?? 0} tasks · {story.story_points ?? 0} pts
                    </p>
                  </div>
                </>
              )}
              {showStoryPopup &&
                typeof document !== 'undefined' &&
                createPortal(
                  <div
                    className="fixed z-[99999] w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:bg-gray-100"
                    style={{
                      left: popupPosition.x + 12,
                      top: popupPosition.y + 12,
                    }}
                  >
                    {/* Name */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <span className="text-xs text-gray-500 dark:text-slate-100 shrink-0">
                        Name
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-100 text-right break-words min-w-0 flex-1">
                        {story.title}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {/* Status */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Status</span>
                        <span className="text-sm font-medium text-gray-800 capitalize dark:text-slate-100">
                          {story.status?.replace('_', ' ') || '-'}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100 ">Assignee</span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800 dark:text-slate-100">
                          {story.assignee_name || story.assignee?.name || 'Unassigned'}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Due Date</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-100">
                          {story.due_date ? new Date(story.due_date).toLocaleDateString() : '-'}
                        </span>
                      </div>

                      {/* Reporter */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Reporter</span>
                        <span className="max-w-[160px] truncate text-sm font-medium text-gray-800 dark:text-slate-100">
                          {story.reporter_name || story.reporter?.name || '-'}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 dark:text-slate-100">Priority</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-slate-100 capitalize">
                          {story.priority || '-'}
                        </span>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>

          {/* Empty status columns for header row */}
          {statuses.map((status) => {
            const isCollapsed = collapsedStatuses.has(status.id);
            return (
              <div
                key={status.id}
                className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                  isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
                }`}
              />
            );
          })}
        </div>

        {statuses.map((status) => {
          const tasks = story.tasksByStatus.get(status.id) || [];
          const isOver = overCell?.storyId === story.id && overCell?.statusId === status.id;
          const isCollapsed = collapsedStatuses.has(status.id);

          return (
            <div
              key={status.id}
              className={`flex-shrink-0 border-r border-gray-200 transition-all duration-300 ${
                isCollapsed ? 'w-[60px]' : 'w-[240px] sm:w-[260px]'
              }`}
            >
              {/* Expanded Tasks with smooth CSS Grid animation */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isExpanded && !isCollapsed
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <StatusCell
                    storyId={story.id}
                    statusId={status.id}
                    tasks={tasks}
                    isOver={isOver}
                    onTaskClick={onTaskClick}
                    onRefetch={onRefetch}
                    hasMore={hasMoreByStatus.get(status.id) ?? false}
                    projectId={projectId}
                    mapTask={mapTask}
                    allTasksRef={allTasksRef}
                    optimisticUpdates={optimisticUpdates}
                    pageFilters={pageFilters}
                  />
                </div>
              </div>

              {/* Collapsed summary with smooth transition */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  !isExpanded || isCollapsed
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="h-[52px] p-2 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      {tasks.length > 0 ? (
                        isCollapsed ? (
                          tasks.length
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const UserStoryRow = React.memo(UserStoryRowComponent, (prev, next) => {
  const prevIsOverStory = prev.overCell?.storyId === prev.story.id;
  const nextIsOverStory = next.overCell?.storyId === next.story.id;
  if (prevIsOverStory !== nextIsOverStory) return false;
  if (prevIsOverStory && nextIsOverStory && prev.overCell?.statusId !== next.overCell?.statusId) {
    return false;
  }
  if (prev.story !== next.story) return false;
  if (prev.statuses !== next.statuses) return false;
  if (prev.collapsedStatuses !== next.collapsedStatuses) return false;
  if (prev.hasMoreByStatus !== next.hasMoreByStatus) return false;
  if (prev.optimisticUpdates !== next.optimisticUpdates) return false;
  if (prev.projectId !== next.projectId) return false;
  if (prev.pageFilters !== next.pageFilters) return false;
  if (prev.onUserStoryClick !== next.onUserStoryClick) return false;
  if (prev.onTaskClick !== next.onTaskClick) return false;
  if (prev.onRefetch !== next.onRefetch) return false;
  return true;
});
