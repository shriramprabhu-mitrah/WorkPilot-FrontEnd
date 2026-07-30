import { Priority } from '@/src/types/board';

export interface SprintStat {
  value: number | string;
  title: string;
  valueColor: string;
}

export interface ProgressCardData {
  title: string;
  progress: number;
  progressColor: string;
  rightLabel: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
}

export interface Task {
  title: string;
  description: string;
  priority: Priority;
}

export interface TaskColumnData {
  status: string;
  count: number;
  dotColor: string;
  tasks: Task[];
}

export interface Workload {
  initials: string;
  name: string;
  color: string;
  completed: number;
  total: number;
}
