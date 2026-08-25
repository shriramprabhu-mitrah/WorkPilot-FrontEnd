'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, GitBranch, Plus } from 'lucide-react';
import { KanbanTask } from '@/src/types/board';
import { PriorityBadge, AssigneeAvatar, SubStatusBadge } from '@/src/app/components/common/task';

export const KanbanCardContent = ({ task }: { task: KanbanTask }) => {
  const subtasks = task.subtasks ?? [];
  const doneCount = subtasks.filter((s) => s.status === 'done').length;
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Title */}
      <p
        className="text-sm font-semibold text-gray-800 dark:text-slate-100 leading-snug mb-2 truncate"
        title={task.title}
      >
        {task.title}
      </p>

      {/* Due date */}
      {task.dueDate &&
        (() => {
          const parts = task.dueDate.split('-');
          const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ];
          const display =
            parts.length === 3
              ? `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}`
              : task.dueDate;
          return (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <Calendar size={11} className="text-gray-400 dark:text-slate-100" />
              <span>{display}</span>
            </div>
          );
        })()}

      {/* Task ID row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <GitBranch size={12} className="text-blue-400" />
          <span className="text-xs font-semibold text-blue-500">{task.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <AssigneeAvatar initials={task.assigneeInitials} color={task.assigneeColor} size="sm" />
        </div>
      </div>

      {/* Subtasks row */}
      {subtasks.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex items-center justify-between w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <GitBranch size={11} className="text-gray-400 dark:text-gray-500" />
              <span className="font-medium">Subtasks</span>
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {doneCount}/{subtasks.length}
              </span>
            </div>
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 dark:bg-gray-700 px-2 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                >
                  <span
                    className={`text-xs flex-1 truncate ${
                      sub.status === 'done'
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {sub.title}
                  </span>
                  <SubStatusBadge status={sub.status} />
                  <AssigneeAvatar
                    initials={sub.assigneeInitials}
                    color={sub.assigneeColor}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
