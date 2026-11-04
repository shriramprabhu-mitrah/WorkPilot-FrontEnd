import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { colors } from '@/src/styles/colors';
import { userStoryService } from '@/src/services/userstory';
import { logger } from '@/src/lib/utils/logger';
import type { UserStoryResponse, EditableUserStoryFields } from '@/src/types/userstories';
import { UserState } from '@/src/store/slices/users';

interface UseUserStoryActionsParams {
  currentUserStory: UserStoryResponse;
  currentUser?: UserState | null;
  editableFields: EditableUserStoryFields;
  setEditableFields: Dispatch<SetStateAction<EditableUserStoryFields>>;
  setSelectedSprintName: Dispatch<SetStateAction<string>>;
  isSaving: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  canEditUserStory: boolean;
  handleUpdate: (patch: Partial<EditableUserStoryFields>) => Promise<void>;
  onUpdate?: (updatedStory?: Partial<UserStoryResponse>) => void;
}

export const useUserStoryActions = ({
  currentUserStory,
  currentUser,
  editableFields,
  setEditableFields,
  setSelectedSprintName,
  isSaving,
  setIsSaving,
  canEditUserStory,
  handleUpdate,
  onUpdate,
}: UseUserStoryActionsParams) => {
  const queryClient = useQueryClient();
  const isAlreadyInBacklog = !editableFields.sprintId && !currentUserStory.sprint_id;
  const handleMoveToBacklog = useCallback(async () => {
    if (isSaving || isAlreadyInBacklog || !canEditUserStory) return;
    const projectId = currentUserStory.project_id;
    const storyId = currentUserStory.id;
    if (!projectId || !storyId) {
      toast.error('Project ID or Story ID is missing');
      return;
    }
    const previousFields = { ...editableFields };
    try {
      setIsSaving(true);
      setSelectedSprintName('');
      setEditableFields((prev) => ({
        ...prev,
        sprintId: '',
        sprintName: '',
      }));

      await userStoryService.updateUserStory(projectId, storyId, {
        sprint_id: null,
      });
      await queryClient.invalidateQueries({ queryKey: ['user-story', projectId, storyId] });
      if (currentUserStory.key) {
        await queryClient.invalidateQueries({
          queryKey: ['user-story', projectId, currentUserStory.key],
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['user-story'] });
      await queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['user-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['sprint-user-stories'] });
      await queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['sprints'] });

      onUpdate?.({
        ...currentUserStory,
        sprint_id: undefined,
        sprint_name: undefined,
      });

      toast.success('User story moved to backlog');
    } catch (error) {
      logger.log('Failed to move user story to backlog', error);
      toast.error('Failed to move user story to backlog');
      setEditableFields(previousFields);
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    isAlreadyInBacklog,
    canEditUserStory,
    currentUserStory,
    editableFields,
    setIsSaving,
    setSelectedSprintName,
    setEditableFields,
    queryClient,
    onUpdate,
  ]);

  const handleAssignToMe = useCallback(() => {
    if (!currentUser?.userid) {
      toast.error('Unable to determine current user');
      return;
    }
    const displayName = currentUser.name || currentUser.username || currentUser.email || '';
    const color = currentUser.color || colors.avatarBlue;
    handleUpdate({
      assigneeId: currentUser.userid,
      assigneeName: displayName,
      assigneeColor: color,
    });
  }, [currentUser, handleUpdate]);

  return { isAlreadyInBacklog, handleMoveToBacklog, handleAssignToMe };
};
