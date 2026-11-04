import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userStoryService } from '@/src/services/userstory';
import { logger } from '@/src/lib/utils/logger';
import type { EditableUserStoryFields } from '@/src/types/userstories';

interface UseUserStoryUpdateParams {
  projectId?: string;
  storyId?: string;
  storyKey?: string;
  storySprintId?: string;
  editableFields: EditableUserStoryFields;
  setEditableFields: Dispatch<SetStateAction<EditableUserStoryFields>>;
}

export const useUserStoryUpdate = ({
  projectId,
  storyId,
  storyKey,
  storySprintId,
  editableFields,
  setEditableFields,
}: UseUserStoryUpdateParams) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = useCallback(
    async (patch: Partial<EditableUserStoryFields>) => {
      if (!projectId || !storyId) return;

      const previousFields = { ...editableFields };
      // Optimistic UI update
      setEditableFields((prev) => ({ ...prev, ...patch }));
      const payload: Record<string, unknown> = {};
      if (patch.title !== undefined) payload.title = patch.title;
      if (patch.description !== undefined) payload.description = patch.description;
      if (patch.priority !== undefined) payload.priority = patch.priority.toLowerCase();
      if (patch.status !== undefined) payload.status_id = patch.status;
      if (patch.storyPoints !== undefined) payload.story_points = patch.storyPoints;
      if (patch.assigneeId !== undefined) payload.assignee_id = patch.assigneeId || null;
      if (patch.reporterId !== undefined) payload.reporter_id = patch.reporterId || null;
      if (patch.sprintId !== undefined) payload.sprint_id = patch.sprintId || null;
      if (patch.start_date !== undefined) payload.start_date = patch.start_date || null;
      if (patch.due_date !== undefined) payload.due_date = patch.due_date || null;

      try {
        setIsSaving(true);
        await userStoryService.updateUserStory(projectId, storyId, payload);
        await queryClient.invalidateQueries({ queryKey: ['user-story', projectId, storyId] });
        if (storyKey) {
          await queryClient.invalidateQueries({ queryKey: ['user-story', projectId, storyKey] });
        }
        await queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
        const sprintId = storySprintId || editableFields.sprintId;
        if (sprintId) {
          await queryClient.invalidateQueries({
            queryKey: ['sprint-user-stories', projectId, sprintId],
          });
        }
      } catch (error) {
        logger.log('Failed to update user story', error);
        setEditableFields(previousFields);
        toast.error('Failed to update user story');
      } finally {
        setIsSaving(false);
      }
    },
    [projectId, storyId, storyKey, storySprintId, editableFields, setEditableFields, queryClient]
  );
  return { handleUpdate, isSaving, setIsSaving };
};
