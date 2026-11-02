'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import type { KanbanTask } from '@/src/types/board';
import { taskService } from '@/src/services/tasks';
import { logger } from '@/src/lib/utils/logger';

interface UseUpdateTaskProps<TTaskData extends Record<string, unknown>> {
  taskData: TTaskData;
  setTaskData: Dispatch<SetStateAction<TTaskData>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  resolvedProjectId: string;
  resolvedTaskId: string;
  fetchedTask?: { sprint_id?: string | null };
  task: KanbanTask;
  refetchTask: () => Promise<unknown>;
  onUpdate?: (updated: Partial<KanbanTask>) => void;
}

export function useUpdateTask<TTaskData extends Record<string, unknown>>({
  taskData,
  setTaskData,
  setIsSaving,
  resolvedProjectId,
  resolvedTaskId,
  fetchedTask,
  task,
  refetchTask,
  onUpdate,
}: UseUpdateTaskProps<TTaskData>) {
  const queryClient = useQueryClient();

  const handleUpdate = async (patch: Partial<TTaskData>) => {
    if (!resolvedProjectId || !resolvedTaskId) {
      throw new Error('Project ID or Task ID is missing');
    }

    const previousState = { ...taskData };
    setTaskData((prev) => ({
      ...prev,
      ...patch,
    }));

    try {
      const fields = patch as Record<string, unknown>;
      const payload: Record<string, unknown> = {};

      if (fields.title !== undefined) payload.title = fields.title;
      if (fields.description !== undefined) payload.description = fields.description;
      if (fields.priority !== undefined) {
        payload.priority = String(fields.priority).toLowerCase();
      }
      if (fields.taskType !== undefined) payload.type = fields.taskType;
      if (fields.status !== undefined) payload.status_id = fields.status;
      if (fields.dueDate !== undefined) {
        payload.due_date = fields.dueDate ? `${fields.dueDate}T00:00:00Z` : null;
      }
      if (fields.startDate !== undefined) {
        payload.start_date = fields.startDate || null;
      }
      if (fields.storyPoints !== undefined) {
        payload.story_points = fields.storyPoints;
      }
      if (fields.estimatedHours !== undefined) {
        payload.estimated_hours = fields.estimatedHours;
      }
      if (fields.actualHours !== undefined) {
        payload.actual_hours = fields.actualHours;
      }
      if (fields.user_story_id !== undefined) {
        payload.user_story_id = fields.user_story_id;
      }
      if (fields.assigneeId !== undefined) {
        payload.assignee_id = fields.assigneeId || null;
      }
      if (fields.reporterId !== undefined) {
        payload.reporter_id = fields.reporterId || null;
      }
      if (fields.sprint_id !== undefined) {
        payload.sprint_id = fields.sprint_id || null;
      }
      if (fields.labels !== undefined) {
        const labels = fields.labels;
        payload.label_ids = Array.isArray(labels)
          ? labels.map((label) =>
              typeof label === 'string' ? label : (label as { id: string }).id
            )
          : [];
      }

      setIsSaving(true);
      await taskService.updateTask(resolvedProjectId, resolvedTaskId, payload);
      await refetchTask();
      await queryClient.invalidateQueries({
        queryKey: ['tasks', resolvedProjectId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['task', resolvedProjectId, resolvedTaskId],
      });

      const taskSprintId =
        fetchedTask?.sprint_id ||
        (fields.sprint_id as string | undefined) ||
        task.sprintId ||
        task.sprint_id;

      if (taskSprintId) {
        await queryClient.invalidateQueries({
          queryKey: ['sprint-orphan-tasks', resolvedProjectId, taskSprintId],
        });
      }

      if (fields.sprint_id !== undefined) {
        await queryClient.invalidateQueries({
          queryKey: ['sprint-orphan-tasks'],
        });

        await queryClient.invalidateQueries({
          queryKey: ['sprint-user-stories'],
        });

        await queryClient.invalidateQueries({
          queryKey: ['sprints'],
        });
      }

      onUpdate?.(patch as Partial<KanbanTask>);

      return true;
    } catch (error) {
      logger.log('Failed to update task', error);
      setTaskData(previousState);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return { handleUpdate };
}
