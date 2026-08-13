import type { ReactNode } from 'react';
import { CheckCircle2, Circle, Clock, Flag } from 'lucide-react';
import type { ColumnId, Priority, SubTask } from '@/src/types/board';
import { colors } from '@/src/styles/colors';

export const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string }> = {
  Critical: { color: colors.priorityCriticalText, bg: colors.priorityCriticalBg },
  High: { color: colors.priorityHighText, bg: colors.priorityHighBg },
  Medium: { color: colors.priorityMediumText, bg: colors.priorityMediumBg },
  Low: { color: colors.priorityLowText, bg: colors.priorityLowBg },
};

export const PriorityDot = ({ priority }: { priority: Priority }) => (
  <span
    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
    style={{
      color: PRIORITY_CONFIG[priority].color,
      backgroundColor: PRIORITY_CONFIG[priority].bg,
    }}
  >
    <Flag size={11} />
    {priority}
  </span>
);

type SubStatus = SubTask['status'];

export const STATUS_CONFIG: Record<
  SubStatus,
  { color: string; bg: string; label: string; icon: ReactNode }
> = {
  todo: { color: colors.gray500, bg: colors.gray100, label: 'To Do', icon: <Circle size={13} /> },
  inprogress: {
    color: colors.primaryFocus,
    bg: colors.primaryLight,
    label: 'In Progress',
    icon: <Clock size={13} />,
  },
  done: {
    color: colors.colActive,
    bg: colors.dropgreenBg,
    label: 'Done',
    icon: <CheckCircle2 size={13} />,
  },
};

export const STATUS_CYCLE: SubStatus[] = ['todo', 'inprogress', 'done'];

export const StatusBadge = ({ status, onClick }: { status: SubStatus; onClick?: () => void }) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
      title="Click to cycle status"
    >
      {cfg.icon}
      {cfg.label}
    </button>
  );
};

export const COLUMN_CONFIG: Record<
  ColumnId,
  { label: string; color: string; bg: string; dot: string }
> = {
  backlog: {
    label: 'Backlog',
    color: colors.colBacklog,
    bg: colors.colBacklogBg,
    dot: colors.colBacklog,
  },
  todo: { label: 'To Do', color: colors.colTodo, bg: colors.colTodoBg, dot: colors.colTodo },
  in_progress: {
    label: 'In Progress',
    color: colors.colInProgress,
    bg: colors.colInProgressBg,
    dot: colors.colInProgress,
  },
  inreview: {
    label: 'In Review',
    color: colors.colInReview,
    bg: colors.colInReviewBg,
    dot: colors.colInReview,
  },
  testing: {
    label: 'Testing',
    color: colors.colTesting,
    bg: colors.colDoneBg,
    dot: colors.colTesting,
  },
  done: { label: 'Done', color: colors.colDone, bg: colors.colDoneBg, dot: colors.colDone },
  blocked: {
    label: 'Blocked',
    color: colors.colBlocked,
    bg: colors.colBlockedBg,
    dot: colors.colBlocked,
  },
};

export const COLUMN_ORDER: ColumnId[] = [
  'backlog',
  'todo',
  'in_progress',
  'inreview',
  'testing',
  'done',
  'blocked',
];

export const taskColors = {
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  avatarIndigo: colors.avatarIndigo,
};
