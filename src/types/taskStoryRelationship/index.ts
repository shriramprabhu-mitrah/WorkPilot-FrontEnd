export interface CreateTaskUnderStoryPayload {
  title: string;
  type: string;
  priority: string;
  user_story_id: string;
}

export interface TaskRelationshipResponse {
  task_id: string;
}

export interface TaskStoryRelationshipItem {
  id: string;
  project_id: string;
  user_story_id: string | null;
  sprint_id?: string;
  sprint_name?: string;
  key: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  assignee_id?: string;
  assignee_name?: string;
  reporter_id?: string;
  reporter_name?: string;
  story_points?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface TaskStoryRelationshipQueryParams {
  user_story_id: string;
}
