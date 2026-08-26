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

export const PriorityBadge = ({ priority }: { priority: string | Priority }) => {
  const normalizedPriority = priority
    ? ((priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) as Priority)
    : 'Medium';
  const config = priorityConfig[normalizedPriority] || {
    color: colors.gray500,
    bg: colors.gray100,
  };
  return (
    <Chip
      label={normalizedPriority}
      color={config.color}
      bg={config.bg}
      icon={<Flag size={10} />}
    />
  );
};

// ─── Status ──────────────────────────────────────────────────────────────────

export type TaskStatus =
  'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Testing' | 'Completed';

interface StatusBadgeProps {
  status: string | TaskStatus;
  color?: string;
}

const hexToRgba = (hex: string, opacity: number) => {
  if (!hex) return `rgba(156, 163, 175, ${opacity})`;

  const cleanHex = hex.replace('#', '');

  if (cleanHex.length !== 6) {
    return hex;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const StatusBadge = ({ status, color }: StatusBadgeProps) => {
  const statusMap: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'To Do',
    'to do': 'To Do',
    in_progress: 'In Progress',
    'in progress': 'In Progress',
    in_review: 'In Review',
    'in review': 'In Review',
    done: 'Done',
    completed: 'Completed',
    testing: 'Testing',
  };

  const normalizedStatus = (status && statusMap[status.toLowerCase()]) || status || 'To Do';

  // API color takes priority
  const statusColor = color || colors.gray500;

  // Very light version of API color
  const statusBg = color ? hexToRgba(color, 0.08) : colors.gray100;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{
        color: statusColor,
        backgroundColor: statusBg,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: statusColor,
        }}
      />

      {normalizedStatus}
    </span>
  );
};

// ─── Assignee Avatar ─────────────────────────────────────────────────────────

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg' | 'xs';
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
