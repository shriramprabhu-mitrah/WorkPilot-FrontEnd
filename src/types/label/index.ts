export interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface LabelListItem {
  id: string;
  name: string;
  color: string;
}

export interface CreateLabelPayload {
  name: string;
  color: string;
}

export interface UpdateLabelPayload {
  name: string;
  color: string;
}
