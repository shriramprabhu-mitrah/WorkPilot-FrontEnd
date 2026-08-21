'use client';

import { colors } from '@/src/styles/colors';
import Panel from '@/src/app/components/common/panel/panel';
import BarChart from '@/src/app/components/common/charts/barChart';
import { EChartsOption } from 'echarts-for-react';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelColor = isDark ? '#cbd5e1' : colors.gray500;
  const splitLineColor = isDark ? '#334155' : colors.gray100;
  const tooltipBg = isDark ? '#1e293b' : colors.white;
  const tooltipBorder = isDark ? '#475569' : colors.gray200;
  const tooltipText = isDark ? '#f1f5f9' : colors.gray900;

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
      textStyle: { fontSize: 11, color: labelColor },
      data: [
        { name: 'Planned', icon: 'rect' },
        { name: 'Completed', icon: 'rect' },
      ],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: { color: tooltipText, fontSize: 12 },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: labelColor },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 60,
      interval: 15,
      splitLine: { lineStyle: { color: splitLineColor } },
      axisLabel: { fontSize: 11, color: labelColor },
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
