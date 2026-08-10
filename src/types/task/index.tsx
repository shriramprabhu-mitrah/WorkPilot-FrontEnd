import { TaskStatus } from '@/src/app/components/common/task';
import { Priority } from '../board';

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  project: string;
  assignee: {
    name: string;
    initials: string;
    color: string;
  };
  points: number;
  dueDate: string;
  sprint: string;
  labels: string[];
};

export interface TaskPayload {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  story_points?: number;
  estimated_hours: number;
  status: string;
}



export interface TaskResponse {
  id?: string;
  project_id?: string;
  key?: string;
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status: string;
  story_points?: number;
  estimated_hours: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateTaskPayload {
  actual_hours?: number;
  assignee_id?: string;
  blocked_reason?: string;
  description?: string;
  due_date?: string;
  estimated_hours?: number;
  label_ids?: string[];
  priority?: string;
  sprint_id?: string;
  status?: string;
  story_points?: number;
  title?: string;
  type?: string;
}

export interface BulkUpdateTaskItem {
  task_id: string;
  assignee_id?: string;
  blocked_reason?: string;
  sprint_id?: string;
  status?: string;
}

export interface BulkUpdateTasksPayload {
  tasks: BulkUpdateTaskItem[];
}

export interface ClonePayload {
  keep_assignee: boolean;
}

export interface GetTasksQueryParams {
  page?: number;
  page_size?: number;
  sprint_id?: string;
  fieldName?: string;
}


