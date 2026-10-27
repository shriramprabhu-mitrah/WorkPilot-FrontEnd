import { colors } from '@/src/styles/colors';
import { KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';

export const SPRINT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'planned', label: 'Planned' },
  { key: 'completed', label: 'Completed' },
] as const;
export type SprintStatusTab = (typeof SPRINT_TABS)[number]['key'];

export const normalizeStatus = (value?: string | null) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, ' ');

export const mapTaskResponseToKanbanTask = (task: TaskResponse): KanbanTask => ({
  id: task.key || task.id || '',
  taskId: task.id || '',
  projectId: task.project_id || '',
  title: task.title || '',
  columnId: task.status_id || task.status || 'todo',
  status: task.status || 'todo',
  description: task.description || '',
  priority: task.priority
    ? ((task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
    : 'Medium',
  labels: [],
  dueDate: task.due_date ? task.due_date.split('T')[0] : '',
  storyPoints: task.story_points ?? 0,
  sprint: task.sprint_name ?? '',
  user_story_id: task.user_story_id,
  user_story_title: task.user_story_title,
  user_story_key: task.user_story_key,
  parent: task.user_story_id || undefined,
  assigneeInitials: task.assignee_name
    ? task.assignee_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '',
  assigneeColor: colors.avatarBlue,
});

/** Minimal TaskResponse built from a dragged KanbanTask */
export const kanbanToTaskResponse = (
  t: KanbanTask,
  id: string,
  projectId: string
): TaskResponse => ({
  id,
  key: t.id,
  title: t.title,
  status: t.status || 'todo',
  estimated_hours: 0,
  project_id: t.projectId || projectId,
  story_points: t.storyPoints,
  due_date: t.dueDate,
});

export const toStatusOptions = <T extends { id: string; name: string; color?: string }>(
  items: T[]
) => items.map((s) => ({ value: s.id, label: s.name, color: s.color }));
