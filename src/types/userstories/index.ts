import { TaskResponse } from '../task';

export interface GetUserStoriesQueryParams {
  page?: number;
  page_size?: number;
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'priority' | 'status';
  sort_order?: 'ASC' | 'DESC';
  status?: 'todo' | 'in_progress' | 'in_review' | 'testing' | 'completed' | 'blocked';
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  search?: string;
}

export interface UserStoryResponse {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  assignee_name?: string;
  reporter_id?: string;
  reporter_name?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  sprint_id?: string;
  story_points?: number;
  backlog_order?: number;
  total_tasks?: number;
  completed_tasks?: number;
  progress?: number;
  created_at?: string;
  updated_at?: string;
  tasks?: TaskResponse[];
}

export interface UserStoryPayload {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'todo' | 'in_progress' | 'in_review' | 'testing' | 'completed' | 'blocked';
  story_points?: number;
}

export interface UserStoryReporter {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserStoryPayload {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'todo' | 'in_progress' | 'in_review' | 'testing' | 'completed' | 'blocked';
  story_points?: number;
  assignee_id?: string;
  sprint_id?: string | null;
}

export interface ReorderUserStoriesPayload {
  user_story_ids: string[];
}
