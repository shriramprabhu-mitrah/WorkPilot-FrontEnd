'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { colors } from '@/src/styles/colors';
import { UserStoryResponse } from '@/src/types/userstories';
import { GripVertical, Hash } from 'lucide-react';

interface DraggableUserStoryProps {
  story: UserStoryResponse;
  projectId: string;
  onStoryClick?: (story: UserStoryResponse) => void;
}

export const DraggableUserStory = ({ story, projectId, onStoryClick }: DraggableUserStoryProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `story-${story.id}`,
    data: {
      storyId: story.id,
    },
  });

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
  const getPriorityStyle = (priority?: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return {
          backgroundColor: colors.priorityCriticalBg,
          color: colors.priorityCriticalText,
        };

      case 'high':
        return {
          backgroundColor: colors.priorityHighBg,
          color: colors.priorityHighText,
        };

      case 'medium':
        return {
          backgroundColor: colors.priorityMediumBg,
          color: colors.priorityMediumText,
        };

      case 'low':
        return {
          backgroundColor: colors.priorityLowBg,
          color: colors.priorityLowText,
        };

      default:
        return {
          backgroundColor: colors.gray100,
          color: colors.gray500,
        };
    }
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

  const priorityStyle = getPriorityStyle(story.priority);
  const statusStyle = getStatusStyle(story.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
      flex items-center gap-3
      px-4 py-3
      border-b border-gray-100 last:border-0
      bg-white
      hover:bg-gray-50
      transition-colors duration-150
      ${isDragging ? 'bg-blue-50 shadow-lg ring-2 ring-blue-400 ring-opacity-50 z-50' : ''}
    `}
    >
      {/* Drag Handle - UNCHANGED */}
      <span
        className={`
        shrink-0 p-1 rounded
        ${isDragging ? 'text-blue-500 bg-blue-100' : 'text-gray-300 group-hover:text-gray-500'}
      `}
      >
        <GripVertical size={15} />
      </span>

      {/* Story Title */}
      <div onClick={handleClick} className="flex-1 min-w-0 cursor-pointer">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0 max-w-[200px]">
            <span
              title={story.title}
              className={`block truncate text-sm font-semibold ${
                story.is_closed ? 'line-through text-gray-500 opacity-60' : ''
              }`}
              style={{
                color: story.is_closed ? undefined : isDragging ? colors.primary : colors.gray800,
              }}
            >
              {story.title}
            </span>
          </div>
        </div>
      </div>

      {/* Priority */}
      <span
        className="
        text-[11px]
        px-3 py-1
        rounded-full
        capitalize
        shrink-0
        font-semibold
        min-w-[70px]
        text-center
      "
        style={priorityStyle}
      >
        {story.priority ?? 'medium'}
      </span>

      {/* Story Points */}
      {/* <span
        className="
        flex items-center justify-center
        gap-1
        text-xs
        min-w-[48px]
        px-2 py-1
        rounded-md
        bg-gray-50
        border border-gray-100
        shrink-0
      "
        style={{ color: colors.gray500 }}
        title="Story points"
      >
        <Hash size={10} />
        {story.story_points ?? 0}
      </span> */}

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
