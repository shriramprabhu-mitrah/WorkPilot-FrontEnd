import { colors } from '@/src/styles/colors';

interface ProgressCardProps {
  title: string;
  progress: number;
  progressColor: string;
  rightLabel: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
}

const ProgressCard = ({
  title,
  progress,
  progressColor,
  rightLabel,
  subtitle,
  startDate,
  endDate,
}: ProgressCardProps) => {
  return (
    <div
      className="rounded-xl border p-6 shadow-sm"
      style={{
        backgroundColor: colors.white,
        borderColor: colors.gray200,
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: colors.gray900 }}>
          {title}
        </h3>

        <span className="text-sm font-medium" style={{ color: progressColor }}>
          {rightLabel}
        </span>
      </div>

      <div className="h-3 w-full rounded-full" style={{ backgroundColor: colors.gray200 }}>
        <div
          className="h-3 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>

      {subtitle ? (
        <p className="mt-3 text-sm" style={{ color: colors.gray500 }}>
          {subtitle}
        </p>
      ) : (
        <div
          className="mt-3 flex items-center justify-between text-sm"
          style={{ color: colors.gray500 }}
        >
          <span>{startDate}</span>
          <span>{endDate}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
