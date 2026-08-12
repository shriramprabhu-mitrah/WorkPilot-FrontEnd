'use client';

import { Hash, Calendar } from 'lucide-react';
import { BacklogTask } from '../data';
import {
  PriorityBadge,
  StatusBadge,
  AssigneeAvatar,
  TaskLabel,
} from '@/src/app/components/common/task';
import { colors } from '@/src/styles/colors';
import { formatMonthYear } from '@/src/app/components/common/format';
import { TaskResponse } from '@/src/types/task';

export const BacklogRow = ({ task, onClick }: { task: TaskResponse & { labels?: string[], assigneeInitials?: string, assigneeColor?: string, storyPoints?: number, dueDate?: string }; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border-b last:border-0 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    style={{ borderColor: colors.gray100 }}
  >
    <span
      className="text-[11px] sm:text-xs font-semibold w-12 sm:w-14 shrink-0"
      style={{ color: colors.primary }}
    >
      {task.key || '-'}
    </span>

    <div className="w-16 sm:w-20 shrink-0">
      <PriorityBadge priority={task.priority || 'Medium'} />
    </div>

    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: colors.gray800 }}>
      {task.title}
    </span>

    <div className="hidden sm:flex items-center gap-1 shrink-0 min-w-0 max-w-[160px] overflow-hidden">
      {(task.labels || []).map((label: string) => (
        <TaskLabel key={label} label={label} />
      ))}
    </div>

    <div className="hidden md:flex w-24 shrink-0 justify-start">
      <StatusBadge status={task.status} />
    </div>

    <span
      className="flex items-center gap-0.5 text-xs w-8 sm:w-10 shrink-0"
      style={{ color: colors.gray400 }}
    >
      <Hash size={11} />
      {task.story_points ?? task.storyPoints ?? 0}
    </span>

    <span
      className="hidden sm:flex items-center gap-1 text-xs leading-none w-24 shrink-0"
      style={{ color: colors.gray400 }}
    >
      <Calendar size={11} className="shrink-0" />
      <span className="truncate">{formatMonthYear(task.due_date || task.dueDate || '')}</span>
    </span>

    <div className="flex items-center gap-2 w-32 shrink-0">
      <AssigneeAvatar 
        initials={task.assigneeInitials || task.assignee_name?.charAt(0).toUpperCase() || '?'} 
        color={task.assigneeColor || colors.primary} 
      />
      <span className="text-xs truncate text-gray-600" title={task.assignee_name}>
        {task.assignee_name || 'Unassigned'}
      </span>
    </div>
  </div>
);
