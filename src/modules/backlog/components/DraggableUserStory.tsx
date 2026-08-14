'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { colors } from '@/src/styles/colors';
import { UserStoryResponse } from '@/src/types/userstories';
import { useRouter } from 'next/navigation';
import { GripVertical, Hash, Calendar } from 'lucide-react';

interface DraggableUserStoryProps {
  story: UserStoryResponse;
  projectId: string;
}

export const DraggableUserStory = ({ story, projectId }: DraggableUserStoryProps) => {
  const router = useRouter();

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

      router.push(`/backlog/story/${story.id}?projectId=${projectId}`);
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

  // Status UI
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
        flex items-center gap-2 sm:gap-3
        px-3 sm:px-4 py-2.5
        border-b last:border-0
        hover:bg-gray-50
        transition-all duration-200
        ${isDragging ? 'bg-blue-50 shadow-lg ring-2 ring-blue-400 ring-opacity-50 z-50' : ''}
      `}
    >
      {/* Drag Handle */}
      <span className={`shrink-0 ${isDragging ? 'text-blue-500' : 'text-gray-300'}`}>
        <GripVertical size={15} />
      </span>

      {/* Story title */}
      <div onClick={handleClick} className="flex-1 min-w-0 cursor-pointer">
        <span
          className="text-sm truncate block"
          style={{
            color: isDragging ? colors.primary : colors.gray800,
          }}
        >
          {story.title}
        </span>
      </div>
      {/* Priority */}
      <span
        className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium w-16 text-center"
        style={priorityStyle}
      >
        {story.priority ?? 'medium'}
      </span>

      {/* Story points */}
      <span
        className="flex items-center gap-0.5 text-xs w-10 shrink-0"
        style={{ color: colors.gray400 }}
        title="Story points"
      >
        <Hash size={11} />
        {story.story_points ?? 0}
      </span>

      {/* Status */}
      <span
        className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium w-20 text-center"
        style={statusStyle}
      >
        {story.status ?? 'todo'}
      </span>
    </div>
  );
};
