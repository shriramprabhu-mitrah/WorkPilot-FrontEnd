import { TaskLabel, TaskResponse } from '../task';
import { UserStoryResponse } from '../userstories';

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

// Allow both predefined and custom status IDs
export type ColumnId =
  'backlog' | 'todo' | 'in_progress' | 'in_review' | 'testing' | 'done' | 'blocked' | string;

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
  taskId?: string;
  projectId?: string;
  title: string;
  status?: string;
  priority: Priority;
  labels?: TaskLabel[];
  assigneeInitials: string;
  user_story_id?: string;
  user_story_title?: string;
  user_story_key?: string;
  assigneeColor: string;
  storyPoints: number;
  dueDate: string;
  columnId: ColumnId;
  description?: string;
  subtasks?: SubTask[];
  reporter?: string;
  reporter_name?: string;
  reporterInitials?: string;
  reporterColor?: string;
  sprint?: string;
  sprintId?: string;
  sprint_id?: string;
  startDate?: string;
  parent?: string;
  activity?: ActivityItem[];
  assignee_name?: string;
  key?: string;
  assignee?: { name: string; color: string } | string;
  color?: string;
  reporter_id?: string;
}

export interface KanbanColumn {
  id: ColumnId;
  label: string;
  color: string;
  tasks: KanbanTask[];
}


export interface PageMeta {
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export interface BoardStatusColumn {
  status_id: string;
  status_name: string;
  color: string;
  display_order: number;
  task_count: number;
  tasks: TaskResponse[];
  meta: PageMeta;
}

export type BoardStory = Omit<UserStoryResponse, 'tasks'> & {
  statuses: BoardStatusColumn[];
};

export interface BoardResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: BoardStory[];
  meta: PageMeta;
}

export interface BoardQueryParams {
  page?: number;
  page_size?: number;
  tasks_per_status?: number;
  sprint_id?: string;
  user_story_id?: string;
  priority?: string;
  assignee_id?: string;
  type?: string;
  status_id?: string;
  task_status_id?: string;
}
