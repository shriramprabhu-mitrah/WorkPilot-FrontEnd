import type { TaskResponse } from '@/src/types/task';
import type { KanbanTask } from '@/src/types/board';
import type { FilterState } from '@/src/app/components/common/filter-panel';
import type { useGetStatus } from '@/src/modules/project/hooks/useLabels';
import { isStorylessId } from './storylessUtils';

export type BoardStatuses = NonNullable<ReturnType<typeof useGetStatus>['data']>;

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const resolveStatusId = (task: TaskResponse, statuses: BoardStatuses): string => {
  if (task.status_id && statuses.some((s) => s.id === task.status_id)) {
    return task.status_id;
  }
  if (task.status && statuses.some((s) => s.id === task.status)) {
    return task.status;
  }
  const targetStatusName = (task.status || task.status_id || '').toLowerCase().replace(/_/g, ' ');
  const matchedByName = statuses.find((s) => {
    const sName = s.name.toLowerCase().replace(/_/g, ' ');
    return sName === targetStatusName;
  });
  if (matchedByName) {
    return matchedByName.id;
  }
  return task.status_id || task.status || statuses[0]?.id || '';
};

export const taskMatchesFilters = (
  task: TaskResponse,
  filters: FilterState,
  assigneeIdFilter: string[],
  statuses: BoardStatuses
): boolean => {
  if (filters.priorities.length > 0) {
    const taskPriority = (task.priority || '').toLowerCase();
    if (!filters.priorities.some((p) => p.toLowerCase() === taskPriority)) {
      return false;
    }
  }
  if (assigneeIdFilter.length > 0) {
    const taskAssigneeId =
      task.assignee_id || task.assignee?.id || (task.assignee as { user_id?: string })?.user_id;
    if (!taskAssigneeId || !assigneeIdFilter.includes(taskAssigneeId)) {
      return false;
    }
  }
  if (filters.labels.length > 0) {
    const taskLabelIds = (task.labels || []).map((label) =>
      typeof label === 'string' ? label : label.id
    );
    const hasMatchingLabel = filters.labels.some((labelId) => taskLabelIds.includes(labelId));
    if (!hasMatchingLabel) {
      return false;
    }
  }
  if (filters.types.length > 0) {
    const taskType = (task.type || '').toLowerCase();
    if (!filters.types.some((t) => t.toLowerCase() === taskType)) {
      return false;
    }
  }
  if (filters.statuses.length > 0) {
    const resolved = resolveStatusId(task, statuses);
    if (
      !filters.statuses.includes(resolved) &&
      !filters.statuses.includes(task.status_id || '') &&
      !filters.statuses.includes(task.status || '')
    ) {
      return false;
    }
  }
  return true;
};

// 3) map TaskResponse -> KanbanTask
export const mapTaskToKanban = (
  task: TaskResponse,
  parentStoryId: string,
  resolvedStatusId: string,
  fallbackProjectId: string,
  parentStoryKey?: string,
  parentStoryTitle?: string
): KanbanTask => {
  const taskKey = task.key ?? task.id ?? '';
  const isRealStory = !!parentStoryId && !isStorylessId(parentStoryId);
  return {
    id: taskKey,
    taskId: task.id ?? '',
    projectId: task.project_id ?? fallbackProjectId,
    title: task.title ?? '',
    priority: task.priority
      ? ((task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
      : 'Medium',
    labels: [],
    assigneeInitials: task.assignee_name ? getInitials(task.assignee_name) : '',
    assigneeColor: task?.assignee?.color ?? '',
    storyPoints: task.story_points ?? 0,
    dueDate: task.due_date ? task.due_date.split('T')[0] : '',
    columnId: resolvedStatusId,
    sprint: task.sprint_name ?? '',
    parent: parentStoryId,
    user_story_id: task.user_story_id || (isRealStory ? parentStoryId : undefined),
    user_story_title: task.user_story_title || parentStoryTitle,
    user_story_key: parentStoryKey,
    assignee: task.assignee_name ?? task.assignee?.name ?? '',
  };
};
