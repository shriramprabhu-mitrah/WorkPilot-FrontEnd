import type { Over } from '@dnd-kit/core';
import { UserStoryResponse } from '@/src/types/userstories';

type DropData = { type?: string; storyId?: string; sprintId?: string | null };
export interface DomDropTarget {
  id: string;
  data: { current: DropData };
}

type Kind = 'story' | 'direct' | 'sprint' | 'tasks' | 'backlog';
const TARGETS: Record<
  Kind,
  { selector: string; attr?: string; build: (v: string) => DomDropTarget }
> = {
  story: {
    selector: '[data-story-drop-id]',
    attr: 'data-story-drop-id',
    build: (v) => ({ id: `story-drop-${v}`, data: { current: { type: 'story', storyId: v } } }),
  },
  direct: {
    selector: '[data-sprint-direct-id]',
    attr: 'data-sprint-direct-id',
    build: (v) => ({
      id: `sprint-direct-${v}`,
      data: { current: { type: 'sprint-direct', sprintId: v } },
    }),
  },
  sprint: {
    selector: '[data-sprint-drop-id]',
    attr: 'data-sprint-drop-id',
    build: (v) => ({ id: `sprint-${v}`, data: { current: { type: 'sprint', sprintId: v } } }),
  },
  tasks: {
    selector: '[data-tasks-drop="true"]',
    build: () => ({ id: 'tasks-unassigned', data: { current: { type: 'unassigned-tasks' } } }),
  },
  backlog: {
    selector: '[data-backlog-drop="true"]',
    build: () => ({ id: 'backlog-unassigned', data: { current: { sprintId: null } } }),
  },
};

const TASK_ORDER: Kind[] = ['story', 'direct', 'sprint', 'tasks', 'backlog'];
const STORY_ORDER: Kind[] = ['sprint', 'backlog'];

/** DOM-based fallback used when dnd-kit has not registered the droppable yet */
export const findDomDropTarget = (x: number, y: number, forTask: boolean): DomDropTarget | null => {
  for (const kind of forTask ? TASK_ORDER : STORY_ORDER) {
    const cfg = TARGETS[kind];
    for (const el of Array.from(document.querySelectorAll(cfg.selector))) {
      const r = el.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
      const value = cfg.attr ? el.getAttribute(cfg.attr) : '';
      if (value !== null && (!cfg.attr || value)) return cfg.build(value);
    }
  }
  return null;
};

export type TaskDropTarget =
  { kind: 'story'; storyId: string } | { kind: 'sprint'; sprintId: string | null };

/** sprint with sprintId === null means "unassign from sprint and story" */
export const resolveTaskTarget = (over: Over): TaskDropTarget | null => {
  const d = (over.data.current ?? {}) as DropData;
  const id = String(over.id);

  if (d.type === 'story' || d.storyId || id.startsWith('story-')) {
    return {
      kind: 'story',
      storyId: d.storyId || id.replace('story-drop-', '').replace('story-', ''),
    };
  }
  if (
    d.type === 'sprint-direct' ||
    d.type === 'sprint' ||
    (d.sprintId && !d.storyId) ||
    id.startsWith('sprint-')
  ) {
    return {
      kind: 'sprint',
      sprintId: d.sprintId || id.replace('sprint-direct-', '').replace('sprint-', ''),
    };
  }
  if (d.type === 'unassigned-tasks' || id === 'tasks-unassigned' || id === 'backlog-unassigned') {
    return { kind: 'sprint', sprintId: null };
  }
  return null;
};

export const resolveStoryTargetSprint = (
  over: Over,
  findStory: (id: string) => UserStoryResponse | undefined
): string | null => {
  const d = (over.data.current ?? {}) as DropData;
  const id = String(over.id);
  if (d.sprintId !== undefined) return d.sprintId;
  if (id.startsWith('sprint-direct-')) return id.replace('sprint-direct-', '');
  if (id.startsWith('sprint-')) return id.replace('sprint-', '');
  if (id === 'backlog-unassigned') return null;
  if (id.startsWith('story-')) {
    return findStory(id.replace('story-drop-', '').replace('story-', ''))?.sprint_id ?? null;
  }
  return null;
};
