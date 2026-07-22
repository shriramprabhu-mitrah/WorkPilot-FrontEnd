import { colors } from '@/src/styles/colors';

interface MemberProgressBarProps {
  name: string;
  done: number;
  total: number;
  color?: string;
}

export default function MemberProgressBar({
  name,
  done,
  total,
  color = colors.primary,
}: MemberProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span
        className="w-14 sm:w-16 text-xs sm:text-sm font-medium shrink-0"
        style={{ color: colors.gray700 }}
      >
        {name}
      </span>
      <div className="flex-1 h-2 rounded-full min-w-0" style={{ backgroundColor: colors.gray100 }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[11px] sm:text-xs shrink-0 w-16 sm:w-20 text-right"
        style={{ color: colors.gray500 }}
      >
        {done}/{total} · {pct}%
      </span>
    </div>
  );
}
