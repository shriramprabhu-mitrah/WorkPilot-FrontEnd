'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { KanbanTask } from '@/src/types/board';
import { UserStoryResponse } from '@/src/types/userstories';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useDeleteUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import { useDebounce } from '@/src/hooks/useDebounce';

interface StoryWithTasks extends UserStoryResponse {
  tasksByStatus: Map<string, KanbanTask[]>;
}

interface UseBoardModalsProps {
  selectedProject: string;
  selectedSprint: string;
  orgSlug: string;
  projectSlug: string;
  storeProject: { id?: string; slug?: string; name?: string } | null;
  taskKey?: string;
  boardStories: UserStoryResponse[];
  processedStories: StoryWithTasks[];
  canCreateTask: boolean;
  handleRefetch: () => void;
}

export const useBoardModals = ({
  selectedProject,
  selectedSprint,
  orgSlug,
  projectSlug,
  storeProject,
  taskKey,
  boardStories,
  processedStories,
  canCreateTask,
  handleRefetch,
}: UseBoardModalsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const deleteUserStoryMutation = useDeleteUserStory();

  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskUserStoryId, setTaskUserStoryId] = useState<string>('');
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const closedTaskKeyRef = useRef<string | null>(null);

  // Get project members with search for task modal
  const {
    members: projectMembers,
    isLoadingMembers: isLoadingProjectMembers,
    isFetchingMembers: isFetchingProjectMembers,
  } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 10,
      name: debouncedMemberSearch,
    },
    showAddTaskModal && canCreateTask
  );

  // Generate assignee options from fetched members
  const assigneeOptions = useMemo(
    () =>
      projectMembers?.map((member) => ({
        label: member.full_name || member.username,
        value: member.user_id,
      })) ?? [],
    [projectMembers]
  );

  useEffect(() => {
    if (!taskKey) {
      closedTaskKeyRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTask(null);
      setSelectedUserStory(null);
      return;
    }

    if (closedTaskKeyRef.current === taskKey) {
      return;
    }

    const matchedStory = boardStories?.find(
      (s) => s.key?.toUpperCase() === taskKey.toUpperCase() || s.id === taskKey
    );
    const isStory =
      !!matchedStory ||
      taskKey.toUpperCase().startsWith('US-') ||
      taskKey.toUpperCase().startsWith('US');
    if (isStory) {
      if (matchedStory) {
        setSelectedUserStory(matchedStory);
      } else {
        setSelectedUserStory({
          id: taskKey,
          key: taskKey,
          title: 'Loading...',
          project_id: selectedProject,
        } as UserStoryResponse);
      }
      setSelectedTask(null);
    } else {
      let matchedTask: KanbanTask | undefined = undefined;
      for (const story of processedStories) {
        for (const [, taskList] of story.tasksByStatus) {
          const found = taskList.find(
            (t: KanbanTask) => t.id?.toUpperCase() === taskKey.toUpperCase() || t.taskId === taskKey
          );
          if (found) {
            matchedTask = found;
            break;
          }
        }
        if (matchedTask) break;
      }

      if (matchedTask) {
        setSelectedTask(matchedTask);
      } else {
        setSelectedTask({
          id: taskKey,
          taskId: taskKey,
          key: taskKey,
          title: 'Loading...',
          priority: 'Medium',
          status: 'todo',
          columnId: 'todo',
          projectId: selectedProject,
          assigneeInitials: '',
          assigneeColor: '',
          storyPoints: 0,
          dueDate: '',
          labels: [],
        });
      }
      setSelectedUserStory(null);
    }
  }, [taskKey, boardStories, processedStories, selectedProject]);

  const handleTaskClick = useCallback(
    (task: KanbanTask) => {
      closedTaskKeyRef.current = null;
      setSelectedTask(task);
      setSelectedUserStory(null);
      const currentSlug = projectSlug || storeProject?.slug || storeProject?.id;
      if (orgSlug && currentSlug) {
        const key = task.id || task.taskId;
        window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/boards/${key}`);
      }
    },
    [projectSlug, storeProject?.slug, storeProject?.id, orgSlug]
  );

  const handleUserStoryClick = useCallback(
    (story: UserStoryResponse) => {
      closedTaskKeyRef.current = null;
      const matched = boardStories?.find(
        (s) => s.id === story.id || s.key === story.id || s.id === story.key
      );
      const fullStory: UserStoryResponse = matched
        ? { ...matched, ...story, key: matched.key || story.key }
        : story;
      setSelectedUserStory(fullStory);
      setSelectedTask(null);
      const currentSlug = projectSlug || storeProject?.slug || storeProject?.id;
      if (orgSlug && currentSlug) {
        const key = fullStory.key || fullStory.id;
        window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/boards/${key}`);
      }
    },
    [projectSlug, storeProject?.slug, storeProject?.id, orgSlug, boardStories]
  );

  const handleCloseDrawer = useCallback(() => {
    closedTaskKeyRef.current = taskKey || null;
    setSelectedTask(null);
    setSelectedUserStory(null);
    const currentSlug = projectSlug || storeProject?.slug || storeProject?.id;
    if (orgSlug && currentSlug) {
      window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/boards`);
      router.replace(`/${orgSlug}/${currentSlug}/boards`, { scroll: false });
    }
  }, [projectSlug, storeProject?.slug, storeProject?.id, orgSlug, taskKey, router]);

  const handleTaskDrawerUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
    queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
  }, [queryClient, selectedProject]);

  const handleTaskDrawerDelete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
    queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
    handleRefetch();
    handleCloseDrawer();
  }, [queryClient, selectedProject, handleRefetch, handleCloseDrawer]);

  const handleUserStoryDrawerUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
    queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
  }, [queryClient, selectedProject]);

  const handleOpenCreateTaskForStory = useCallback((storyId: string) => {
    setTaskUserStoryId(storyId);
    setShowAddTaskModal(true);
  }, []);

  const handleUserStoryDrawerDelete = useCallback(
    async (storyId: string) => {
      try {
        await deleteUserStoryMutation.mutateAsync({
          projectId: selectedProject,
          userStoryId: storyId,
        });
        queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
        handleCloseDrawer();
      } catch {
        return;
      }
    },
    [deleteUserStoryMutation, selectedProject, queryClient, handleCloseDrawer]
  );

  const handleAddTaskModalClose = useCallback(() => {
    setShowAddTaskModal(false);
    setTaskUserStoryId('');
    setMemberSearch('');
  }, []);

  const handleAddTaskModalSuccess = useCallback(() => {
    setShowAddTaskModal(false);
    queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
    queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
    if (taskUserStoryId) {
      queryClient.invalidateQueries({
        queryKey: ['user-story', selectedProject, taskUserStoryId],
      });
    }
    handleRefetch();
    setTaskUserStoryId('');
    setMemberSearch('');
  }, [queryClient, selectedProject, taskUserStoryId, handleRefetch]);

  return {
    selectedTask,
    selectedUserStory,
    showAddTaskModal,
    taskUserStoryId,
    memberSearch,
    setMemberSearch,
    assigneeOptions,
    isLoadingProjectMembers,
    isFetchingProjectMembers,
    handleTaskClick,
    handleUserStoryClick,
    handleCloseDrawer,
    handleTaskDrawerUpdate,
    handleTaskDrawerDelete,
    handleUserStoryDrawerUpdate,
    handleOpenCreateTaskForStory,
    handleUserStoryDrawerDelete,
    handleAddTaskModalClose,
    handleAddTaskModalSuccess,
  };
};
