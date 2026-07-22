export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ColumnId = 'backlog' | 'todo' | 'inprogress' | 'inreview' | 'testing' | 'done';

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
}

export interface KanbanColumn {
  id: ColumnId;
  label: string;
  color: string;
  tasks: KanbanTask[];
}
