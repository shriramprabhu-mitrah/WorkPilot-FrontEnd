import { KanbanColumn } from '@/src/types/board';
import { colors } from '@/src/styles/colors';

export const BOARD_COLUMNS: KanbanColumn[] = [
  { id: 'todo', label: 'To Do', color: colors.colTodo, tasks: [] },
  { id: 'in_progress', label: 'In Progress', color: colors.colInProgress, tasks: [] },
  { id: 'inreview', label: 'In Review', color: colors.colInReview, tasks: [] },
  { id: 'testing', label: 'Testing', color: colors.colTesting, tasks: [] },
  { id: 'done', label: 'Completed', color: colors.colDone, tasks: [] },
  { id: 'blocked', label: 'Blocked', color: colors.colBlocked, tasks: [] },
];

export const ASSIGNEE_AVATARS = [
  { initials: 'S', color: colors.avatarIndigo },
  { initials: 'M', color: colors.avatarBlue },
  { initials: 'P', color: colors.avatarPink },
  { initials: 'A', color: colors.avatarGreen },
  { initials: 'J', color: colors.avatarAmber },
];
