import { colors } from '@/src/styles/colors';
import { Priority } from '@/src/types/board';
import { TaskLabel } from '@/src/types/task';

export interface BacklogTask {
  id: string;
  title: string;
  priority: Priority;
  assigneeInitials: string;
  assigneeColor: string;
  storyPoints: number;
  dueDate: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done';
  estimated_hours: number;
}

export interface Sprint {
  id: string;
  name: string;
  dateRange: string;
  status: 'active' | 'planned' | 'completed';
  tasks: BacklogTask[];
}

export const SPRINTS: Sprint[] = [
  {
    id: 'sprint-12',
    name: 'Sprint 12',
    dateRange: 'Jul 1 – Jul 15',
    status: 'active',
    tasks: [
      {
        id: 'ATL-2',
        title: 'Implement rate limiting middleware',
        priority: 'Critical',
        assigneeInitials: 'MJ',
        assigneeColor: colors.avatarBlue,
        storyPoints: 13,
        dueDate: 'Jul 12',
        status: 'In Progress',
        estimated_hours: 0,
      },
      {
        id: 'ATL-3',
        title: 'Refactor database connection pooling',
        priority: 'High',
        assigneeInitials: 'MJ',
        assigneeColor: colors.avatarBlue,
        storyPoints: 8,
        dueDate: 'Jul 14',
        status: 'In Review',
        estimated_hours: 0,
      },
      {
        id: 'ATL-4',
        title: 'Update API documentation with examples',
        priority: 'Medium',
        assigneeInitials: 'PP',
        assigneeColor: colors.avatarPink,
        storyPoints: 3,
        dueDate: 'Jul 18',
        status: 'To Do',
        estimated_hours: 0,
      },
      {
        id: 'MOB-1',
        title: 'Redesign home screen layout',
        priority: 'High',
        assigneeInitials: 'AK',
        assigneeColor: colors.avatarGreen,
        storyPoints: 8,
        dueDate: 'Jul 15',
        status: 'In Progress',
        estimated_hours: 0,
      },
      {
        id: 'MOB-3',
        title: 'Fix crash on iOS 16.4 deep link flow',
        priority: 'Critical',
        assigneeInitials: 'PP',
        assigneeColor: colors.avatarPink,
        storyPoints: 3,
        dueDate: 'Jul 8',
        status: 'In Progress',
        estimated_hours: 0,
      },
    ],
  },
  {
    id: 'sprint-13',
    name: 'Sprint 13',
    dateRange: 'Jul 16 – Jul 30',
    status: 'planned',
    tasks: [
      {
        id: 'ATL-5',
        title: 'Set up CI/CD pipeline for staging',
        priority: 'High',
        assigneeInitials: 'JW',
        assigneeColor: colors.avatarAmber,
        storyPoints: 5,
        dueDate: 'Jul 22',
        status: 'To Do',
        estimated_hours: 0,
      },
      {
        id: 'DAT-3',
        title: 'Write unit tests for ETL jobs',
        priority: 'Medium',
        assigneeInitials: 'JW',
        assigneeColor: colors.avatarAmber,
        storyPoints: 5,
        dueDate: 'Jul 28',
        status: 'To Do',
        estimated_hours: 0,
      },
      {
        id: 'DS-3',
        title: 'Document component usage guidelines',
        priority: 'Low',
        assigneeInitials: 'AK',
        assigneeColor: colors.avatarGreen,
        storyPoints: 2,
        dueDate: 'Jul 25',
        status: 'To Do',
        estimated_hours: 0,
      },
    ],
  },
];

// export const BACKLOG_TASKS: BacklogTask[] = [
//   {
//     id: 'ATL-6',
//     title: 'Performance profiling and optimization',
//     priority: 'Medium',
//     labels: ['performance'],
//     assigneeInitials: 'MJ',
//     assigneeColor: colors.avatarBlue,
//     storyPoints: 13,
//     dueDate: 'Aug 5',
//     status: 'Backlog',
//   },
//   {
//     id: 'MOB-4',
//     title: 'Offline mode data sync',
//     priority: 'High',
//     labels: ['feature', 'mobile'],
//     assigneeInitials: 'MJ',
//     assigneeColor: colors.avatarBlue,
//     storyPoints: 13,
//     dueDate: 'Aug 10',
//     status: 'Backlog',
//   },
//   {
//     id: 'DAT-2',
//     title: 'Create analytics dashboard UI',
//     priority: 'High',
//     labels: ['frontend', 'dashboard'],
//     assigneeInitials: 'PP',
//     assigneeColor: colors.avatarPink,
//     storyPoints: 8,
//     dueDate: 'Aug 12',
//     status: 'Backlog',
//   },
//   {
//     id: 'CTP-3',
//     title: 'Define tech stack and architecture',
//     priority: 'Critical',
//     labels: ['architecture', 'backend'],
//     assigneeInitials: 'MJ',
//     assigneeColor: colors.avatarBlue,
//     storyPoints: 5,
//     dueDate: 'Aug 15',
//     status: 'Backlog',
//   },
//   {
//     id: 'DS-2',
//     title: 'Build Button component variants',
//     priority: 'Medium',
//     labels: ['component', 'frontend'],
//     assigneeInitials: 'PP',
//     assigneeColor: colors.avatarPink,
//     storyPoints: 3,
//     dueDate: 'Aug 8',
//     status: 'Backlog',
//   },
// ];
