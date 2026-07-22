import StatCard from '@/src/app/components/common/statcard/statcard';

interface StatCardsSectionProps {
  stats: Array<{ label: string; value: number | string; color: string }>;
}

export default function StatCardsSection({ stats }: StatCardsSectionProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 shrink-0">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
      ))}
    </div>
  );
}
