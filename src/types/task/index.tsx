import { TaskStatus } from '@/src/app/components/common/task';
import { Priority } from '../board';

export type Task = {
  id: string;
  key: string;
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
  sprintId?: string;
  labels: string[];
};

export interface TaskPayload {
  title?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  label_ids?: string[];
  priority?: string;
  sprint_id?: string;
  user_story_id?: string; // Added for creating tasks under user stories
  status: string;
  story_points?: number;
  estimated_hours?: number;
  actual_hours?: number;
  type?: string;
}

export interface TaskResponse {
  id?: string;
  project_id?: string;
  user_story_id?: string;
  key?: string;
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  status: string;
  status_id?: string;
  status_color?: string;
  story_points?: number;
  estimated_hours: number;
  due_date?: string;
  assignee_name?: string;
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string;
  sprint_name?: string;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
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
  user_story_id?: string;
  status_id?: string;
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

export interface TaskAttachment {
  id: string;
  task_id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CommentUser {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  content: string;
  task_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  created_at: string;
  updated_at: string;
  user?: CommentUser;
  replies?: Comment[];
}

export interface CreateCommentPayload {
  content: string;
  parent_comment_id?: string;
}

export interface UpdateCommentPayload {
  content: string;
}
