import { WpButton } from '@/src/app/components/common/button';
import { colors } from '@/src/styles/colors';
import { Member } from '@/src/types/teams';
import { MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ROLE_LABELS } from '@/src/app/components/common/enum/index';
import { ROLE_TYPE } from '@/src/app/components/common/enum';
interface MemberCardProps {
  member: Member;
  canManageUsers: boolean;
  onDelete: () => void;
  onClick?: () => void;
}

export const MemberCard = ({
  member,
  canManageUsers,
  onDelete,
  onClick,
}: MemberCardProps) => {
  const pct = member.tasks === 0 ? 0 : Math.round((member.done / member.tasks) * 100);
  const open = member.tasks - member.done;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ borderColor: colors.gray200 }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: member.avatarColor }}
        >
          {member.initials}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: colors.gray900 }}>
            {member.name}
          </p>
          <p
            className="text-xs truncate"
            style={{
              color: member.tasks > 0 && pct > 0 ? member.avatarColor : colors.gray500,
            }}
          >
            {ROLE_LABELS[member.role as ROLE_TYPE] ?? member.role}
          </p>
        </div>
        <span className="text-xs font-medium shrink-0" style={{ color: colors.gray400 }}>
          {pct}%
        </span>
        {canManageUsers && (
          <WpButton
            variant="ghost"
            size="sm"
            className="!p-2 text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Remove member"
          >
            <Trash2 size={16} />
          </WpButton>
        )}
      </div>

      <div className="h-1 rounded-full w-full" style={{ backgroundColor: colors.gray100 }}>
        <div
          className="h-1 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: member.avatarColor }}
        />
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: colors.gray500 }}>
        <span>
          <span className="font-medium" style={{ color: colors.gray700 }}>
            {member.tasks}
          </span>{' '}
          tasks
        </span>
        <span style={{ color: colors.colActive }}>
          <span className="font-medium">{member.done}</span> done
        </span>
        <span>
          <span className="font-medium" style={{ color: colors.gray700 }}>
            {open}
          </span>{' '}
          open
        </span>
      </div>
    </div>
  );
};
