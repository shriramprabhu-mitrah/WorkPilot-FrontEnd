export interface SearchTaskItem {
  id: string;
  type?: string;
  title: string;
  key?: string;
  status?: string;
  priority?: string;
  project_id?: string;
  project_name?: string;
  project_slug?: string;
}

export interface SearchUserStoryItem {
  id: string;
  type?: string;
  title: string;
  key?: string;
  status?: string;
  priority?: string;
  project_id?: string;
  project_name?: string;
  project_slug?: string;
}

export interface SearchProjectItem {
  id: string;
  type?: string;
  title: string;
  name?: string;
  key?: string;
  slug?: string;
  project_slug?: string;
  description?: string;
  status?: string;
  project_id?: string;
}

export interface SearchMemberItem {
  id: string;
  type?: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
  color?: string;
}

export interface SearchSprintItem {
  id: string;
  type?: string;
  title?: string;
  name?: string;
  status?: string;
  project_id?: string;
  project_name?: string;
  project_slug?: string;
}

export interface GlobalSearchData {
  tasks: SearchTaskItem[];
  user_stories: SearchUserStoryItem[];
  projects: SearchProjectItem[];
  members: SearchMemberItem[];
  sprints: SearchSprintItem[];
}

export type SearchCategory = 'all' | 'tasks' | 'user_stories' | 'projects' | 'members' | 'sprints';
