'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LineChart from '@/src/app/components/common/charts/lineChart';
import { colors } from '@/src/styles/colors';
import { useTheme } from 'next-themes';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts-for-react';
import type { SprintBurndownBlock } from '@/src/types/dashboard';

interface BurndownCardProps {
  chartHeight: number;
  burndownSprints?: SprintBurndownBlock[];
}

export default function BurndownCard({ chartHeight, burndownSprints = [] }: BurndownCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [page, setPage] = useState(0);

  const labelColor = isDark ? '#cbd5e1' : colors.gray500;
  const splitLineColor = isDark ? '#334155' : colors.gray100;
  const tooltipBg = isDark ? '#1e293b' : colors.white;
  const tooltipBorder = isDark ? '#475569' : colors.gray200;
  const tooltipText = isDark ? '#f1f5f9' : colors.gray900;
  const emptyLineColor = isDark ? '#334155' : colors.gray200;

  const totalPages = burndownSprints.length || 1;
  const safePage = Math.min(page, totalPages - 1);
  const selectedBurndown = burndownSprints[safePage];
  const pageSlice = selectedBurndown?.data ?? [];
  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;
  const burndownDates = pageSlice.map((item) => item.date);
  const burndownIdeal = pageSlice.map((item) => item.ideal_hours);
  const burndownActual = pageSlice.map((item) => item.actual_hours);
  const isEmpty = !selectedBurndown || pageSlice.length === 0;
  const header = (
    <div className="flex items-center justify-between mb-1">
      <div className="min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">Sprint Burndown</p>

        <p className="text-xs text-gray-500 dark:text-slate-100 truncate">
          {selectedBurndown?.sprint_name || 'No sprint selected'} · Ideal vs actual hours
        </p>
      </div>

      {burndownSprints.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
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
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={!canNext}
            className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );

  if (isEmpty) {
    const placeholderDates = ['', '', '', '', '', '', ''];

    const zeroData = placeholderDates.map(() => 0);

    const emptyOption: EChartsOption = {
      animation: false,

      grid: {
        left: 8,
        right: 16,
        top: 12,
        bottom: 36,
        containLabel: true,
      },

      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: {
          color: tooltipText,
          fontSize: 12,
        },
      },

      legend: {
        bottom: 4,
        itemWidth: 20,
        itemHeight: 2,
        textStyle: {
          fontSize: 11,
          color: labelColor,
        },
        data: [{ name: 'Ideal Burndown' }, { name: 'Actual' }],
      },

      xAxis: {
        type: 'category',
        data: placeholderDates,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 11,
          color: labelColor,
        },
        boundaryGap: false,
      },

      yAxis: {
        type: 'value',
        min: 0,
        max: 10,
        interval: 2,
        splitLine: {
          lineStyle: {
            color: splitLineColor,
          },
        },
        axisLabel: {
          fontSize: 11,
          color: labelColor,
        },
      },

      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: 'No sprint data available',
            fontSize: 13,
            fontWeight: 500,
            fill: isDark ? '#475569' : colors.gray400,
          },
        },
      ],

      series: [
        {
          name: 'Ideal Burndown',
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: emptyLineColor,
            width: 2,
            type: 'dashed',
          },
          itemStyle: {
            color: emptyLineColor,
          },
          data: zeroData,
        },
        {
          name: 'Actual',
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: emptyLineColor,
            width: 2,
            type: 'dashed',
          },
          itemStyle: {
            color: emptyLineColor,
          },
          data: zeroData,
        },
      ],
    };

    return (
      <div className="w-full min-w-0 overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col gap-1 shrink-0">
        {header}

        <LineChart option={emptyOption} height={chartHeight} />
      </div>
    );
  }

  const option: EChartsOption = {
    animation: true,
    animationDuration: 1400,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 900,
    animationEasingUpdate: 'cubicOut',

    grid: {
      left: 8,
      right: 16,
      top: 12,
      bottom: 36,
      containLabel: true,
    },

    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: tooltipText,
        fontSize: 12,
      },
    },

    legend: {
      bottom: 4,
      itemWidth: 20,
      itemHeight: 2,
      textStyle: {
        fontSize: 11,
        color: labelColor,
      },
      data: [{ name: 'Ideal Burndown' }, { name: 'Actual' }],
    },

    xAxis: {
      type: 'category',
      data: burndownDates,

      axisLine: {
        show: false,
      },

      axisTick: {
        show: false,
      },

      axisLabel: {
        fontSize: 11,
        color: labelColor,

        formatter: (value: string) => {
          const date = new Date(value);

          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
          });
        },
      },

      boundaryGap: false,
    },

    yAxis: {
      type: 'value',
      min: 0,

      splitLine: {
        lineStyle: {
          color: splitLineColor,
        },
      },

      axisLabel: {
        fontSize: 11,
        color: labelColor,
      },
    },

    series: [
      {
        name: 'Ideal Burndown',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,

        lineStyle: {
          color: isDark ? '#94a3b8' : colors.gray400,
          width: 2,
        },

        itemStyle: {
          color: isDark ? '#94a3b8' : colors.gray400,
        },

        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(37,99,235,0.12)',
            },
            {
              offset: 1,
              color: 'rgba(37,99,235,0.01)',
            },
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

        lineStyle: {
          color: colors.primary,
          width: 2,
        },

        itemStyle: {
          color: colors.primary,
        },

        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(37,99,235,0.18)',
            },
            {
              offset: 1,
              color: 'rgba(37,99,235,0.02)',
            },
          ]),
        },

        data: burndownActual,
      },
    ],
  };

  return (
    <div className="w-full min-w-0 overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col gap-1 shrink-0">
      {header}

      <LineChart option={option} height={chartHeight} />
    </div>
  );
}
