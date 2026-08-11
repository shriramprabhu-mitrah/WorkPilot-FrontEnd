export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ColumnId = 'backlog' | 'todo' | 'in_progress' | 'inreview' | 'testing' | 'done';

export interface SubTask {
  id: string;
  title: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: Priority;
  assigneeInitials: string;
  assigneeColor: string;
  description?: string;
  dueDate?: string;
  storyPoints?: number;
  labels?: string[];
  activity?: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  user: string;
  userInitials: string;
  userColor: string;
  action: string;
  target?: string;
  timestamp: string;
  type: 'history' | 'comment';
  comment?: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  priority: Priority;
  labels: string[];
  assigneeInitials: string;
  assigneeColor: string;
  storyPoints: number;
  dueDate: string;
  columnId: ColumnId;
  description?: string;
  subtasks?: SubTask[];
  reporter?: string;
  reporterInitials?: string;
  reporterColor?: string;
  sprint?: string;
  startDate?: string;
  parent?: string;
  activity?: ActivityItem[];
}

export interface KanbanColumn {
  id: ColumnId;
  label: string;
  color: string;
  tasks: KanbanTask[];
}
