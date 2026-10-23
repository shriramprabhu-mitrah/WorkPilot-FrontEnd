import { useCallback, useEffect, useState } from 'react';
import { KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';
import { mapTaskResponseToKanbanTask } from '../utils/backlogUtils';

interface Args {
  taskKey?: string;
  orgSlug: string;
  currentSlug?: string;
  projectId: string;
  userStories: UserStoryResponse[];
  tasks: TaskResponse[];
}

const sameKey = (item: { key?: string; id?: string }, key: string) =>
  item.key?.toUpperCase() === key.toUpperCase() || item.id === key;

export const useBacklogSelection = ({
  taskKey,
  orgSlug,
  currentSlug,
  projectId,
  userStories,
  tasks,
}: Args) => {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);

  const pushUrl = useCallback(
    (key?: string) => {
      if (orgSlug && currentSlug) {
        window.history.pushState(
          null,
          '',
          `/${orgSlug}/${currentSlug}/backlog${key ? `/${key}` : ''}`
        );
      }
    },
    [orgSlug, currentSlug]
  );

  useEffect(() => {
    if (!taskKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTask(null);
      setSelectedUserStory(null);
      return;
    }
    const story = userStories.find((s) => sameKey(s, taskKey));
    if (story || taskKey.toUpperCase().startsWith('US')) {
      setSelectedUserStory(
        story ??
          ({
            id: taskKey,
            key: taskKey,
            title: 'Loading...',
            project_id: projectId,
          } as UserStoryResponse)
      );
      setSelectedTask(null);
      return;
    }
    const task = tasks.find((t) => sameKey(t, taskKey));
    setSelectedTask(
      task
        ? mapTaskResponseToKanbanTask(task)
        : ({
            id: taskKey,
            key: taskKey,
            taskId: taskKey,
            title: 'Loading...',
            priority: 'Medium',
            status: 'todo',
            columnId: 'todo',
            project: projectId,
            projectId,
            assigneeInitials: '',
            assigneeColor: '',
            points: 0,
            labels: [],
          } as unknown as KanbanTask)
    );
    setSelectedUserStory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskKey]);

  const handleTaskClick = useCallback(
    (task: KanbanTask) => {
      setSelectedTask(task);
      setSelectedUserStory(null);
      pushUrl(task.id || task.taskId || task.key);
    },
    [pushUrl]
  );

  const handleUserStoryClick = useCallback(
    (story: UserStoryResponse) => {
      const matched = userStories.find(
        (s) => s.id === story.id || s.key === story.id || s.id === story.key
      );
      const full: UserStoryResponse = matched
        ? { ...matched, ...story, key: matched.key || story.key }
        : story;
      setSelectedUserStory(full);
      setSelectedTask(null);
      pushUrl(full.key || full.id);
    },
    [pushUrl, userStories]
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedTask(null);
    setSelectedUserStory(null);
    pushUrl();
  }, [pushUrl]);

  return {
    selectedTask,
    setSelectedTask,
    selectedUserStory,
    setSelectedUserStory,
    handleTaskClick,
    handleUserStoryClick,
    handleCloseDrawer,
  };
};
