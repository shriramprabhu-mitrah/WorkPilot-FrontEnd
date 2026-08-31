'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Sprint } from '../data';
import { BacklogRow } from './BacklogRow';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';

const statusBadge: Record<
  Sprint['status'],
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  active: {
    label: 'Active',
    color: colors.colActive,
    bg: colors.dropgreenBg,
    icon: <Play size={10} />,
  },
  planned: {
    label: 'Planned',
    color: colors.colTodo,
    bg: colors.dropBg,
    icon: <Clock size={10} />,
  },
  completed: {
    label: 'Completed',
    color: colors.gray500,
    bg: colors.gray100,
    icon: <CheckCircle2 size={10} />,
  },
};

export const SprintSection = ({ sprint }: { sprint: Sprint }) => {
  const [open, setOpen] = useState(true);
  const badge = statusBadge[sprint.status];

  const doneTasks = sprint.tasks.filter((t) => t.status === 'Done').length;
  const totalTasks = sprint.tasks.length;
  const totalPoints = sprint.tasks.reduce((sum, t) => sum + t.storyPoints, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-3">
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-gray-400 shrink-0">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        <span className="font-semibold text-sm text-gray-900 truncate">{sprint.name}</span>

        <span
          className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
          style={{ color: badge.color, backgroundColor: badge.bg }}
        >
          {badge.icon}
          {badge.label}
        </span>

        <span className="hidden sm:inline text-xs text-gray-400 shrink-0">{sprint.dateRange}</span>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto text-xs text-gray-400">
          <span className="hidden xs:inline sm:hidden">
            {doneTasks}/{totalTasks}
          </span>
          <span className="hidden sm:inline">
            {doneTasks}/{totalTasks} tasks
          </span>
          <span className="hidden md:inline">{totalPoints} pts</span>
          {sprint.status !== 'completed' && (
            <WpButton
              variant="secondary"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              leftIcon={<Plus size={12} />}
            >
              <span className="hidden sm:inline">
                {sprint.status === 'active' ? 'Complete Sprint' : 'Start Sprint'}
              </span>
              <span className="sm:hidden">{sprint.status === 'active' ? 'Complete' : 'Start'}</span>
            </WpButton>
          )}
        </div>
      </div>

      {open && totalTasks > 0 && (
        <div className="h-0.5 bg-gray-100 mx-3 sm:mx-4">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(doneTasks / totalTasks) * 100}%`,
              backgroundColor: colors.colDone,
            }}
          />
        </div>
      )}

      {open && (
        <div>
          {sprint.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No tasks in this sprint.</p>
          ) : (
            sprint.tasks.map((task) => <BacklogRow key={task.id} task={task} />)
          )}
          <div className="px-3 sm:px-4 py-2">
            <WpButton
              variant="ghost"
              size="sm"
              leftIcon={<Plus size={13} />}
              className="text-gray-400 hover:text-blue-600"
            >
              Add User Story
            </WpButton>
          </div>
        </div>
      )}
    </div>
  );
};
