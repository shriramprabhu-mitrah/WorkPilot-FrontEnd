export interface WorkflowStatus {
  id: string;
  name: string;
  category: string;
  color: string;
}

export const workflowStatuses: WorkflowStatus[] = [
  {
    id: 'todo',
    name: 'To Do',
    category: 'To Do',
    color: '#64748B',
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    category: 'In Progress',
    color: '#2563EB',
  },
  {
    id: 'in-review',
    name: 'In Review',
    category: 'In Progress',
    color: '#7C3AED',
  },
  {
    id: 'testing',
    name: 'Testing',
    category: 'In Progress',
    color: '#D97706',
  },
  {
    id: 'done',
    name: 'Done',
    category: 'Done',
    color: '#16A34A',
  },
  {
    id: 'blocked',
    name: 'Blocked',
    category: 'Cancelled',
    color: '#DC2626',
  },
];