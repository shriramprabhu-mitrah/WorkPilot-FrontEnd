import type { Dispatch, SetStateAction } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { colors } from '@/src/styles/colors';
import { useAppSelector } from '@/src/store';
import { useAssignTaskToMe } from '@/src/modules/tasks/hooks/useTask';
import type { KanbanTask } from '@/src/types/board';
import { getInitials } from '../../format';

interface AssigneeFields {
  assigneeId: string;
  assigneeName: string;
  assignee?: string;
  assigneeColor?: string;
}

interface UseTaskAssignmentArgs<T extends AssigneeFields> {
  task: KanbanTask;
  taskData: T;
  setTaskData: Dispatch<SetStateAction<T>>;
  onUpdate?: (updated: Partial<KanbanTask>) => void;
}

export function useTaskAssignment<T extends AssigneeFields>({
  task,
  taskData,
  setTaskData,
  onUpdate,
}: UseTaskAssignmentArgs<T>) {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((state) => state.user);
  const { mutate: assignTaskToMe, isPending: isAssigning } = useAssignTaskToMe();

  const handleAssignToMe = () => {
    if (!task.projectId || !task.taskId || !currentUser) return;

    const previousAssignee = {
      assigneeId: taskData.assigneeId,
      assigneeName: taskData.assigneeName,
      assignee: taskData.assignee,
      assigneeColor: taskData.assigneeColor,
    };
    const displayName = currentUser.name || currentUser.username || currentUser.email || '';
    const initials = getInitials(displayName || 'U');
    const color = currentUser.color || colors.avatarBlue;

    setTaskData((prev) => ({
      ...prev,
      assigneeId: prev.assigneeId,
      assigneeName: displayName,
      assignee: initials,
      assigneeColor: color,
    }));

    assignTaskToMe(
      { projectId: task.projectId, taskId: task.taskId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['tasks', task.projectId],
          });

          onUpdate?.({
            assigneeInitials: initials,
            assigneeColor: color,
          });
        },
        onError: () => {
          setTaskData((prev) => ({
            ...prev,
            ...previousAssignee,
          }));
          toast.error('Failed to assign task');
        },
      }
    );
  };

  return { currentUser, isAssigning, handleAssignToMe };
}
