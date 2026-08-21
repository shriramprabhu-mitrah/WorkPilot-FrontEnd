'use client';

import Panel from '@/src/app/components/common/panel/panel';
import LineChart from '@/src/app/components/common/charts/lineChart';
import { colors } from '@/src/styles/colors';
import { useTheme } from 'next-themes';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts-for-react';

const burndownDays = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15'];
const burndownIdeal = [58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2];
const burndownActual = [58, 55, 53, 49, 47, 42, 40, 36, 31, 27, 21, 16, 10, 5, 1];

export default function BurndownCard({ chartHeight }: { chartHeight: number }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labelColor = isDark ? '#cbd5e1' : colors.gray500;
  const splitLineColor = isDark ? '#334155' : colors.gray100;
  const tooltipBg = isDark ? '#1e293b' : colors.white;
  const tooltipBorder = isDark ? '#475569' : colors.gray200;
  const tooltipText = isDark ? '#f1f5f9' : colors.gray900;

  const option: EChartsOption = {
    animation: true,
    animationDuration: 1400,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 900,
    animationEasingUpdate: 'cubicOut',
    grid: { left: 8, right: 16, top: 12, bottom: 36, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: { color: tooltipText, fontSize: 12 },
    },
    legend: {
      bottom: 4,
      itemWidth: 20,
      itemHeight: 2,
      textStyle: { fontSize: 11, color: labelColor },
      data: [{ name: 'Ideal Burndown' }, { name: 'Actual' }],
    },
    xAxis: {
      type: 'category',
      data: burndownDays,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: labelColor },
      boundaryGap: false,
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
        name: 'Ideal Burndown',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: isDark ? '#94a3b8' : colors.gray400, width: 2 },
        itemStyle: { color: isDark ? '#94a3b8' : colors.gray400 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37,99,235,0.12)' },
            { offset: 1, color: 'rgba(37,99,235,0.01)' },
          ]),
        },
        data: burndownIdeal,
      },
      {
        name: 'Actual',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: colors.primary, width: 2 },
        itemStyle: { color: colors.primary },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(37,99,235,0.18)' },
            { offset: 1, color: 'rgba(37,99,235,0.02)' },
          ]),
        },
        data: burndownActual,
      },
    ],
  };

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
