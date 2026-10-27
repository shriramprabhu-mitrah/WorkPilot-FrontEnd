import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DragEndEvent,
  DragStartEvent,
  Over,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { Active } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';
import { findDomDropTarget } from '../utils/dropTargets';

interface Args {
  projectId: string;
  tasksList: TaskResponse[];
  userStories: UserStoryResponse[];
  canEditTask: boolean;
  canEditUserStory: boolean;
  onTaskDrop: (a: Active, o: Over, t: KanbanTask | null, pid: string) => Promise<void>;
  onStoryDrop: (a: Active, o: Over, s: UserStoryResponse | null, pid: string) => Promise<void>;
}

export const useBacklogDnd = ({
  projectId,
  tasksList,
  userStories,
  canEditTask,
  canEditUserStory,
  onTaskDrop,
  onStoryDrop,
}: Args) => {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [activeStory, setActiveStory] = useState<UserStoryResponse | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Last pointer position, used for the manual drop detection fallback
  const pointer = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const d = active.data.current;
      if (d?.type === 'task' || d?.taskId) {
        if (!canEditTask) return void toast.error("You don't have permission to modify tasks");
        const found = tasksList.find((t) => t.id === d?.taskId || t.key === d?.taskId) ?? d?.task;
        if (found) {
          setActiveTask(found);
          setActiveStory(null);
        }
      } else if (d?.type === 'story' || d?.storyId) {
        if (!canEditUserStory) {
          return void toast.error("You don't have permission to modify user stories");
        }
        const found =
          (d?.story as UserStoryResponse | undefined) ||
          userStories.find((s) => s.id === d?.storyId || s.key === d?.storyId);
        if (found) {
          setActiveStory(found);
          setActiveTask(null);
        }
      }
    },
    [userStories, tasksList, canEditTask, canEditUserStory]
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      const curTask = activeTask;
      const curStory = activeStory;
      setActiveTask(null);
      setActiveStory(null);

      const d = active?.data?.current;
      const isTask =
        d?.type === 'task' || String(active?.id).startsWith('task-') || !!d?.taskId || !!curTask;
      const isStory =
        d?.type === 'story' ||
        String(active?.id).startsWith('story-') ||
        !!d?.storyId ||
        !!curStory;
      const pid =
        projectId ||
        d?.task?.project_id ||
        d?.task?.projectId ||
        curTask?.projectId ||
        d?.story?.project_id ||
        curStory?.project_id ||
        '';
      if (!active || !pid) return;

      const p = pointer.current;
      const target =
        over ?? (p ? (findDomDropTarget(p.x, p.y, !isStory) as unknown as Over | null) : null);
      if (!target) return;

      if (isTask) return onTaskDrop(active, target, curTask, pid);
      if (isStory) return onStoryDrop(active, target, curStory, pid);
    },
    [activeTask, activeStory, projectId, onTaskDrop, onStoryDrop]
  );

  const activeDragType: 'task' | 'story' | null = activeTask
    ? 'task'
    : activeStory
      ? 'story'
      : null;

  return { sensors, activeTask, activeStory, activeDragType, handleDragStart, handleDragEnd };
};
