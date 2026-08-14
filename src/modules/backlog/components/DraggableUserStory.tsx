'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { colors } from '@/src/styles/colors';
import { UserStoryResponse } from '@/src/types/userstories';
import { useRouter } from 'next/navigation';
import { GripVertical } from 'lucide-react';

interface DraggableUserStoryProps {
  story: UserStoryResponse;
  projectId: string;
}

export const DraggableUserStory = ({ story, projectId }: DraggableUserStoryProps) => {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `story-${story.id}`,
    data: { storyId: story.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if not dragging
    if (!isDragging) {
      e.stopPropagation();
      router.push(`/backlog/story/${story.id}?projectId=${projectId}`);
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'low':
        return { bg: '#DBEAFE', text: '#2563EB' };
      default:
        return { bg: colors.gray100, text: colors.gray500 };
    }
  };

  const priorityColors = getPriorityColor(story.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b last:border-0 hover:bg-gray-50 transition-all duration-200 ${
        isDragging ? 'shadow-xl ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 z-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className={`shrink-0 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}>
        <GripVertical size={16} />
      </div>
      <div
        onClick={handleClick}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
      >
        <span className={`text-sm flex-1 min-w-0 truncate font-medium transition-colors ${isDragging ? 'text-blue-700' : 'text-gray-800'}`}>
          {story.title}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium"
          style={{ backgroundColor: priorityColors.bg, color: priorityColors.text }}
        >
          {story.priority ?? 'medium'}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium"
          style={{ backgroundColor: colors.colTodoBg, color: colors.primary }}
        >
          {story.status ?? 'todo'}
        </span>
      </div>
    </div>
  );
};
