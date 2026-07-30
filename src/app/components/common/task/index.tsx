import { Flag } from 'lucide-react';
import { Priority, SubTask } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { Chip } from '@/src/app/components/common/chip';

// ─── Priority ────────────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { color: string; bg: string }> = {
  Critical: {
    color: colors.priorityCriticalText,
    bg: colors.priorityCriticalBg,
  },
  High: { color: colors.priorityHighText, bg: colors.priorityHighBg },
  Medium: { color: colors.priorityMediumText, bg: colors.priorityMediumBg },
  Low: { color: colors.priorityLowText, bg: colors.priorityLowBg },
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const { color, bg } = priorityConfig[priority];
  return <Chip label={priority} color={color} bg={bg} icon={<Flag size={10} />} />;
};

// ─── Status ──────────────────────────────────────────────────────────────────

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Testing';

const statusConfig: Record<TaskStatus, { color: string; bg: string }> = {
  Backlog: { color: colors.colBacklog, bg: colors.colBacklogBg },
  'To Do': { color: colors.colTodo, bg: colors.colTodoBg },
  'In Progress': { color: colors.colInProgress, bg: colors.colInProgressBg },
  'In Review': { color: colors.colInReview, bg: colors.colInReviewBg },
  Done: { color: colors.colDone, bg: colors.colDoneBg },
  Testing: { color: colors.priorityMediumText, bg: colors.priorityMediumBg },
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const { color, bg } = statusConfig[status];
  return <Chip label={status} color={color} bg={bg} />;
};

// ─── Assignee Avatar ─────────────────────────────────────────────────────────

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md';
}

export const AssigneeAvatar = ({ initials, color, size = 'sm' }: AvatarProps) => {
  const dim = size === 'md' ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-[11px]';
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

const STATUS_STYLES: Record<SubTask['status'], { label: string; color: string; bg: string }> = {
  todo: { label: 'TO DO', color: colors.gray500, bg: colors.colBacklogBg },
  inprogress: { label: 'IN PROGRESS', color: colors.primaryFocus, bg: colors.colTodoBg },
  done: { label: 'DONE', color: colors.colActive, bg: colors.dropgreenBg },
};

export const SubStatusBadge = ({ status }: { status: SubTask['status'] }) => {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
};
// ─── Task Label ───────────────────────────────────────────────────────────────

export const TaskLabel = ({ label }: { label: string }) => <Chip label={label} />;
