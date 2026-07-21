export interface Member {
  name: string;
  color: string;
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