import { useQueryClient } from '@tanstack/react-query';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { useDeleteUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import type { useBacklogSelection } from '../hooks/useBacklogSelection';

interface Props {
  projectId: string;
  selection: ReturnType<typeof useBacklogSelection>;
  onCreateTask: (storyId: string) => void;
}

export const BacklogDrawers = ({ projectId, selection, onCreateTask }: Props) => {
  const queryClient = useQueryClient();
  const deleteUserStory = useDeleteUserStory();
  const {
    selectedTask,
    selectedUserStory,
    handleTaskClick,
    handleUserStoryClick,
    handleCloseDrawer,
  } = selection;
  const refreshStories = () =>
    queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });

  return (
    <>
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={handleCloseDrawer}
          onOpenUserStory={handleUserStoryClick}
        />
      )}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={handleCloseDrawer}
          onOpenTask={handleTaskClick}
          onUpdate={refreshStories}
          onCreateTask={() => onCreateTask(selectedUserStory.id)}
          onDelete={async () => {
            try {
              await deleteUserStory.mutateAsync({ projectId, userStoryId: selectedUserStory.id });
              refreshStories();
              handleCloseDrawer();
            } catch {}
          }}
        />
      )}
    </>
  );
};
