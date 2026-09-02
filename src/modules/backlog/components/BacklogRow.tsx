'use client';

import { GripVertical, Bug } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge, StatusBadge, AssigneeAvatar } from '@/src/app/components/common/task';
import { colors } from '@/src/styles/colors';
import { TaskResponse } from '@/src/types/task';

export const BacklogRow = ({
  task,
  onClick,
}: {
  task: TaskResponse & {
    labels?: string[];
    assigneeInitials?: string;
    assigneeColor?: string;
    storyPoints?: number;
    dueDate?: string;
  };
  onClick?: () => void;
}) => {
  const taskId = task.id || task.key || '';
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${taskId}`,
    data: {
      type: 'task',
      taskId,
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick?.();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`group flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isDragging
          ? 'bg-blue-50 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-400 ring-opacity-50 z-50'
          : ''
      }`}
    >
      <span
        className={`shrink-0 p-0.5 rounded transition-colors ${
          isDragging
            ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/40'
            : 'text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400'
        }`}
      >
        <GripVertical size={14} />
      </span>

      <span
        className="w-12 shrink-0 text-[11px] font-semibold sm:w-14 sm:text-xs"
        style={{ color: colors.primary }}
      >
        {task.key || '-'}
      </span>

      <span
        className="ml-2 min-w-0 flex-1 flex items-center gap-1.5 truncate text-sm font-semibold text-gray-800 dark:text-slate-200"
        title={task.title ?? ''}
      >
        {task.type?.toLowerCase() === 'bug' && (
          <Bug size={13} className="text-red-500 shrink-0" />
        )}
        <span className="truncate">
          {(task.title ?? '').length > 50
            ? `${(task.title ?? '').slice(0, 50)}...`
            : (task.title ?? '')}
        </span>
      </span>

      {/* Assignee */}
      <div className="flex w-20 shrink-0 items-center justify-center">
        <div
          className="flex items-center justify-center"
          title={task.assignee_name || 'Unassigned'}
        >
          <AssigneeAvatar
            initials={task.assigneeInitials || getInitials(task.assignee_name)}
            color={task.assignee?.color || task.assigneeColor || colors.avatarBlue}
          />
        </div>
      </div>

      {/* Priority */}
      <div className="flex w-16 shrink-0 items-center justify-center">
        <PriorityBadge priority={task.priority || 'Medium'} />
      </div>

      {/* Labels */}
      {/* <div className="hidden w-32 shrink-0 items-center gap-1 overflow-hidden sm:flex">
        {(task.labels || []).map((label: string) => (
          <TaskLabel key={label} label={label} />
        ))}
      </div> */}

      {/* Status */}
      <div className="flex w-24 shrink-0 items-center justify-center">
        <StatusBadge status={task.status} color={task.status_color} />
      </div>
    </div>
  );
};
