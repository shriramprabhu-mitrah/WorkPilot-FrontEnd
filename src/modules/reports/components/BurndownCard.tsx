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

// 'use client';

// import Panel from '@/src/app/components/common/panel/panel';
// import LineChart from '@/src/app/components/common/charts/lineChart';
// import { SprintBurndown } from '@/src/types/dashboard';
// import { EChartsOption } from 'echarts-for-react';

// interface BurndownCardProps {
//   chartHeight: number;
//   burndownData: SprintBurndown[];
// }

// export default function BurndownCard({
//   chartHeight,
//   burndownData,
// }: BurndownCardProps) {
//   const option: EChartsOption = {
//     tooltip: {
//       trigger: 'axis',
//     },

//     legend: {
//       data: ['Ideal', 'Remaining'],
//     },

//     xAxis: {
//       type: 'category',
//       data: burndownData.map((item) => `Day ${item.day}`),
//     },

//     yAxis: {
//       type: 'value',
//     },

//     series: [
//       {
//         name: 'Ideal',
//         type: 'line',
//         data: burndownData.map((item) => item.ideal_points),
//         smooth: true,
//       },
//       {
//         name: 'Remaining',
//         type: 'line',
//         data: burndownData.map((item) => item.remaining_points),
//         smooth: true,
//       },
//     ],
//   };

//   return (
//     <Panel
//       title="Sprint Burndown"
//       subtitle="Ideal vs actual remaining story points"
//       className="shrink-0"
//     >
//       <LineChart option={option} height={chartHeight} />
//     </Panel>
//   );
// }
