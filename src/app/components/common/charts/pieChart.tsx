'use client';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { EChartsOption, PieSeriesOption } from 'echarts';
import type {
  TopLevelFormatterParams,
} from 'echarts/types/dist/shared';

import { colors } from '@/src/styles/colors';

interface PieChartProps {
  legends?: EChartsOption['legend'];
  name?: string;
  radius?: PieSeriesOption['radius'];
  center?: PieSeriesOption['center'];
  itemstyle?: PieSeriesOption['itemStyle'];
  rosetype?: PieSeriesOption['roseType'];
  labelline?: PieSeriesOption['labelLine'];
  label?: PieSeriesOption['label'];
  data?: PieSeriesOption['data'];
  title?: EChartsOption['title'];
  graphic?: EChartsOption['graphic'];
  tooltip?: EChartsOption['tooltip'];
  padAngle?: number;
  startAngle?: number;
  minAngle?: number;
  minShowLabelAngle?: number;
}
const defaultTooltip: EChartsOption['tooltip'] = {
  trigger: 'item',
  backgroundColor: colors.white,
  borderColor: colors.gray200,
  borderWidth: 1,
  textStyle: {
    color: colors.gray900,
    fontSize: 12,
  },
  formatter: (params: TopLevelFormatterParams) => {
    const p = Array.isArray(params) ? params[0] : params;

    return `
      <strong>${p.name}</strong><br/>
      ${Number(p.value).toFixed(2)}
    `;
  },
};
export default function Piechart({ legends, name, radius, center, itemstyle, rosetype, labelline, label, data, title, graphic, tooltip, padAngle = 0, startAngle = 40, minAngle, minShowLabelAngle }: Readonly<PieChartProps>) {
  const option: EChartsOption = {
    title: title,
    legend: legends,
    tooltip: tooltip ?? defaultTooltip,
    series: [
      {
        name,
        type: 'pie',
        emphasis: { disabled: true },
        radius,
        center,
        roseType: rosetype,
        itemStyle: itemstyle,
        labelLine: labelline,
        label,
        padAngle,
        minAngle,
        minShowLabelAngle,
        data,
        startAngle,
      },
    ],
    graphic,
  };

  return (
    <ReactEcharts
      echarts={echarts}
      option={option}
      style={{ width: '100%', height: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
