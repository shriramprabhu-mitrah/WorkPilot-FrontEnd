export interface CustomStatus {
  id: string;
  project_id: string;
  name: string;
  color: string;
  display_order: number;
  is_default?: boolean;
}

export interface CreateCustomStatusPayload {
  name: string;
  color: string;
  display_order: number;
}

export interface UpdateCustomStatusPayload {
  display_name?: string;
  color?: string;
  display_order?: number;
}

export interface AssignColorToTaskPayload {
  title: string;
  description: string;
  type: 'task';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status_id: string;
  story_id: string;
}