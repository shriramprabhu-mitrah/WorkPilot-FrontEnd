'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
} from '@dnd-kit/core';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import BacklogSkeleton from '../components/backlogSkeleton';
import {
  useGetUserStories,
  useUpdateUserStory,
  useDeleteUserStory,
} from '@/src/modules/tasks/hooks/useUserStory';
import { useGetTasks, useUpdateTask } from '@/src/modules/tasks/hooks/useTask';
import { BacklogRow } from '../components/BacklogRow';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import AddSprintModal from '@/src/modules/project/components/addSprint';
import { useAppSelector } from '@/src/store';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { KanbanTask } from '@/src/types/board';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import CreateUserStoryModal from '../components/createUserStoryModal';
import { SprintDropZone } from '../components/SprintDropZone';
import { DraggableUserStory } from '../components/DraggableUserStory';
import { PriorityBadge, StatusBadge, AssigneeAvatar } from '@/src/app/components/common/task';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';

/** Safely maps a flat TaskResponse to the KanbanTask shape TaskDetailDrawer expects */
const mapTaskResponseToKanbanTask = (task: TaskResponse): KanbanTask => ({
  id: task.key ?? '',
  taskId: task.id ?? '',
  projectId: task.project_id,
  title: task.title ?? '',
  status: task.status ?? '',
  columnId: (task.status ?? '') as KanbanTask['columnId'],
  priority: (task.priority ?? 'Medium') as KanbanTask['priority'],
  labels: [],
  assigneeInitials: task.assignee_name?.charAt(0).toUpperCase() ?? '',
  assigneeColor: colors.avatarIndigo,
  storyPoints: task.story_points ?? 0,
  dueDate: task.due_date ?? '',
  startDate: task.start_date ?? '',
  description: task.description ?? '',
  user_story_id: task.user_story_id,
  user_story_title: task.user_story_title,
  sprint: task.sprint_name,
});

export const BacklogTemplate = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [taskUserStoryId, setTaskUserStoryId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [activeStory, setActiveStory] = useState<UserStoryResponse | null>(null);
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, { sprintId: string | null; timestamp: number }>
  >(new Map());
  const [unassignedTasksOpen, setUnassignedTasksOpen] = useState(true);

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const selectedSprintStore = useAppSelector((state) => state.project.selectedSprint);
  const selectedProject = selectedApiProject?.id ?? '';
  const selectedSprint = selectedSprintStore?.id ?? '';

  // Debounce member search for API calls
  const debouncedMemberSearch = useDebounce(memberSearch, 500);

  // Get project members with search
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
    showAddTaskModal // Only fetch when modal is open
  );

  // Ref to store pending API calls
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Generate assignee options from fetched members
  const assigneeOptions =
    projectMembers?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    })
  );

  // Cleanup pending updates on unmount
  useEffect(() => {
    const pendingUpdates = pendingUpdatesRef.current;
    return () => {
      pendingUpdates.forEach((timeout) => clearTimeout(timeout));
      pendingUpdates.clear();
    };
  }, []);

  const { userStories, isLoadingUserStories } = useGetUserStories(
    selectedProject,
    {},
    !!selectedProject
  );

  const { tasksList, isLoadingTasks } = useGetTasks(selectedProject, undefined, !!selectedProject);

  const { sprints, isLoadingSprints, refetchSprints } = useGetSprints(
    selectedProject,
    undefined,
    !!selectedProject
  );

  const updateUserStoryMutation = useUpdateUserStory();
  const deleteUserStoryMutation = useDeleteUserStory();
  const { updateTaskAsync } = useUpdateTask();

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const storyId = active.data.current?.storyId;
      const taskId = active.data.current?.taskId;
      const task = active.data.current?.task;
      const type = active.data.current?.type;

      if (type === 'task' || taskId) {
        const foundTask = (tasksList ?? []).find((t) => t.id === taskId || t.key === taskId) ?? task;
        if (foundTask) {
          setActiveTask(foundTask);
          setActiveStory(null);
        }
      } else if (type === 'story' || storyId) {
        const foundStory = userStories.find((s) => s.id === storyId);
        if (foundStory) {
          setActiveStory(foundStory);
          setActiveTask(null);
        }
      }
    },
    [userStories, tasksList]
  );

  // Debounced API update function for user story sprint changes
  const scheduleUpdate = useCallback(
    (storyId: string, targetSprintId: string | null) => {
      // Cancel any existing pending update for this story
      const existingTimeout = pendingUpdatesRef.current.get(storyId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Schedule new update with 500ms debounce
      const timeoutId = setTimeout(async () => {
        try {
          // Explicitly send null when removing from sprint
          const payload = { sprint_id: targetSprintId };

          await updateUserStoryMutation.mutateAsync({
            projectId: selectedProject,
            userStoryId: storyId,
            payload,
          });

          // Remove from pending updates after successful API call
          pendingUpdatesRef.current.delete(storyId);

          // Update the React Query cache directly instead of refetching
          queryClient.setQueryData<{ data: UserStoryResponse[] }>(
            ['user-stories', selectedProject, {}],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                data: old.data.map((story) =>
                  story.id === storyId
                    ? { ...story, sprint_id: targetSprintId ?? undefined }
                    : story
                ),
              };
            }
          );

          // Clear optimistic update after cache is updated
          setOptimisticUpdates((prev) => {
            const next = new Map(prev);
            next.delete(storyId);
            return next;
          });
        } catch {
          // Rollback optimistic update on failure
          setOptimisticUpdates((prev) => {
            const next = new Map(prev);
            next.delete(storyId);
            return next;
          });

          toast.error('Failed to update user story');

          // Only refetch on error to restore correct state
          queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
        }
      }, 500);

      pendingUpdatesRef.current.set(storyId, timeoutId);
    },
    [selectedProject, updateUserStoryMutation, queryClient]
  );

  const handleDragOver = useCallback(() => {
    // Drag over handler
  }, []);

  // Track mouse position for manual backlog drop detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      (window as Window & { __lastMouseEvent?: MouseEvent }).__lastMouseEvent = e;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      const currentActiveTask = activeTask;
      const currentActiveStory = activeStory;
      setActiveStory(null);
      setActiveTask(null);

      if (!active || !selectedProject) return;

      let finalOver: typeof over = over;

      // Manual DOM-based fallback if over is null
      if (!over) {
        const lastMouseEvent = (window as Window & { __lastMouseEvent?: MouseEvent })
          ?.__lastMouseEvent;
        if (lastMouseEvent) {
          // Check story drop targets first
          const storyElements = document.querySelectorAll('[data-story-drop-id]');
          for (const el of Array.from(storyElements)) {
            const rect = el.getBoundingClientRect();
            if (
              lastMouseEvent.clientX >= rect.left &&
              lastMouseEvent.clientX <= rect.right &&
              lastMouseEvent.clientY >= rect.top &&
              lastMouseEvent.clientY <= rect.bottom
            ) {
              const storyId = el.getAttribute('data-story-drop-id');
              if (storyId) {
                finalOver = {
                  id: `story-drop-${storyId}`,
                  data: { current: { type: 'story', storyId } },
                } as NonNullable<typeof over>;
                break;
              }
            }
          }

          if (!finalOver) {
            const backlogElement = document.querySelector('[data-backlog-drop="true"]');
            if (backlogElement) {
              const rect = backlogElement.getBoundingClientRect();
              if (
                lastMouseEvent.clientX >= rect.left &&
                lastMouseEvent.clientX <= rect.right &&
                lastMouseEvent.clientY >= rect.top &&
                lastMouseEvent.clientY <= rect.bottom
              ) {
                finalOver = {
                  id: 'backlog-unassigned',
                  data: { current: { sprintId: null } },
                } as NonNullable<typeof over>;
              }
            }
          }
        }
      }

      if (!finalOver) return;

      const isTaskDrag =
        active.data.current?.type === 'task' ||
        !!active.data.current?.taskId ||
        !!currentActiveTask;
      const isStoryDrag =
        active.data.current?.type === 'story' ||
        !!active.data.current?.storyId ||
        !!currentActiveStory;

      // ----------------------
      // CASE 1: TASK DRAGGED
      // ----------------------
      if (isTaskDrag) {
        const taskId = (active.data.current?.taskId || currentActiveTask?.id || '') as string;
        if (!taskId) return;

        const targetType = finalOver.data.current?.type;
        const targetStoryId = finalOver.data.current?.storyId;
        const targetSprintId = finalOver.data.current?.sprintId;
        const overIdStr = String(finalOver.id);

        // A: Dropped on a User Story
        if (targetType === 'story' || targetStoryId || overIdStr.startsWith('story-')) {
          const storyId = targetStoryId || overIdStr.replace('story-drop-', '').replace('story-', '');
          const targetStory = userStories.find((s) => s.id === storyId);

          try {
            await updateTaskAsync({
              projectId: selectedProject,
              taskId,
              payload: {
                user_story_id: storyId,
                ...(targetStory?.sprint_id ? { sprint_id: targetStory.sprint_id } : {}),
              },
            });
            toast.success(
              `Task assigned to story "${targetStory?.title || 'User Story'}"`
            );
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['user-story', selectedProject, storyId] });
          } catch {
            toast.error('Failed to assign task to user story');
          }
          return;
        }

        // B: Dropped on a Sprint
        if (targetType === 'sprint' || (targetSprintId && !targetStoryId) || overIdStr.startsWith('sprint-')) {
          const sprintId = targetSprintId || overIdStr.replace('sprint-', '');
          const targetSprint = (sprints ?? []).find((s) => s.id === sprintId);

          try {
            await updateTaskAsync({
              projectId: selectedProject,
              taskId,
              payload: {
                sprint_id: sprintId,
              },
            });
            toast.success(`Task assigned to sprint "${targetSprint?.name || 'Sprint'}"`);
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
          } catch {
            toast.error('Failed to assign task to sprint');
          }
          return;
        }

        // C: Dropped on Unassigned Tasks / Backlog area (unassign)
        if (
          targetType === 'unassigned-tasks' ||
          overIdStr === 'tasks-unassigned' ||
          overIdStr === 'backlog-unassigned'
        ) {
          try {
            await updateTaskAsync({
              projectId: selectedProject,
              taskId,
              payload: {
                sprint_id: null,
                user_story_id: null,
              },
            });
            toast.success('Task unassigned from sprint and story');
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
          } catch {
            toast.error('Failed to unassign task');
          }
          return;
        }
      }

      // ----------------------
      // CASE 2: STORY DRAGGED
      // ----------------------
      if (isStoryDrag) {
        const storyId = (active.data.current?.storyId || currentActiveStory?.id) as string;
        const targetSprintId = finalOver.data.current?.sprintId;

        if (!storyId) return;

        // Find the current story to check if sprint changed
        const currentStory = userStories.find((s) => s.id === storyId);
        const effectiveCurrentSprintId =
          optimisticUpdates.get(storyId)?.sprintId ?? currentStory?.sprint_id;

        // Normalize undefined to null for comparison
        const normalizedCurrent = effectiveCurrentSprintId ?? null;
        const normalizedTarget = targetSprintId ?? null;

        if (normalizedCurrent === normalizedTarget) {
          // No change needed
          return;
        }

        // Optimistic UI update
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.set(storyId, { sprintId: normalizedTarget, timestamp: Date.now() });
          return next;
        });

        // Schedule debounced API call
        scheduleUpdate(storyId, normalizedTarget);
      }
    },
    [
      activeTask,
      activeStory,
      selectedProject,
      userStories,
      sprints,
      updateTaskAsync,
      queryClient,
      optimisticUpdates,
      scheduleUpdate,
    ]
  );

  const q = search.toLowerCase();

  // Apply optimistic updates to user stories
  const optimisticUserStories = userStories.map((story) => {
    const update = optimisticUpdates.get(story.id);
    if (update) {
      // Apply the optimistic update
      return { ...story, sprint_id: update.sprintId ?? undefined };
    }
    return story;
  });

  const filteredStories = (selectedProject ? optimisticUserStories : []).filter(
    (s) => s.title?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q)
  );

  // Separate user stories into unassigned and sprint-assigned
  const unassignedStories = filteredStories.filter((story) => !story.sprint_id);
  const allSprints = sprints ?? [];

  // Always create the droppable, even during loading
  const { setNodeRef: setBacklogNodeRef, isOver: isOverBacklog } = useDroppable({
    id: 'backlog-unassigned',
    data: { sprintId: null },
    disabled: false,
  });

  // Droppable for Unassigned Tasks
  const { setNodeRef: setUnassignedTasksNodeRef, isOver: isOverUnassignedTasks } = useDroppable({
    id: 'tasks-unassigned',
    data: { type: 'unassigned-tasks' },
    disabled: false,
  });

  // Create a ref callback for the backlog droppable
  const backlogRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      setBacklogNodeRef(node);
    },
    [setBacklogNodeRef]
  );

  // Custom collision detection prioritizing specific drop targets
  const collisionDetectionStrategy = useCallback((args: Parameters<typeof pointerWithin>[0]) => {
    const { pointerCoordinates, active } = args;

    if (!pointerCoordinates || !active) {
      return closestCorners(args);
    }

    // Try pointer detection
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prioritize story drop targets first
      const storyCollision = pointerCollisions.find(
        (c) => String(c.id).startsWith('story-drop-') || String(c.id).startsWith('story-')
      );
      if (storyCollision) {
        return [storyCollision];
      }

      // Next check sprint drop zone
      const sprintCollision = pointerCollisions.find((c) => String(c.id).startsWith('sprint-'));
      if (sprintCollision) {
        return [sprintCollision];
      }

      // Next check tasks unassigned drop zone
      const tasksCollision = pointerCollisions.find((c) => c.id === 'tasks-unassigned');
      if (tasksCollision) {
        return [tasksCollision];
      }

      // Next check backlog unassigned drop zone
      const backlogCollision = pointerCollisions.find((c) => c.id === 'backlog-unassigned');
      if (backlogCollision) {
        return [backlogCollision];
      }

      return pointerCollisions;
    }

    // DOM-based fallback if droppable registration hasn't caught it yet
    const storyElements = document.querySelectorAll('[data-story-drop-id]');
    for (const el of Array.from(storyElements)) {
      const rect = el.getBoundingClientRect();
      if (
        pointerCoordinates.x >= rect.left &&
        pointerCoordinates.x <= rect.right &&
        pointerCoordinates.y >= rect.top &&
        pointerCoordinates.y <= rect.bottom
      ) {
        const storyId = el.getAttribute('data-story-drop-id');
        if (storyId) {
          return [{ id: `story-drop-${storyId}` }];
        }
      }
    }

    const backlogElement = document.querySelector('[data-backlog-drop="true"]');
    if (backlogElement) {
      const rect = backlogElement.getBoundingClientRect();
      if (
        pointerCoordinates.x >= rect.left &&
        pointerCoordinates.x <= rect.right &&
        pointerCoordinates.y >= rect.top &&
        pointerCoordinates.y <= rect.bottom
      ) {
        return [{ id: 'backlog-unassigned' }];
      }
    }

    // Fallback
    return closestCorners(args);
  }, []);

  const activeDragType: 'task' | 'story' | null = activeTask
    ? 'task'
    : activeStory
      ? 'story'
      : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={collisionDetectionStrategy}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col gap-3 mb-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Backlog
                </h1>
                {selectedApiProject && (
                  <p className="text-sm mt-0.5 truncate text-gray-500 dark:text-slate-400">
                    {selectedApiProject.name}
                    {selectedSprintStore ? ` · ${selectedSprintStore.name}` : ' · All Sprints'}
                  </p>
                )}
              </div>
              <WpInput
                type="text"
                placeholder="Search User Story..."
                icon={<Search size={14} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperClassName="w-full sm:w-64"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <WpButton
                size="sm"
                leftIcon={<Plus size={14} />}
                disabled={!selectedProject}
                onClick={() => setShowCreateStoryModal(true)}
                className="whitespace-nowrap"
              >
                <span className="hidden sm:inline">Create User Story</span>
                <span className="sm:hidden">Create</span>
              </WpButton>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4">
          {/* Left Section: Unassigned User Stories & Backlog Tasks */}
          <div
            className="flex-1 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1"
            style={{ minHeight: '400px' }}
          >
            {isLoadingUserStories && selectedProject ? (
              <div className="mt-4">
                <BacklogSkeleton />
              </div>
            ) : (
              <>
                {/* Unassigned User Stories Section - Full droppable area */}
                <div
                  ref={backlogRefCallback}
                  data-backlog-drop="true"
                  className={`rounded-xl border overflow-hidden mb-3 transition-all duration-200 min-h-[200px] ${
                    isOverBacklog
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 shadow-xl ring-2 ring-green-300 ring-opacity-50 scale-[1.01]'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b transition-all ${
                      isOverBacklog
                        ? 'border-green-200 bg-green-100 dark:bg-green-900/20'
                        : 'border-gray-100 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`font-semibold text-sm transition-colors ${isOverBacklog ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-slate-100'}`}
                    >
                      Unassigned UserStories
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                        isOverBacklog
                          ? 'bg-green-200 text-green-800 scale-110'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                      }`}
                    >
                      {unassignedStories.length}{' '}
                      {unassignedStories.length === 1 ? 'story' : 'stories'}
                    </span>
                  </div>

                  {isOverBacklog && (
                    <div className="px-3 sm:px-4 pt-2 pb-1">
                      <div className="border-2 border-dashed border-green-400 rounded-lg p-4 text-center bg-white bg-opacity-60 backdrop-blur-sm animate-pulse">
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm text-green-700 font-semibold">
                            {activeDragType === 'task'
                              ? 'Drop task here to unassign from sprint'
                              : 'Drop here to remove from sprint'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty state or user stories */}
                  {unassignedStories.length === 0 && !isOverBacklog ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <svg
                        className="w-8 h-8 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
                        {!selectedProject
                          ? 'Select a project to view stories'
                          : 'No unassigned user stories'}
                      </p>
                      {selectedProject && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 text-center">
                          Create one or drag stories from sprints
                        </p>
                      )}
                    </div>
                  ) : (
                    unassignedStories.map((story) => (
                      <DraggableUserStory
                        key={story.id}
                        story={story}
                        projectId={selectedProject}
                        onStoryClick={(story) => setSelectedUserStory(story)}
                      />
                    ))
                  )}
                </div>

                {/* Unassigned Tasks Section - Droppable for unassigning */}
                <div
                  ref={setUnassignedTasksNodeRef}
                  className={`rounded-xl border overflow-hidden mb-3 transition-all duration-200 ${
                    isOverUnassignedTasks && activeTask
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-xl ring-2 ring-blue-300 ring-opacity-50 scale-[1.01]'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors select-none border-b border-gray-100 dark:border-slate-700"
                    onClick={() => setUnassignedTasksOpen((v) => !v)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-gray-400 dark:text-slate-500 shrink-0">
                        {unassignedTasksOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                        Unassigned Tasks
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                        {isLoadingTasks ? '...' : (tasksList?.length ?? 0)}{' '}
                        {(tasksList?.length ?? 0) === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    {hasPermission('TASK_CREATE') && selectedProject && (
                      <WpButton
                        size="sm"
                        variant="primary"
                        leftIcon={<Plus size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskUserStoryId('');
                          setShowAddTaskModal(true);
                        }}
                        className="!py-1 !px-2.5 text-xs shrink-0 whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">New Task</span>
                        <span className="sm:hidden">New</span>
                      </WpButton>
                    )}
                  </div>

                  {isOverUnassignedTasks && activeTask && (
                    <div className="px-3 sm:px-4 pt-2 pb-1">
                      <div className="border-2 border-dashed border-blue-400 rounded-lg p-3 text-center bg-white bg-opacity-60 backdrop-blur-sm animate-pulse">
                        <div className="flex items-center justify-center gap-2">
                          <Inbox className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-700 font-semibold">
                            Drop here to unassign from sprint and user story
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {unassignedTasksOpen && (
                    <div>
                      {isLoadingTasks ? (
                        <div className="flex flex-col gap-2 p-4">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-10 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : !tasksList || tasksList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4">
                          <svg
                            className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
                            {!selectedProject ? 'Select a project to view tasks' : 'No tasks found'}
                          </p>
                          {selectedProject && hasPermission('TASK_CREATE') && (
                            <div className="mt-3">
                              <WpButton
                                size="sm"
                                variant="secondary"
                                leftIcon={<Plus size={14} />}
                                onClick={() => {
                                  setTaskUserStoryId('');
                                  setShowAddTaskModal(true);
                                }}
                                className="text-xs"
                              >
                                Create Task
                              </WpButton>
                            </div>
                          )}
                        </div>
                      ) : (
                        tasksList.map((task) => (
                          <BacklogRow
                            key={task.id}
                            task={task}
                            onClick={() => setSelectedTask(mapTaskResponseToKanbanTask(task))}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Section: Sprint Drop Zones */}
          <div className="w-full lg:w-96 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1 border-t lg:border-t-0 lg:border-l dark:border-slate-700 pt-4 lg:pt-0 lg:pl-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-gray-900 dark:text-slate-100">Sprints</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700">
                  {allSprints.length} sprints
                </span>
              </div>
              {hasPermission('SPRINT_CREATE') && selectedProject && (
                <WpButton
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setShowAddSprintModal(true)}
                  className="!py-1 !px-2 text-xs"
                >
                  New
                </WpButton>
              )}
            </div>

            {isLoadingSprints ? (
              <div className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                Loading sprints...
              </div>
            ) : allSprints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center">
                  {!selectedProject
                    ? 'Select a project to view sprints.'
                    : 'No sprints found. Create a sprint to organize user stories.'}
                </p>
              </div>
            ) : (
              allSprints.map((sprint) => (
                <SprintDropZone
                  key={sprint.id}
                  sprint={sprint}
                  userStories={filteredStories}
                  projectId={selectedProject}
                  activeDragType={activeDragType}
                  onStoryClick={(story) => setSelectedUserStory(story)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-3 border-2 border-blue-500 max-w-md transform rotate-2 scale-105 transition-transform select-none">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] sm:text-xs font-semibold shrink-0"
                style={{ color: colors.primary }}
              >
                {activeTask.key || '-'}
              </span>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate flex-1">
                {activeTask.title}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <PriorityBadge priority={activeTask.priority || 'Medium'} />
              <StatusBadge status={activeTask.status} />
              {activeTask.assignee_name && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <AssigneeAvatar
                    initials={activeTask.assignee_name?.charAt(0).toUpperCase() || '?'}
                    color={colors.primary}
                    size="sm"
                  />
                  <span className="text-xs text-gray-600 dark:text-slate-400 truncate max-w-[100px]">
                    {activeTask.assignee_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : activeStory ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-3 border-2 border-blue-500 max-w-md transform rotate-3 scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                  {activeStory.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                    style={{
                      backgroundColor:
                        activeStory.priority === 'high'
                          ? '#FEE2E2'
                          : activeStory.priority === 'low'
                            ? '#DBEAFE'
                            : colors.gray100,
                      color:
                        activeStory.priority === 'high'
                          ? '#DC2626'
                          : activeStory.priority === 'low'
                            ? '#2563EB'
                            : colors.gray500,
                    }}
                  >
                    {activeStory.priority ?? 'medium'}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                    style={{
                      backgroundColor: colors.colTodoBg,
                      color: colors.primary,
                    }}
                  >
                    {activeStory.status ?? 'todo'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {showAddTaskModal && (
        <AddTaskModal
          projectId={selectedProject}
          sprintId={taskUserStoryId ? '' : selectedSprint}
          userStoryId={taskUserStoryId || undefined}
          assigneeOptions={assigneeOptions}
          memberSearch={memberSearch}
          onMemberSearchChange={setMemberSearch}
          isLoadingMembers={isLoadingProjectMembers || isFetchingProjectMembers}
          onClose={() => {
            setShowAddTaskModal(false);
            setTaskUserStoryId('');
            setMemberSearch(''); // Clear search on close
          }}
          onCreate={() => {
            setShowAddTaskModal(false);
            // Invalidate tasks, user stories list and specific user story detail
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
            if (taskUserStoryId) {
              queryClient.invalidateQueries({
                queryKey: ['user-story', selectedProject, taskUserStoryId],
              });
            }
            setTaskUserStoryId('');
            setMemberSearch(''); // Clear search after creation
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={() => setSelectedUserStory(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
          }}
          onCreateTask={() => {
            // Keep user story drawer open, task modal will appear on top
            setTaskUserStoryId(selectedUserStory.id);
            setShowAddTaskModal(true);
          }}
          onDelete={async () => {
            try {
              await deleteUserStoryMutation.mutateAsync({
                projectId: selectedProject,
                userStoryId: selectedUserStory.id,
              });
              queryClient.invalidateQueries({ queryKey: ['user-stories', selectedProject] });
              setSelectedUserStory(null);
            } catch (error) {
              // Error is already handled by the mutation
            }
          }}
        />
      )}
      {showCreateStoryModal && (
        <CreateUserStoryModal onClose={() => setShowCreateStoryModal(false)} />
      )}
      {showAddSprintModal && (
        <AddSprintModal
          projectId={selectedProject}
          onClose={() => setShowAddSprintModal(false)}
          onSuccess={async () => {
            await refetchSprints();
            setShowAddSprintModal(false);
          }}
        />
      )}
    </DndContext>
  );
};
