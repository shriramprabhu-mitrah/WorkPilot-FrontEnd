import { colors } from '@/src/styles/colors';
import { Priority } from '@/src/types/board';

export const recentActivities = [
  {
    id: 1,
    initials: 'MJ',
    avatarColor: colors.avatarBlue,
    user: 'Marcus',
    action: 'moved',
    taskId: 'ATL-2',
    fromStatus: 'To Do',
    toStatus: 'In Progress',
    time: '2m ago',
  },
  {
    id: 2,
    initials: 'JW',
    avatarColor: colors.avatarAmber,
    user: 'Jordan',
    action: 'commented',
    taskId: 'ATL-5',
    comment: '"Looks good, needs one more check"',
    time: '10m ago',
  },
  {
    id: 3,
    initials: 'AK',
    avatarColor: colors.avatarGreen,
    user: 'Alex',
    action: 'created',
    taskId: 'CTP-1',
    description: 'Wireframes for customer portal',
    time: '18m ago',
  },
  {
    id: 4,
    initials: 'PP',
    avatarColor: colors.avatarPink,
    user: 'Priya',
    action: 'completed',
    taskId: 'DS-1',
    description: 'Define color token system',
    time: '1h ago',
  },
  {
    id: 5,
    initials: 'SC',
    avatarColor: colors.avatarIndigo,
    user: 'Sarah',
    action: 'assigned',
    taskId: 'MOB-3',
    description: 'to Priya Patel',
    time: '2h ago',
  },
  {
    id: 6,
    initials: 'MJ',
    avatarColor: colors.avatarBlue,
    user: 'Marcus',
    action: 'completed',
    taskId: 'DAT-1',
    description: 'Build Kafka consumer service',
    time: '3h ago',
  },
];

export interface Deadline {
  id: number;
  title: string;
  project: string;
  sprint: string;
  priority: Priority;
  status: string;
}

export const upcomingDeadlines: Deadline[] = [
  {
    id: 1,
    title: 'Implement rate limiting middleware',
    project: 'ATL-2',
    sprint: 'Sprint 12',
    priority: 'Critical',
    status: 'Overdue',
  },
  {
    id: 2,
    title: 'Refactor database connection pooling',
    project: 'ATL-3',
    sprint: 'Sprint 12',
    priority: 'High',
    status: 'Overdue',
  },
  {
    id: 3,
    title: 'Update API documentation with examples',
    project: 'ATL-4',
    sprint: 'Sprint 12',
    priority: 'Medium',
    status: 'Overdue',
  },
  {
    id: 4,
    title: 'Set up CI/CD pipeline for staging',
    project: 'ATL-5',
    sprint: 'Sprint 12',
    priority: 'High',
    status: 'Overdue',
  },
  {
    id: 5,
    title: 'Performance profiling and optimization',
    project: 'ATL-6',
    sprint: 'Sprint 13',
    priority: 'Medium',
    status: 'Overdue',
  },
  {
    id: 6,
    title: 'Redesign home screen layout',
    project: 'MOB-1',
    sprint: 'Sprint 3',
    priority: 'High',
    status: 'Overdue',
  },
  {
    id: 7,
    title: 'Implement push notifications',
    project: 'MOB-2',
    sprint: 'Sprint 3',
    priority: 'Medium',
    status: 'Overdue',
  },
];
