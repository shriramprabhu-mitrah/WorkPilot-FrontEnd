import { colors } from '@/src/styles/colors';

interface SprintStatsCardProps {
  value: string | number;
  title: string;
  valueColor: string;
}

const SprintStatsCard = ({ value, title, valueColor }: SprintStatsCardProps) => {
  return (
    <div
      className="rounded-xl border shadow-sm p-4  text-center"
      style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.gray100}`,
      }}
    >
      <h2 className="text-center text-4xl font-bold" style={{ color: valueColor }}>
        {value}
      </h2>

      <p className="mt-3 text-center text-sm font-medium" style={{ color: colors.gray500 }}>
        {title}
      </p>
    </div>
  );
};

export default SprintStatsCard;
