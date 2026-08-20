export interface CustomStatus {
  id: string;
  project_id: string;
  name: string;
  color: string;
  is_default: boolean;
  is_final: boolean;
}
export interface CreateCustomStatusPayload {
  name: string;
  color: string;
  is_final: boolean;
}

export interface UpdateCustomStatusPayload {
  name?: string;
  color?: string;
  is_final?: boolean;
}
export interface AssignColorToTaskPayload {
  title: string;
  description: string;
  type: 'task';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status_id: string;
  story_id: string;
}
