import { colors } from '@/src/styles/colors';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const burndownDays = [
  'D1',
  'D2',
  'D3',
  'D4',
  'D5',
  'D6',
  'D7',
  'D8',
  'D9',
  'D10',
  'D11',
  'D12',
  'D13',
  'D14',
  'D15',
];
const burndownIdeal = [58, 54, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6, 2];
const burndownActual = [58, 55, 53, 49, 47, 42, 40, 36, 31, 27, 21, 16, 10, 5, 1];

export const option: EChartsOption = {
  animation: true,
  animationDuration: 1400,
  animationEasing: 'cubicOut',
  animationDurationUpdate: 900,
  animationEasingUpdate: 'cubicOut',
  grid: { left: 8, right: 16, top: 12, bottom: 36, containLabel: true },
  tooltip: {
    trigger: 'axis',
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderWidth: 1,
    textStyle: { color: colors.gray900, fontSize: 12 },
  },
  legend: {
    bottom: 4,
    itemWidth: 20,
    itemHeight: 2,
    textStyle: { fontSize: 11, color: colors.gray500 },
    data: [{ name: 'Ideal Burndown' }, { name: 'Actual' }],
  },
  xAxis: {
    type: 'category',
    data: burndownDays,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 11, color: colors.gray500 },
    boundaryGap: false,
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
      name: 'Ideal Burndown',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: colors.gray400, width: 2 },
      itemStyle: { color: colors.gray400 },
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

export const priorityData = [
  { value: 8, name: 'High', itemStyle: { color: colors.priorityHighText } },
  {
    value: 4,
    name: 'Critical',
    itemStyle: { color: colors.priorityCriticalText },
  },
  { value: 1, name: 'Low', itemStyle: { color: colors.priorityLowText } },
  { value: 6, name: 'Medium', itemStyle: { color: colors.priorityMediumText } },
];

export const sprintLabels = ['Spr 9', 'Spr 10', 'Spr 11', 'Spr 12'];
export const sprintPlanned = [40, 44, 48, 56];
export const sprintCompleted = [35, 40, 44, 52];

export const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const weeklyPlanned = [20, 25, 30, 28, 35, 22, 18];
export const weeklyCompleted = [15, 20, 25, 22, 30, 18, 15];

export const statusData = [
  { name: 'Backlog', value: 2, color: colors.colBacklog },
  { name: 'To Do', value: 3, color: colors.colTodo },
  { name: 'In Progress', value: 5, color: colors.colInProgress },
  { name: 'In Review', value: 3, color: colors.colInReview },
  { name: 'Testing', value: 2, color: colors.priorityMediumText },
  { name: 'Done', value: 4, color: colors.colDone },
];

export const defaultMembers = [
  { name: 'Sarah', done: 0, total: 0, color: colors.primary },
  { name: 'Marcus', done: 3, total: 8, color: colors.primary },
  { name: 'Priya', done: 0, total: 5, color: colors.primary },
  { name: 'Alex', done: 1, total: 4, color: colors.colActive },
  { name: 'Jordan', done: 0, total: 2, color: colors.primary },
];

export const STATS = [
  { label: 'Total Tasks', value: 19, color: colors.primary },
  { label: 'Completed', value: 4, color: colors.colActive },
  { label: 'Pending', value: 5, color: colors.primary },
  { label: 'Overdue', value: 3, color: colors.error },
  { label: 'Team Velocity', value: 28, color: colors.primary },
];
