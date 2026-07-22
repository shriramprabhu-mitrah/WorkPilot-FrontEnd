import Panel from '@/src/app/components/common/panel/panel';
import LineChart from '@/src/app/components/common/charts/lineChart';
import { option } from '@/src/modules/reports/data';

export default function BurndownCard({ chartHeight }: { chartHeight: number }) {
  return (
    <Panel
      title="Sprint 12 Burndown"
      subtitle="Ideal vs actual remaining story points"
      className="shrink-0"
    >
      <LineChart option={option} height={chartHeight} />
    </Panel>
  );
}
