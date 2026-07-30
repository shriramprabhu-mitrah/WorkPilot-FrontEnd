export interface Member {
  name: string;
  color: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed';
  tasks: number;
}
export interface Project {
  initials: string;
  name: string;
  code: string;
  status: string;
  description: string;
  progress: number;
  tasks: string;
  date: string;
  members: Member[];
  owner?: string;
  creator?: Creator;
}

export interface Creator {
  id: string;
  organization_id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  avatar_url: string;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  joined_at: string;
}
