import { useEffect, useMemo, useRef, useState } from 'react';
import type { Priority } from '@/src/types/board';
import type { UserStoryResponse, EditableUserStoryFields } from '@/src/types/userstories';
import { getInitials } from '../../format';

const createEditableFields = (story: UserStoryResponse): EditableUserStoryFields => {
  const assigneeName = story.assignee_name ?? '';
  const reporterName = story.reporter_name ?? story.reporter?.name ?? '';

  const priority = story.priority
    ? ((story.priority.charAt(0).toUpperCase() + story.priority.slice(1).toLowerCase()) as Priority)
    : ('Medium' as Priority);

  const sprintName = story.sprint_id ? (story.sprint_name ?? '') : '';

  return {
    title: story.title ?? '',
    description: story.description ?? '',
    priority,
    status: story.status_id ?? '',
    storyPoints: story.story_points ?? 0,
    assigneeId: story.assignee_id ?? '',
    color: story.color ?? '',
    assigneeColor: story.assignee?.color ?? '',
    assigneeName,
    reporterId: story.reporter_id ?? story.reporter?.id ?? '',
    reporterName,
    sprintId: story.sprint_id ?? '',
    sprintName,
    start_date: story.start_date ?? story.tasks?.[0]?.created_at ?? '',
    due_date: story.due_date ?? story.tasks?.[0]?.due_date ?? '',
  };
};

export const useEditableStoryFields = (currentUserStory: UserStoryResponse) => {
  const [editableFields, setEditableFields] = useState<EditableUserStoryFields>(() =>
    createEditableFields(currentUserStory)
  );

  // Derive non-editable fields directly from currentUserStory - no state needed
  const userStoryData = useMemo(() => {
    const assigneeName = editableFields.assigneeName || currentUserStory.assignee_name || '';

    const reporterName =
      editableFields.reporterName ||
      currentUserStory.reporter_name ||
      currentUserStory.reporter?.name ||
      '';

    return {
      title: editableFields.title,
      description: editableFields.description,
      priority: editableFields.priority,
      status: editableFields.status,
      storyPoints: editableFields.storyPoints,
      assigneeId: editableFields.assigneeId,
      assigneeName,
      assigneeInitials: getInitials(assigneeName),
      reporterId: editableFields.reporterId,
      reporterName,
      reporterInitials: getInitials(reporterName),
      reporterColor: currentUserStory?.reporter?.color,
      sprintId: editableFields.sprintId,
      sprintName: editableFields.sprintName,
      start_date: editableFields.start_date,
      due_date: editableFields.due_date,
      assigneeColor: editableFields.assigneeColor || currentUserStory?.assignee?.color,
    };
  }, [
    editableFields,
    currentUserStory.assignee_name,
    currentUserStory.reporter_name,
    currentUserStory.reporter?.name,
  ]);

  // Update editable fields only when the user story ID changes (new user story loaded)
  const userStoryIdRef = useRef(currentUserStory.id);
  useEffect(() => {
    if (userStoryIdRef.current !== currentUserStory.id) {
      userStoryIdRef.current = currentUserStory.id;
      setEditableFields(createEditableFields(currentUserStory));
    }
  }, [currentUserStory]);

  return { editableFields, setEditableFields, userStoryData };
};
