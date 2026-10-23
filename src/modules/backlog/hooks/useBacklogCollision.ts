import { useCallback } from 'react';
import { closestCorners, pointerWithin, CollisionDetection } from '@dnd-kit/core';
import { findDomDropTarget } from '../utils/dropTargets';

// Highest priority first
const TASK_PRIORITY: ((id: string) => boolean)[] = [
  (id) => id.startsWith('story-'),
  (id) => id.startsWith('sprint-direct-'),
  (id) => id.startsWith('sprint-'),
  (id) => id === 'tasks-unassigned',
  (id) => id === 'backlog-unassigned',
];

export const useBacklogCollision = (hasActiveTask: boolean): CollisionDetection =>
  useCallback(
    (args) => {
      const { pointerCoordinates, active } = args;
      if (!pointerCoordinates || !active) return closestCorners(args);

      const isTask =
        active.data.current?.type === 'task' ||
        String(active.id).startsWith('task-') ||
        hasActiveTask;

      const hits = pointerWithin(args);
      if (hits.length) {
        if (isTask) {
          for (const matches of TASK_PRIORITY) {
            const hit = hits.find((c) => matches(String(c.id)));
            if (hit) return [hit];
          }
        } else {
          const others = hits.filter((c) => c.id !== active.id);
          const hit =
            others.find((c) => String(c.id).startsWith('sprint-')) ??
            others.find((c) => c.id === 'backlog-unassigned');
          if (hit) return [hit];
          if (others.length) return others;
        }
        return hits;
      }

      const target = findDomDropTarget(pointerCoordinates.x, pointerCoordinates.y, isTask);
      return target ? [{ id: target.id }] : closestCorners(args);
    },
    [hasActiveTask]
  );
