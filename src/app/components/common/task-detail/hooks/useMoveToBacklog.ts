import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { KanbanTask } from '@/src/types/board';
import { taskService } from '@/src/services/tasks';
import { logger } from '@/src/lib/utils/logger';
import type { useGetTaskById } from '@/src/modules/tasks/hooks/useTask';

// Only the fields this hook reads or writes
interface BacklogTaskData {
  sprint: string;
  sprint_id: string;
  user_story_id: string;
  user_story_title: string;
}

interface UseMoveToBacklogArgs<T extends BacklogTaskData> {
  task: KanbanTask;
  fetchedTask: ReturnType<typeof useGetTaskById>['task'];
  taskData: T;
  setTaskData: Dispatch<SetStateAction<T>>;
  effectiveProjectId: string;
  canEditTask: boolean;
  onUpdate?: (updated: Partial<KanbanTask>) => void;
}

const LIST_QUERY_KEYS = [
  ['task'],
  ['tasks'],
  ['sprint-orphan-tasks'],
  ['sprint-user-stories'],
  ['user-stories'],
  ['sprints'],
];

export const useMoveToBacklog = <T extends BacklogTaskData>({
  task,
  fetchedTask,
  taskData,
  setTaskData,
  effectiveProjectId,
  canEditTask,
  onUpdate,
}: UseMoveToBacklogArgs<T>) => {
  const queryClient = useQueryClient();
  const [isMovingToBacklog, setIsMovingToBacklog] = useState(false);

  const currentSprintId =
    fetchedTask?.sprint_id || taskData.sprint_id || task.sprintId || task.sprint_id || '';
  const currentSprintName = taskData.sprint || fetchedTask?.sprint_name || task.sprint || '';
  const currentUserStoryId =
    taskData.user_story_id || fetchedTask?.user_story_id || task.user_story_id || '';

  const isAlreadyInBacklog = !currentSprintId && !currentSprintName && !currentUserStoryId;

  const handleMoveToBacklog = useCallback(async () => {
    if (isMovingToBacklog || isAlreadyInBacklog || !canEditTask) return;

    const targetProjectId = fetchedTask?.project_id || task.projectId || effectiveProjectId;
    const targetTaskId = fetchedTask?.id || task.taskId || task.id;

    if (!targetProjectId || !targetTaskId) {
      toast.error('Project ID or Task ID is missing');
      return;
    }

    const previous = {
      sprint: taskData.sprint,
      sprint_id: taskData.sprint_id,
      user_story_id: taskData.user_story_id,
      user_story_title: taskData.user_story_title,
    };

    try {
      setIsMovingToBacklog(true);

      setTaskData((prev) => ({
        ...prev,
        sprint: '',
        sprint_id: '',
        user_story_id: '',
        user_story_title: '',
      }));

      await taskService.updateTask(targetProjectId, targetTaskId, {
        sprint_id: null,
        user_story_id: null,
      });

      await queryClient.invalidateQueries({
        queryKey: ['task', targetProjectId, targetTaskId],
      });
      if (task.key) {
        await queryClient.invalidateQueries({
          queryKey: ['task', targetProjectId, task.key],
        });
      }
      for (const queryKey of LIST_QUERY_KEYS) {
        await queryClient.invalidateQueries({ queryKey });
      }

      onUpdate?.({
        sprint: '',
        sprintId: '',
        user_story_id: undefined,
        user_story_title: undefined,
      } as Partial<KanbanTask>);

      toast.success('Task moved to backlog');
    } catch (error) {
      logger.log('Failed to move task to backlog', error);
      toast.error('Failed to move task to backlog');
      setTaskData((prev) => ({ ...prev, ...previous }));
    } finally {
      setIsMovingToBacklog(false);
    }
  }, [
    isMovingToBacklog,
    isAlreadyInBacklog,
    canEditTask,
    fetchedTask?.project_id,
    fetchedTask?.id,
    task.projectId,
    task.taskId,
    task.id,
    task.key,
    effectiveProjectId,
    taskData.sprint,
    taskData.sprint_id,
    taskData.user_story_id,
    taskData.user_story_title,
    queryClient,
    onUpdate,
    setTaskData,
  ]);

  return { isMovingToBacklog, isAlreadyInBacklog, handleMoveToBacklog };
};
