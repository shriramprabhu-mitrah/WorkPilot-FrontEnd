export interface DashboardOverview {
  total_tasks: number;
  completed: number;
  pending: number;
  overdue: number;
  due_soon: number;
}

export interface DashboardTaskStatusItem {
  color: string;
  count: number;
}

export interface DashboardTaskStatusItem {
  color: string;
  count: number;
}

export interface DashboardTaskStatus {
  [status: string]: DashboardTaskStatusItem;
}

export interface SprintBurndownData {
  day: number;
  date: string;
  ideal_hours: number;
  actual_hours: number;
}

export interface SprintBurndown {
  sprint_id: string;
  sprint_name: string;
  data: SprintBurndownData[];
}

export interface TeamWorkload {
  user_id: string;
  user_name: string;
  full_name: string;
  avatar_url: string;
  color?: string;
  task_count: number;
  points: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  task_status: DashboardTaskStatus;
  sprint_burndown: SprintBurndown[] | SprintBurndown | null;
  team_workload: TeamWorkload[];
}

export interface DashboardActivityUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  color?: string;
}

export interface DashboardActivity {
  id: string;
  project_id: string;
  project_name: string;
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
  title: string;
  type: string;
  details?: string;
  task_key?: string;
}

export interface DashboardActivitiesResponse {
  user: DashboardActivityUser;
  activities: DashboardActivity[];
}
// Global Search Types
export interface SearchTaskResult {
  id: string;
  key: string;
  title: string;
  project_id: string;
  project_name: string;
  type: string;
  priority: string;
  status: string;
  assignee_name?: string;
  description?: string;
}

export interface SearchProjectResult {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: string;
  organization_id: string;
}

export interface GlobalSearchResponse {
  tasks: SearchTaskResult[];
  projects: SearchProjectResult[];
}
