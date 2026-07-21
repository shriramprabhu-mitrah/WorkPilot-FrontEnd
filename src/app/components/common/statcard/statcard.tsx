import { colors } from "@/src/styles/colors";

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
}

export default function StatCard({
  label,
  value,
  color = colors.primary,
}: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border p-3 sm:p-4 flex flex-col items-center justify-center gap-1"
      style={{ borderColor: colors.gray200 }}
    >
      <span
        className="text-xl sm:text-2xl lg:text-3xl font-bold leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className="text-[11px] sm:text-xs text-center"
        style={{ color: colors.gray500 }}
      >
        {label}
      </span>
    </div>
  );
}
