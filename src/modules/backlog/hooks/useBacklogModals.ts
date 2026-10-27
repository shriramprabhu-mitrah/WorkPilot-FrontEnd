import { useState } from 'react';
import { SprintDetail } from '@/src/types/project';
import { useCompleteSprint, useStartSprint } from '@/src/modules/project/hooks/useSprint';

export const useBacklogModals = (projectId: string) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskUserStoryId, setTaskUserStoryId] = useState('');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showAddSprint, setShowAddSprint] = useState(false);
  const [startTarget, setStartTarget] = useState<SprintDetail | null>(null);
  const [completeTarget, setCompleteTarget] = useState<SprintDetail | null>(null);
  const { startSprintAsync, isStartingSprint } = useStartSprint(projectId);
  const { completeSprint, isCompletingSprint } = useCompleteSprint(projectId);

  return {
    showAddTask,
    setShowAddTask,
    taskUserStoryId,
    setTaskUserStoryId,
    showCreateStory,
    setShowCreateStory,
    showAddSprint,
    setShowAddSprint,
    startTarget,
    setStartTarget,
    completeTarget,
    setCompleteTarget,
    startSprintAsync,
    isStartingSprint,
    completeSprint,
    isCompletingSprint,
    openAddTask: (storyId = '') => {
      setTaskUserStoryId(storyId);
      setShowAddTask(true);
    },
  };
};
export type BacklogModalsState = ReturnType<typeof useBacklogModals>;
