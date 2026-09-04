'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import BarChart from '@/src/app/components/common/charts/barChart';
import { EChartsOption } from 'echarts-for-react';
import { useTheme } from 'next-themes';

const PAGE_SIZE = 7;

interface TeamWorkloadCardProps {
  chartHeight: number;
  labels: string[];
  colors: string[];
  assigned: number[];
  points: number[];
}

export default function TeamWorkloadCard({
  chartHeight,
  labels,
  colors: teamColors,
  assigned,
  points,
}: TeamWorkloadCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [page, setPage] = useState(0);

  const labelColor = isDark ? '#cbd5e1' : colors.gray500;
  const splitLineColor = isDark ? '#334155' : colors.gray100;
  const tooltipBg = isDark ? '#1e293b' : colors.white;
  const tooltipBorder = isDark ? '#475569' : colors.gray200;
  const tooltipText = isDark ? '#f1f5f9' : colors.gray900;
  const emptyBarColor = isDark ? '#334155' : colors.gray200;

  const isEmpty = !labels.length;

  // Pagination
  const totalPages = isEmpty ? 1 : Math.ceil(labels.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pageLabels = labels.slice(start, end);
  const pageColors = teamColors.slice(start, end);
  const pageAssigned = assigned.slice(start, end);
  const pagePoints = points.slice(start, end);

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;

  const header = (
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">Team Workload</p>
        <p className="text-xs text-gray-500 dark:text-slate-100">
          Assigned tasks vs points by team member
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!canPrev}
          className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs text-gray-400 dark:text-slate-500 min-w-[40px] text-center">
          {safePage + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={!canNext}
          className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );

  if (isEmpty) {
    const placeholderLabels = ['', '', '', ''];
    const placeholderData = [0.3, 0.3, 0.3, 0.3];

    const emptyOption: EChartsOption = {
      animation: false,
      grid: { left: 70, right: 20, top: 20, bottom: 40, containLabel: true },
      legend: {
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 11, color: labelColor },
        data: [
          { name: 'Tasks', icon: 'rect' },
          { name: 'Points', icon: 'rect' },
        ],
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: 'No workload data available',
            fontSize: 13,
            fontWeight: 500,
            fill: isDark ? '#475569' : colors.gray400,
          },
        },
      ],
      xAxis: {
        type: 'value',
        min: 0,
        max: 10,
        interval: 2,
        splitLine: { lineStyle: { color: splitLineColor } },
        axisLabel: { color: labelColor },
      },
      yAxis: {
        type: 'category',
        data: placeholderLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: labelColor,
          formatter: () => `{placeholder| }`,
          rich: {
            placeholder: {
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: emptyBarColor,
            },
          },
        },
      },
      series: [
        {
          name: 'Tasks',
          type: 'bar',
          data: placeholderData,
          barWidth: 12,
          itemStyle: { color: emptyBarColor, borderRadius: [0, 6, 6, 0] },
        },
        {
          name: 'Points',
          type: 'bar',
          data: placeholderData,
          barWidth: 12,
          itemStyle: { color: emptyBarColor, borderRadius: [0, 6, 6, 0] },
        },
      ],
    };

    return (
      <div className="w-full min-w-0 overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col">
        {header}
        <BarChart option={emptyOption} height={chartHeight} />
      </div>
    );
  }

  const maxValue = Math.max(...pageAssigned, ...pagePoints, 0);

  const avatarRichStyles = Object.fromEntries(
    pageLabels.map((label, index) => [
      `avatar${index}`,
      {
        width: 20,
        height: 20,
        lineHeight: 20,
        align: 'center',
        verticalAlign: 'middle',
        backgroundColor: pageColors[index] || colors.gray400,
        borderRadius: 10,
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 600,
      },
    ])
  );

  const option: EChartsOption = {
    animation: true,
    animationDuration: 1200,
    grid: { left: 70, right: 20, top: 20, bottom: 40, containLabel: true },
    legend: {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 11, color: labelColor },
      data: [
        { name: 'Tasks', icon: 'rect' },
        { name: 'Points', icon: 'rect' },
      ],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: { color: tooltipText, fontSize: 12 },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: isDark ? '#475569' : colors.gray400,
          type: 'dashed',
          width: 1,
        },
      },
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: Math.ceil(maxValue / 5) * 5 || 5,
      interval: 5,
      splitLine: { lineStyle: { color: splitLineColor } },
      axisLabel: { color: labelColor },
    },
    yAxis: {
      type: 'category',
      data: pageLabels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: labelColor,
        margin: 12,
        formatter: (value: string) => {
          const index = pageLabels.indexOf(value);
          const initial = value.charAt(0).toUpperCase();
          return `{avatar${index}|${initial}}`;
        },
        rich: avatarRichStyles,
      },
    },
    series: [
      {
        name: 'Tasks',
        type: 'bar',
        data: pageAssigned,
        barWidth: 12,
        itemStyle: { color: colors.colLightBlue, borderRadius: [0, 6, 6, 0] },
      },
      {
        name: 'Points',
        type: 'bar',
        data: pagePoints,
        barWidth: 12,
        itemStyle: { color: colors.primary, borderRadius: [0, 6, 6, 0] },
      },
    ],
  };

  return (
    <div className="w-full min-w-0 overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col">
      {header}
      <BarChart option={option} height={chartHeight} />
    </div>
  );
}
