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
  key?: string;
  project_id?: string;
  title: string;
  description?: string;
  status?: string;
  status_id?: string;
  sprint_name?: string;
  priority?: string;
  assignee_id?: string;
  assignee_name?: string;
  reporter_id?: string;
  reporter_name?: string;
  due_date?: string;
  start_date?: string;
  is_closed?: boolean;
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

export interface UserStoryAttachment {
  id: string;
  user_story_id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface UserStoryAttachmentResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: UserStoryAttachment[];
}

export interface CreateUserStoryCommentPayload {
  content: string;
  parent_comment_id?: string;
}

export interface UserStoryCommentResponse {
  id: string;
  user_story_id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  email: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  replies_count: number;
}

export interface GetUserStoryCommentsQueryParams {
  page?: number;
  page_size?: number;
}

export interface UserStoryParentComment {
  id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  email: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface UserStoryReplyResponse {
  id: string;
  user_story_id: string;
  user_id: string;
  user_name: string;
  full_name: string;
  email: string;
  content: string;
  parent_comment_id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  parent_comment: UserStoryParentComment;
}

export interface GetUserStoryRepliesQueryParams {
  page?: number;
  page_size?: number;
}

export interface UpdateUserStoryCommentPayload {
  content: string;
}
export interface DeleteUserStoryCommentResponse {
  comment_id: string;
}
