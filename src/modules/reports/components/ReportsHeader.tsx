import { colors } from '@/src/styles/colors';

interface ReportsHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ReportsHeader({
  title = 'Summary & Reports',
  subtitle = 'Track delivery, momentum, and task health at a glance.',
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.gray900 }}>
        {title}
      </h1>
      <p className="text-sm" style={{ color: colors.gray500 }}>
        {subtitle}
      </p>
    </div>
  );
}
