import { WpButton } from '@/src/app/components/common/button';
import { colors } from '@/src/styles/colors';
import { Member } from '@/src/types/teams';
import { Trash2 } from 'lucide-react';
import { ROLE_LABELS } from '@/src/app/components/common/enum/index';
import { ROLE_TYPE } from '@/src/app/components/common/enum';

interface MemberCardProps {
  member: Member;
  canManageUsers: boolean;
  onDelete: () => void;
  onClick?: () => void;
  isLast?: boolean;
}

export const MemberCard = ({
  member,
  canManageUsers,
  onDelete,
  onClick,
  isLast = false,
}: MemberCardProps) => {
  const pct = member.completionPercentage ?? 0;
  const open = member.inProgress ?? 0;

  return (
    <div
      onClick={onClick}
      className={`group w-full cursor-pointer bg-white dark:bg-slate-800 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 ${!isLast ? 'border-b border-gray-200 dark:border-slate-700' : ''}`}
    >
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px] items-center gap-4">
        {/* Member */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}
          <div
            className="flex h-10 w-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: member.avatarColor }}
          >
            {member.initials}
          </div>

          {/* Name + Status + Role */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              {/* Fixed name area */}
              <p className="w-[100px] truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
                {member.name}
              </p>

              {/* Status */}
              {member.status && (
                <span
                  className={`
            ml-2 inline-flex shrink-0 items-center
            rounded-full
            border
            px-2 py-0.5
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            leading-none
            ${
              member.status === 'active'
                ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                : member.status === 'pending'
                  ? 'border-yellow-200 bg-yellow-50 text-yellow-600 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : member.status === 'expired'
                    ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }
          `}
                >
                  {member.status}
                </span>
              )}
            </div>

            {/* Role */}
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-100">
              {ROLE_LABELS[member.role as ROLE_TYPE] ?? member.role}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-slate-100">Progress</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{member.tasks}</p>
        </div>
        {/* Done */}
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: colors.colActive }}>
            {member.done}
          </p>
        </div>
        {/* Open */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{open}</p>
        </div>
        {/* Delete */}
        <div className="flex justify-end">
          {canManageUsers && (
            <WpButton
              variant="ghost"
              size="sm"
              className="!h-8 !w-8 !p-0 text-red-600 opacity-0 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Remove member"
            >
              <Trash2 size={15} />
            </WpButton>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: member.avatarColor }}
          >
            {member.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">
              {member.name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-slate-400">
              {ROLE_LABELS[member.role as ROLE_TYPE] ?? member.role}
            </p>
          </div>
          {canManageUsers && (
            <WpButton
              variant="ghost"
              size="sm"
              className="!h-8 !w-8 !p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={15} />
            </WpButton>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-slate-400">Progress</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-700">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-t border-gray-100 dark:border-slate-700 pt-3">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
              {member.tasks}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: colors.colActive }}>
              {member.done}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Done</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{open}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">Open</p>
          </div>
        </div>
      </div>
    </div>
  );
};
