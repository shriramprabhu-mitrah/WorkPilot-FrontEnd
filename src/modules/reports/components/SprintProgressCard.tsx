import { colors } from '@/src/styles/colors';
import Panel from '@/src/app/components/common/panel/panel';
import BarChart from '@/src/app/components/common/charts/barChart';
import { EChartsOption } from 'echarts-for-react';
// import { sprintLabels, sprintPlanned, sprintCompleted } from '@/src/modules/reports/data';
interface SprintProgressCardProps {
  isMobile: boolean;
  chartHeight: number;
  labels: string[];
  planned: number[];
  completed: number[];
  title?: string;
  subtitle?: string;
}

export default function SprintProgressCard({
  isMobile,
  chartHeight,
  labels,
  planned,
  completed,
  title = 'Sprint Progress',
  subtitle = 'Planned vs completed story points per sprint',
}: SprintProgressCardProps) {
  const sprintProgressOption: EChartsOption = {
    animation: true,
    animationDuration: 1200,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 800,
    animationEasingUpdate: 'cubicOut',
    grid: { left: 8, right: 8, top: 12, bottom: 48, containLabel: true },
    legend: {
      bottom: 4,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 11, color: colors.gray500 },
      data: [
        { name: 'Planned', icon: 'rect' },
        { name: 'Completed', icon: 'rect' },
      ],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.white,
      borderColor: colors.gray200,
      borderWidth: 1,
      textStyle: { color: colors.gray900, fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: colors.gray500 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 60,
      interval: 15,
      splitLine: { lineStyle: { color: colors.gray100 } },
      axisLabel: { fontSize: 11, color: colors.gray500 },
    },
    series: [
      {
        name: 'Planned',
        type: 'bar',
        barGap: '10%',
        barMaxWidth: isMobile ? 18 : 28,
        itemStyle: { color: colors.colLightBlue, borderRadius: [4, 4, 0, 0] },
        data: planned,
      },
      {
        name: 'Completed',
        type: 'bar',
        barMaxWidth: isMobile ? 18 : 28,
        itemStyle: { color: colors.primary, borderRadius: [4, 4, 0, 0] },
        data: completed,
      },
    ],
  };
  return (
    <Panel title={title} subtitle={subtitle}>
      <BarChart option={sprintProgressOption} height={chartHeight} />
    </Panel>
  );
}
