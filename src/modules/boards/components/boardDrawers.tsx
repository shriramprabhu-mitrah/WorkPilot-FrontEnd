'use client';

import React from 'react';
import { KanbanTask } from '@/src/types/board';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';

interface BoardDrawersProps {
  selectedTask: KanbanTask | null;
  selectedUserStory: UserStoryResponse | null;
  selectedProject: string;
  selectedSprint: string;
  showAddTaskModal: boolean;
  canCreateTask: boolean;
  taskUserStoryId: string;
  memberSearch: string;
  setMemberSearch: (search: string) => void;
  assigneeOptions: { label: string; value: string }[];
  isLoadingMembers: boolean;
  handleCloseDrawer: () => void;
  handleTaskClick: (task: KanbanTask) => void;
  handleUserStoryClick: (story: UserStoryResponse) => void;
  handleTaskDrawerUpdate: () => void;
  handleTaskDrawerDelete: () => void;
  handleUserStoryDrawerUpdate: () => void;
  handleOpenCreateTaskForStory: (storyId: string) => void;
  handleUserStoryDrawerDelete: (storyId: string) => void;
  handleAddTaskModalClose: () => void;
  handleAddTaskModalSuccess: () => void;
}

export const BoardDrawers = React.memo(function BoardDrawers({
  selectedTask,
  selectedUserStory,
  selectedProject,
  selectedSprint,
  showAddTaskModal,
  canCreateTask,
  taskUserStoryId,
  memberSearch,
  setMemberSearch,
  assigneeOptions,
  isLoadingMembers,
  handleCloseDrawer,
  handleTaskClick,
  handleUserStoryClick,
  handleTaskDrawerUpdate,
  handleTaskDrawerDelete,
  handleUserStoryDrawerUpdate,
  handleOpenCreateTaskForStory,
  handleUserStoryDrawerDelete,
  handleAddTaskModalClose,
  handleAddTaskModalSuccess,
}: BoardDrawersProps) {
  return (
    <>
      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={handleCloseDrawer}
          onOpenUserStory={handleUserStoryClick}
          onUpdate={handleTaskDrawerUpdate}
          onDelete={handleTaskDrawerDelete}
        />
      )}

      {/* User Story Detail Drawer */}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={handleCloseDrawer}
          onOpenTask={handleTaskClick}
          onUpdate={handleUserStoryDrawerUpdate}
          onCreateTask={() => handleOpenCreateTaskForStory(selectedUserStory.id)}
          onDelete={() => handleUserStoryDrawerDelete(selectedUserStory.id)}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && canCreateTask && (
        <AddTaskModal
          projectId={selectedProject}
          sprintId={taskUserStoryId ? '' : selectedSprint}
          userStoryId={taskUserStoryId || undefined}
          assigneeOptions={assigneeOptions}
          memberSearch={memberSearch}
          onMemberSearchChange={setMemberSearch}
          isLoadingMembers={isLoadingMembers}
          onClose={handleAddTaskModalClose}
          onCreate={handleAddTaskModalSuccess}
        />
      )}
    </>
  );
});
