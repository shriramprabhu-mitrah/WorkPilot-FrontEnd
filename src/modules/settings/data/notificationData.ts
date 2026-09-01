import {
  CheckSquare,
  AtSign,
  Clock3,
  AlertTriangle,
  Zap,
  Users,
  Shield,
  BarChart3,
  Info,
} from 'lucide-react';

export const deliveryChannels = [
  {
    id: 'email',
    title: 'Email notifications',
    description: 'Sent to sarah.chen@acme.com',
    enabled: true,
  },
  {
    id: 'inApp',
    title: 'In-app notifications',
    description: 'Bell icon in the top navigation bar',
    enabled: true,
  },
  {
    id: 'browser',
    title: 'Browser push',
    description: 'Desktop notifications via your browser',
    enabled: false,
  },
];

export const notificationEvents = [
  {
    id: 'task-assigned',
    title: 'Task assigned to me',
    description: 'When a task is assigned or reassigned to you',
    icon: CheckSquare,
    enabled: true,
  },
  {
    id: 'mentioned',
    title: 'Mentioned in a comment',
    description: 'When someone @mentions you in a task or comment',
    icon: AtSign,
    enabled: true,
  },
  {
    id: 'task-reminder',
    title: 'Task due reminder',
    description: '24 hours before a task you own is due',
    icon: Clock3,
    enabled: true,
  },
  {
    id: 'task-overdue',
    title: 'Task overdue',
    description: 'When a task passes its due date without completion',
    icon: AlertTriangle,
    enabled: true,
  },
  {
    id: 'sprint-started',
    title: 'Sprint started',
    description: 'When a sprint you are a part of begins',
    icon: Zap,
    enabled: true,
  },
  {
    id: 'sprint-ending',
    title: 'Sprint ending soon',
    description: '48 hours before the sprint end date',
    icon: Clock3,
    enabled: true,
  },
  {
    id: 'member-joined',
    title: 'New member joined',
    description: 'When someone new joins your organization',
    icon: Users,
    enabled: false,
  },
  {
    id: 'role-changed',
    title: 'Your role changed',
    description: 'When an admin updates your role or permissions',
    icon: Shield,
    enabled: true,
  },
  {
    id: 'report-ready',
    title: 'Report ready',
    description: 'When a scheduled report is generated and available to download',
    icon: BarChart3,
    enabled: true,
  },
  {
    id: 'system-updates',
    title: 'System & product updates',
    description: 'Release notes, maintenance windows, and feature announcements',
    icon: Info,
    enabled: false,
  },
];

export const emailFrequencyOptions = [
  {
    id: 'instant',
    title: 'Instant',
    description: 'As it happens',
  },
  {
    id: 'daily',
    title: 'Daily digest',
    description: 'Once a day at 8 AM',
  },
  {
    id: 'weekly',
    title: 'Weekly digest',
    description: 'Every Monday at 8 AM',
  },
];

export const activeSessions = [
  {
    id: 1,
    device: 'Chrome on macOS',
    location: 'San Francisco, CA',
    time: 'Now',
    isCurrent: true,
  },
  {
    id: 2,
    device: 'Safari on iPhone 15',
    location: 'San Francisco, CA',
    time: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 3,
    device: 'Chrome on Windows 11',
    location: 'New York, NY',
    time: '3 days ago',
    isCurrent: false,
  },
  {
    id: 4,
    device: 'Firefox on Ubuntu',
    location: 'London, UK',
    time: '12 days ago',
    isCurrent: false,
  },
];

export const loginActivity = [
  {
    id: 1,
    device: 'Chrome on macOS',
    location: 'San Francisco, CA',
    date: 'Today, 9:14 AM',
    status: 'Successful',
    success: true,
  },
  {
    id: 2,
    device: 'Safari on iPhone 15',
    location: 'San Francisco, CA',
    date: 'Yesterday, 6:02 PM',
    status: 'Successful',
    success: true,
  },
  {
    id: 3,
    device: 'Unknown device',
    location: 'Lagos, Nigeria',
    date: 'Jul 19, 2026, 2:33 AM',
    status: 'Failed attempt',
    success: false,
  },
  {
    id: 4,
    device: 'Chrome on Windows 11',
    location: 'New York, NY',
    date: 'Jul 17, 2026, 11:00 AM',
    status: 'Successful',
    success: true,
  },
];

export const inactivityOptions = ['15 minutes', '30 minutes', '1 hour', '2 hours', 'Never'];
