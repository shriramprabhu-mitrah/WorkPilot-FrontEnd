'use client';

import { colors } from '@/src/styles/colors';
import Panel from '@/src/app/components/common/panel/panel';
import BarChart from '@/src/app/components/common/charts/barChart';
import { EChartsOption } from 'echarts-for-react';

interface TeamWorkloadCardProps {
  chartHeight: number;
  labels: string[];
  assigned: number[];
  completed: number[];
}

export default function TeamWorkloadCard({
  chartHeight,
  labels,
  assigned,
  completed,
}: TeamWorkloadCardProps) {
  const option: EChartsOption = {
    animation: true,
    animationDuration: 1200,

    grid: {
      left: 70,
      right: 20,
      top: 20,
      bottom: 40,
      containLabel: true,
    },

    legend: {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 11,
        color: colors.gray500,
      },
      data: [
        { name: 'Tasks', icon: 'rect' },
        { name: 'Points', icon: 'rect' },
      ],
    },

    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: colors.gray400,
          type: 'dashed',
          width: 1,
        },
      },
    },

    xAxis: {
      type: 'value',
      min: 0,
      max: 80,
      interval: 20,
      splitLine: {
        lineStyle: {
          color: colors.gray100,
        },
      },
      axisLabel: {
        color: colors.gray500,
      },
    },

    yAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: colors.gray500,
      },
    },

    series: [
      {
        name: 'Tasks',
        type: 'bar',
        data: assigned,
        barWidth: 12,
        itemStyle: {
          color: colors.colLightBlue,
          borderRadius: [0, 6, 6, 0],
        },
      },
      {
        name: 'Points',
        type: 'bar',
        data: completed,
        barWidth: 12,
        itemStyle: {
          color: colors.primary,
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  };

  return (
    <Panel title="Team Workload" subtitle="Assigned vs completed tasks by team member">
      <BarChart option={option} height={chartHeight} />
    </Panel>
  );
}
