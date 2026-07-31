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
    tasks: [],
  },
  {
    status: 'To Do',
    count: 1,
    dotColor: colors.colTodo,
    tasks: [
      {
        title: 'Update API documentation with examples',
        description: '',
        priority: 'Medium',
      },
    ],
  },
  {
    status: 'In Progress',
    count: 1,
    dotColor: colors.colInProgress,
    tasks: [
      {
        title: 'Implement rate limiting middleware',
        description: '',
        priority: 'Critical',
      },
    ],
  },
  {
    status: 'In Review',
    count: 1,
    dotColor: colors.colInReview,
    tasks: [
      {
        title: 'Refactor database connection pooling',
        description: '',
        priority: 'High',
      },
    ],
  },
  {
    status: 'Testing',
    count: 1,
    dotColor: colors.colTesting,
    tasks: [
      {
        title: 'Set up CI/CD pipeline for staging',
        description: '',
        priority: 'High',
      },
    ],
  },
  {
    status: 'Done',
    count: 1,
    dotColor: colors.colDone,
    tasks: [
      {
        title: 'Design new API authentication flow',
        description: '',
        priority: 'High',
      },
    ],
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

export const Projects = [
  { id: 1, name: 'Project 1' },
  { id: 2, name: 'Project 2' },
  { id: 3, name: 'Project 3' },
  { id: 4, name: 'Project 4' },
  { id: 5, name: 'Project 5' },
];

export const priorityOptions = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
];

export const assigneeOptions = [
  { label: 'Sarah Chen', value: 'Sarah Chen' },
  { label: 'David J', value: 'David J' },
  { label: 'John', value: 'John' },
  { label: 'Priya Patel', value: 'Priya Patel' },
  { label: 'Alex', value: 'Alex' },
];

export const statusOptions = [
  { label: 'To Do', value: 'To Do' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'In Review', value: 'In Review' },
  { label: 'Done', value: 'Done' },
  { label: 'Backlog', value: 'Backlog' },
  { label: 'Testing', value: 'Testing' },
];
