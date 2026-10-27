import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import AddSprintModal from '@/src/modules/project/components/addSprint';

import { UserStoryResponse } from '@/src/types/userstories';
import { normalizeStatus } from '../utils/backlogUtils';
import type { BacklogModalsState } from '../hooks/useBacklogModals';
import CreateUserStoryModal from './createUserStoryModal';
import StartSprintModal from './startSprintModal';
import CompleteSprintModal from './CompleteSprint';

interface Props {
  projectId: string;
  selectedSprint: string;
  userStories: UserStoryResponse[];
  modals: BacklogModalsState;
  canCreateTask: boolean;
  canCreateUserStory: boolean;
  canCreateSprint: boolean;
  canEditSprint: boolean;
}

const countByStatus = (stories: UserStoryResponse[], names: string[]) =>
  stories.filter((s) => names.includes(normalizeStatus(s.status))).length;

export const BacklogModals = ({
  projectId,
  selectedSprint,
  userStories,
  modals: m,
  canCreateTask,
  canCreateUserStory,
  canCreateSprint,
  canEditSprint,
}: Props) => {
  const queryClient = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedMemberSearch },
    m.showAddTask // only fetch while the modal is open
  );

  const assigneeOptions = useMemo(
    () =>
      (members ?? []).map((u) => ({
        label: u.full_name || u.username,
        value: u.user_id,
      })),
    [members]
  );

  const closeTaskModal = useCallback(() => {
    m.setShowAddTask(false);
    m.setTaskUserStoryId('');
    setMemberSearch('');
  }, [m.setShowAddTask, m.setTaskUserStoryId]);

  const sprintStories = m.completeTarget
    ? userStories.filter((s) => s.sprint_id === m.completeTarget?.id)
    : [];

  return (
    <>
      {m.showAddTask && canCreateTask && (
        <AddTaskModal
          projectId={projectId}
          sprintId={m.taskUserStoryId ? '' : selectedSprint}
          userStoryId={m.taskUserStoryId || undefined}
          assigneeOptions={assigneeOptions}
          memberSearch={memberSearch}
          onMemberSearchChange={setMemberSearch}
          isLoadingMembers={isLoadingMembers || isFetchingMembers}
          onClose={closeTaskModal}
          onCreate={() => {
            ['tasks', 'user-stories', 'sprint-user-stories', 'sprint-orphan-tasks'].forEach((k) =>
              queryClient.invalidateQueries({ queryKey: [k, projectId] })
            );
            if (m.taskUserStoryId) {
              queryClient.invalidateQueries({
                queryKey: ['user-story', projectId, m.taskUserStoryId],
              });
            }
            closeTaskModal();
          }}
        />
      )}

      {m.showCreateStory && canCreateUserStory && (
        <CreateUserStoryModal onClose={() => m.setShowCreateStory(false)} />
      )}

      {m.showAddSprint && canCreateSprint && (
        <AddSprintModal
          projectId={projectId}
          onClose={() => m.setShowAddSprint(false)}
          onSuccess={async () => m.setShowAddSprint(false)}
        />
      )}

      {m.startTarget && canEditSprint && (
        <StartSprintModal
          sprint={m.startTarget}
          isStarting={m.isStartingSprint}
          onClose={() => m.setStartTarget(null)}
          onStart={async (payload) => {
            try {
              await m.startSprintAsync({ sprintId: m.startTarget!.id, payload });
              m.setStartTarget(null);
            } catch {
            }
          }}
        />
      )}

      {m.completeTarget && canEditSprint && (
        <CompleteSprintModal
          sprint={m.completeTarget}
          completedUserStories={countByStatus(sprintStories, ['completed', 'complete', 'done'])}
          inProgressUserStories={countByStatus(sprintStories, ['in progress'])}
          isCompleting={m.isCompletingSprint}
          onClose={() => m.setCompleteTarget(null)}
          onComplete={async () => {
            try {
              await m.completeSprint(m.completeTarget!.id);
              toast.success('Sprint completed successfully');
              m.setCompleteTarget(null);
            } catch {
              toast.error('Failed to complete sprint');
            }
          }}
        />
      )}
    </>
  );
};
