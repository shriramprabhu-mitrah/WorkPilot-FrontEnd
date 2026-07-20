export interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
  tasks: number;
  done: number;
}
export interface RoleCard {
  name: string;
  description: string;
  dotColor: string;
  permissions: string[];
}
