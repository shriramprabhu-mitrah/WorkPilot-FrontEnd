'use client';

import { Hash, Calendar, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  PriorityBadge,
  StatusBadge,
  AssigneeAvatar,
  TaskLabel,
} from '@/src/app/components/common/task';
import { colors } from '@/src/styles/colors';
import { formatMonthYear } from '@/src/app/components/common/format';
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
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
        className="text-[11px] sm:text-xs font-semibold w-12 sm:w-14 shrink-0"
        style={{ color: colors.primary }}
      >
        {task.key || '-'}
      </span>
      <span className="text-sm flex-1 min-w-0 truncate text-gray-800 dark:text-slate-200">
        {task.title}
      </span>

      <div className="w-16 sm:w-20 shrink-0">
        <PriorityBadge priority={task.priority || 'Medium'} />
      </div>

      <div className="hidden sm:flex items-center gap-1 shrink-0 min-w-0 max-w-[160px] overflow-hidden">
        {(task.labels || []).map((label: string) => (
          <TaskLabel key={label} label={label} />
        ))}
      </div>

      <div className="hidden md:flex w-24 shrink-0 justify-start">
        <StatusBadge status={task.status} />
      </div>

      <span
        className="flex items-center gap-0.5 text-xs w-8 sm:w-10 shrink-0 text-gray-400 dark:text-slate-500"
      >
        <Hash size={11} />
        {task.story_points ?? task.storyPoints ?? 0}
      </span>

      <span
        className="hidden sm:flex items-center gap-1 text-xs leading-none w-24 shrink-0 text-gray-400 dark:text-slate-500"
      >
        <Calendar size={11} className="shrink-0" />
        <span className="truncate">{formatMonthYear(task.due_date || task.dueDate || '')}</span>
      </span>

      <div className="flex items-center gap-2 w-32 shrink-0">
        <AssigneeAvatar
          initials={task.assigneeInitials || task.assignee_name?.charAt(0).toUpperCase() || '?'}
          color={task.assigneeColor || colors.primary}
        />
        <span className="text-xs truncate text-gray-600 dark:text-slate-400" title={task.assignee_name}>
          {task.assignee_name || 'Unassigned'}
        </span>
      </div>
    </div>
  );
};

