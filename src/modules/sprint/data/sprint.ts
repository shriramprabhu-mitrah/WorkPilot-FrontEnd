import { SprintStat, ProgressCardData, Workload, TaskColumnData } from '../types/sprint';

import { colors } from '@/src/styles/colors';

export const sprintStats: SprintStat[] = [
  {
    value: 5,
    title: 'Total Tasks',
    valueColor: colors.colInProgress,
  },
  {
    value: 1,
    title: 'Completed',
    valueColor: colors.colDone,
  },
  {
    value: 4,
    title: 'Remaining',
    valueColor: colors.priorityHighText,
  },
  {
    value: 6,
    title: 'Days Left',
    valueColor: colors.primary,
  },
  {
    value: 34,
    title: 'Velocity',
    valueColor: colors.colInReview,
  },
  {
    value: '20%',
    title: 'Completion %',
    valueColor: colors.colTodo,
  },
];
export const progressCards: ProgressCardData[] = [
  {
    title: 'Task Completion',
    progress: 20,
    progressColor: colors.primary,
    subtitle: '1 of 5 tasks done',
    rightLabel: '20%',
  },
  {
    title: 'Sprint Timeline',
    progress: 70,
    progressColor: colors.priorityHighText,
    rightLabel: '6d remaining',
    startDate: 'Jul 14, 2026',
    endDate: 'Jul 28, 2026',
  },
];

export const taskColumns: TaskColumnData[] = [
  {
    status: 'Backlog',
    count: 0,
    dotColor: colors.colBacklog,
  },
  {
    status: 'To Do',
    count: 1,
    dotColor: colors.colTodo,
    task: {
      title: 'Update API documentation with examples',
      priority: 'Medium',
    },
  },
  {
    status: 'In Progress',
    count: 1,
    dotColor: colors.colInProgress,
    task: {
      title: 'Implement rate limiting middleware',
      priority: 'Critical',
    },
  },
  {
    status: 'In Review',
    count: 1,
    dotColor: colors.colInReview,
    task: {
      title: 'Refactor database connection pooling',
      priority: 'High',
    },
  },
  {
    status: 'Testing',
    count: 1,
    dotColor: colors.colTesting,
    task: {
      title: 'Set up CI/CD pipeline for staging',
      priority: 'High',
    },
  },
  {
    status: 'Done',
    count: 1,
    dotColor: colors.colDone,
    task: {
      title: 'Design new API authentication flow',
      priority: 'High',
    },
  },
];
export const workload: Workload[] = [
  {
    initials: 'SC',
    name: 'Sarah',
    color: colors.avatarIndigo,
    completed: 0,
    total: 0,
  },
  {
    initials: 'MJ',
    name: 'Marcus',
    color: colors.avatarBlue,
    completed: 1,
    total: 3,
  },
  {
    initials: 'PP',
    name: 'Priya',
    color: colors.avatarPink,
    completed: 0,
    total: 1,
  },
  {
    initials: 'AK',
    name: 'Alex',
    color: colors.avatarGreen,
    completed: 0,
    total: 0,
  },
  {
    initials: 'JW',
    name: 'Jordan',
    color: colors.avatarAmber,
    completed: 0,
    total: 1,
  },
];
