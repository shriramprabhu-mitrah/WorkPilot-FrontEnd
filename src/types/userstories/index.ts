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
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string;
  created_at?: string;
  updated_at?: string;
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
  sprint_id?: string;
}