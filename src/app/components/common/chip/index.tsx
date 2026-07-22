'use client';

import { Check } from 'lucide-react';
import { colors } from '@/src/styles/colors';

export interface ChipProps {
  label: string;
  /** Solid tint color — used for priority/status chips */
  color?: string;
  /** Background override — if omitted, derived from color */
  bg?: string;
  /** Renders a checkmark and active border/bg when true */
  active?: boolean;
  /** Renders as a <button> with onClick */
  onClick?: () => void;
  /** Prepend any icon node */
  icon?: React.ReactNode;
  className?: string;
}

export const Chip = ({
  label,
  color,
  bg,
  active = false,
  onClick,
  icon,
  className = '',
}: ChipProps) => {
  const resolvedBg = bg ?? (active ? (color ? `${color}18` : colors.primaryLight) : colors.gray100);

  const resolvedColor = color ?? (active ? colors.primary : colors.gray500);

  const resolvedBorder = active ? (color ?? colors.primary) : 'transparent';

  const base =
    'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 transition-all';

  const style = {
    color: resolvedColor,
    backgroundColor: resolvedBg,
    borderColor: resolvedBorder,
  };

  if (onClick) {
    return (
      <button onClick={onClick} className={`${base} ${className}`} style={style}>
        {active && <Check size={10} strokeWidth={3} />}
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span className={`${base} ${className}`} style={style}>
      {icon}
      {label}
    </span>
  );
};
