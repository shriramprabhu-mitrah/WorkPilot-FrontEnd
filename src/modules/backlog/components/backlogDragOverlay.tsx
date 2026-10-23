'use client';

import { DragOverlay } from '@dnd-kit/core';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar, PriorityBadge, StatusBadge } from '@/src/app/components/common/task';

type ActiveTask = {
  key?: string;
  title: string;
  priority?: string;
  status?: string | null;
  assignee_name?: string | null;
};

type ActiveStory = {
  title: string;
  priority?: string | null;
  status?: string | null;
};

type BacklogDragOverlayProps = {
  activeTask: ActiveTask | null;
  activeStory: ActiveStory | null;
};

export const BacklogDragOverlayContent = ({ activeTask, activeStory }: BacklogDragOverlayProps) => {
  return (
    <DragOverlay>
      {activeTask ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-3 border-2 border-blue-500 max-w-md transform rotate-2 scale-105 transition-transform select-none">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] sm:text-xs font-semibold shrink-0"
              style={{ color: colors.primary }}
            >
              {activeTask.key || '-'}
            </span>

            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate flex-1">
              {activeTask.title}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <PriorityBadge priority={activeTask.priority || 'Medium'} />
            <StatusBadge status={activeTask.status ?? ''} />

            {activeTask.assignee_name && (
              <div className="flex items-center gap-1.5 ml-auto">
                <AssigneeAvatar
                  initials={activeTask.assignee_name?.charAt(0).toUpperCase() || '?'}
                  color={colors.primary}
                  size="sm"
                />

                <span className="text-xs text-gray-600 dark:text-slate-400 truncate max-w-[100px]">
                  {activeTask.assignee_name}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : activeStory ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-3 border-2 border-blue-500 max-w-md transform rotate-3 scale-105 transition-transform">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                {activeStory.title}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                  style={{
                    backgroundColor:
                      activeStory.priority === 'high'
                        ? '#FEE2E2'
                        : activeStory.priority === 'low'
                          ? '#DBEAFE'
                          : colors.gray100,
                    color:
                      activeStory.priority === 'high'
                        ? '#DC2626'
                        : activeStory.priority === 'low'
                          ? '#2563EB'
                          : colors.gray500,
                  }}
                >
                  {activeStory.priority ?? 'medium'}
                </span>

                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                  style={{
                    backgroundColor: colors.colTodoBg,
                    color: colors.primary,
                  }}
                >
                  {activeStory.status ?? 'todo'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </div>
          </div>
        </div>
      ) : null}
    </DragOverlay>
  );
};
