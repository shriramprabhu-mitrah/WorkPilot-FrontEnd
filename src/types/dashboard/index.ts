export interface DashboardOverview {
  total_tasks: number;
  completed: number;
  pending: number;
  overdue: number;
  due_soon: number;
}

// Each status entry now has color + count
export interface DashboardTaskStatusEntry {
  color: string;
  count: number;
}

export interface DashboardTaskStatus {
  [status: string]: DashboardTaskStatusEntry;
}

export interface SprintBurndown {
  day: number;
  date: string;
  ideal_hours: number;
  actual_hours: number;
}

// A single sprint's burndown block
export interface SprintBurndownBlock {
  sprint_id: string;
  sprint_name: string;
  data: SprintBurndown[];
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

// sprint_burndown is an object when sprint_id is passed, array when not
export interface DashboardData {
  overview: DashboardOverview;
  task_status: DashboardTaskStatus;
  sprint_burndown: SprintBurndownBlock | SprintBurndownBlock[] | null;
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
