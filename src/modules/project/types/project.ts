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
}
