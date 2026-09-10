'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { colors } from '@/src/styles/colors';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { Flag, GripVertical, PlusCircle } from 'lucide-react';
import { Chip } from '@/src/app/components/common/chip';
import { PRIORITY_CONFIG } from '@/src/app/components/common/task-detail/components/badges';
import { Priority } from '@/src/types/board';

interface DraggableUserStoryProps {
  story: UserStoryResponse;
  projectId: string;
  tasks?: TaskResponse[];
  onStoryClick?: (story: UserStoryResponse) => void;
}

export const DraggableUserStory = ({
  story,
  tasks = [],
  onStoryClick,
}: DraggableUserStoryProps) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `story-${story.id}`,
    data: {
      type: 'story',
      storyId: story.id,
      story,
    },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `story-drop-${story.id}`,
    data: {
      type: 'story',
      storyId: story.id,
      sprintId: story.sprint_id ?? null,
      story,
    },
  });

  const setCombinedRef = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onStoryClick?.(story);
    }
  };

  // Priority UI
  const getPriorityConfig = (priority?: string | null) => {
    const normalized = priority
      ? ((priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) as Priority)
      : ('Medium' as Priority);
    return PRIORITY_CONFIG[normalized] ?? PRIORITY_CONFIG['Medium'];
  };

  const getStatusStyle = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'done':
        return {
          backgroundColor: colors.colDoneBg,
          color: colors.colDone,
        };

      case 'in_progress':
      case 'in progress':
        return {
          backgroundColor: colors.colInProgressBg,
          color: colors.colInProgress,
        };

      case 'in_review':
      case 'in review':
        return {
          backgroundColor: colors.colInReviewBg,
          color: colors.colInReview,
        };

      case 'testing':
        return {
          backgroundColor: colors.priorityMediumBg,
          color: colors.priorityMediumText,
        };

      case 'todo':
      case 'to do':
      default:
        return {
          backgroundColor: colors.colTodoBg,
          color: colors.colTodo,
        };
    }
  };

  const priorityConfig = getPriorityConfig(story.priority);
  const normalized = story.priority
    ? ((story.priority.charAt(0).toUpperCase() + story.priority.slice(1).toLowerCase()) as Priority)
    : ('Medium' as Priority);
  const statusStyle = getStatusStyle(story.status);
  const linkedTasks = tasks.filter((t) => t.user_story_id === story.id);
  const taskCount =
    linkedTasks.length > 0 ? linkedTasks.length : (story.tasks?.length ?? story.total_tasks ?? 0);

  return (
    <div
      ref={setCombinedRef}
      style={style}
      {...attributes}
      {...listeners}
      data-story-drop-id={story.id}
      className={`
      flex items-center gap-3
      px-4 py-3
      border-b border-gray-100 dark:border-slate-700 last:border-0
      bg-white dark:bg-slate-800
      hover:bg-gray-50 dark:hover:bg-slate-700/50
      transition-all duration-150
      ${isDragging ? 'bg-blue-50 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-400 ring-opacity-50 z-50' : ''}
      ${isOver ? 'bg-indigo-50/80 dark:bg-indigo-900/30 ring-2 ring-indigo-400 dark:ring-indigo-500 border-indigo-300 scale-[1.01] shadow-md z-40' : ''}
    `}
    >
      {/* Drag Handle */}
      <span
        className={`
        shrink-0 p-1 rounded
        ${isDragging ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/40' : 'text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400'}
      `}
      >
        <GripVertical size={15} />
      </span>

      {/* Story Title */}
      <div onClick={handleClick} className="flex-1 min-w-0 cursor-pointer">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span
              title={story.title}
              className={`block truncate text-sm font-semibold ${
                story.is_closed ? 'line-through text-gray-500 opacity-60' : 'dark:text-slate-100'
              }`}
              style={{
                color: story.is_closed ? undefined : isDragging ? colors.primary : undefined,
              }}
            >
              {story.title.length > 40 ? `${story.title.slice(0, 40)}...` : story.title}
            </span>
          </div>
          {isOver && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full animate-pulse">
              <PlusCircle size={12} />
              Assign Task
            </span>
          )}
        </div>
      </div>

      {/* Tasks badge if available */}
      {taskCount > 0 && (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
          title={`${taskCount} linked tasks`}
        >
          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
        </span>
      )}

      {/* Priority */}
      <Chip
        label={normalized}
        color={priorityConfig.color}
        bg={priorityConfig.bg}
        icon={<Flag size={11} />}
        className="shrink-0"
      />

      {/* Status */}
      <span
        className="
        flex items-center justify-center
        text-[11px]
        px-3 py-1
        rounded-full
        shrink-0
        font-semibold
        min-w-[90px]
      "
        style={statusStyle}
      >
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{
            backgroundColor: statusStyle.color,
          }}
        />
        {story.status ? story.status.replace(/_/g, ' ') : 'todo'}
      </span>
    </div>
  );
};
