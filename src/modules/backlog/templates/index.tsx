'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  useGetUserStoryStatuses,
} from '@/src/modules/tasks/hooks/useUserStory';
import { useGetTasks, useUpdateTask } from '@/src/modules/tasks/hooks/useTask';
import { BacklogRow } from '../components/BacklogRow';
import {
  useCompleteSprint,
  useGetSprints,
  useStartSprint,
} from '@/src/modules/project/hooks/useSprint';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import AddSprintModal from '@/src/modules/project/components/addSprint';
import StartSprintModal from '../components/startSprintModal';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { useParams, useRouter } from 'next/navigation';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { KanbanTask } from '@/src/types/board';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import CreateUserStoryModal from '../components/createUserStoryModal';
import { SprintDropZone } from '../components/SprintDropZone';
import { DraggableUserStory } from '../components/DraggableUserStory';
import { PriorityBadge, StatusBadge, AssigneeAvatar } from '@/src/app/components/common/task';
import toast from 'react-hot-toast';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { PaginatedApiResponse } from '@/src/services/axios';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useDebounce } from '@/src/hooks/useDebounce';
import {
  useGetProjectMembers,
  useGetProjectsWithSprints,
} from '@/src/modules/project/hooks/useProject';
import { SprintDetail } from '@/src/types/project';
import CompleteSprintModal from '../components/CompleteSprint';
const mapTaskResponseToKanbanTask = (task: TaskResponse): KanbanTask => ({
  id: task.key || task.id || '',
  taskId: task.id || '',
  projectId: task.project_id || '',
  title: task.title || '',
  columnId: task.status_id || task.status || 'todo',
  status: task.status || 'todo',
  description: task.description || '',
  priority: task.priority
    ? ((task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
    : 'Medium',
  labels: [],
  dueDate: task.due_date ? task.due_date.split('T')[0] : '',
  storyPoints: task.story_points ?? 0,
  sprint: task.sprint_name ?? '',
  user_story_id: task.user_story_id,
  user_story_title: task.user_story_title,
  assigneeInitials: task.assignee_name
    ? task.assignee_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '',
  assigneeColor: colors.avatarBlue,
});

// --- Optimistic helpers for infinite query caches ---
type InfiniteTaskData = InfiniteData<PaginatedApiResponse<TaskResponse[]>>;
type InfiniteStoryData = InfiniteData<PaginatedApiResponse<UserStoryResponse[]>>;

/** Add an item to the first page of an infinite query cache */
function addToInfiniteCache<T>(
  old: InfiniteData<PaginatedApiResponse<T[]>> | undefined,
  item: T
): InfiniteData<PaginatedApiResponse<T[]>> | undefined {
  if (!old?.pages?.length) return old;
  const pages = [...old.pages];
  const firstPage = { ...pages[0], data: [item, ...(pages[0].data ?? [])] };
  // Increment total_items in meta if available
  if (firstPage.meta) {
    firstPage.meta = { ...firstPage.meta, total_items: (firstPage.meta.total_items ?? 0) + 1 };
  }
  pages[0] = firstPage;
  return { ...old, pages };
}

/** Remove an item by id from all pages of an infinite query cache */
function removeFromInfiniteCache<T extends { id?: string; key?: string }>(
  old: InfiniteData<PaginatedApiResponse<T[]>> | undefined,
  itemId: string
): InfiniteData<PaginatedApiResponse<T[]>> | undefined {
  if (!old?.pages?.length) return old;
  const pages = old.pages.map((page) => {
    const filtered = (page.data ?? []).filter((item) => item.id !== itemId && item.key !== itemId);
    if (filtered.length === (page.data ?? []).length) return page;
    const newPage = { ...page, data: filtered };
    if (newPage.meta) {
      newPage.meta = {
        ...newPage.meta,
        total_items: Math.max(0, (newPage.meta.total_items ?? 0) - 1),
      };
    }
    return newPage;
  });
  return { ...old, pages };
}

export const BacklogTemplate = () => {
  const queryClient = useQueryClient();
  const {
    canViewUserStories,
    canCreateUserStory,
    canEditUserStory,
    canDeleteUserStory,
    canViewTasks,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canViewSprints,
    canCreateSprint,
    canEditSprint,
    canDeleteSprint,
  } = usePermissions();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [taskUserStoryId, setTaskUserStoryId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [activeStory, setActiveStory] = useState<UserStoryResponse | null>(null);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, { sprintId: string | null; statusId?: string; timestamp: number }>
  >(new Map());
  const [optimisticTaskUpdates, setOptimisticTaskUpdates] = useState<
    Map<
      string,
      {
        sprintId: string | null;
        userStoryId: string | null;
        task?: TaskResponse;
        timestamp: number;
      }
    >
  >(new Map());
  const [unassignedTasksOpen, setUnassignedTasksOpen] = useState(true);
  const [showStartSprintModal, setShowStartSprintModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';
  const rawTaskKey = params?.taskKey;
  const taskKey = Array.isArray(rawTaskKey) ? rawTaskKey[0] : (rawTaskKey as string | undefined);

  const [selectedCompleteSprint, setSelectedCompleteSprint] = useState<SprintDetail | null>(null);
  const [actionSprint, setActionSprint] = useState<SprintDetail | null>(null);
  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

  // Find project matching current URL project slug if present
  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug === projectSlug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === projectSlug.toLowerCase()
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return false;
    return !matchedProject;
  }, [projectSlug, matchedProject, isLoadingProjectsWithSprints]);

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const selectedSprintStore = useAppSelector((state) => state.project.selectedSprint);

  // If on a projectSlug route, strictly use matchedProject; otherwise use Redux selectedApiProject
  const effectiveProject = projectSlug ? matchedProject : selectedApiProject;
  const selectedProject = effectiveProject?.id ?? '';
  const selectedSprint = selectedSprintStore?.id ?? '';
  const { userStoryStatuses } = useGetUserStoryStatuses(selectedProject, !!selectedProject);
  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== selectedApiProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, selectedApiProject?.id, dispatch]);

  // If on /backlog without projectSlug in URL, redirect to /[orgSlug]/[slug]/backlog
  useEffect(() => {
    if (!projectSlug && selectedApiProject?.slug && orgSlug) {
      router.replace(
        `/${orgSlug}/${selectedApiProject.slug}/backlog${taskKey ? `/${taskKey}` : ''}`
      );
    }
  }, [projectSlug, selectedApiProject?.slug, orgSlug, taskKey, router]);

  // Debounce member search for API calls
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  // Get project members with search
  const { startSprintAsync, isStartingSprint } = useStartSprint(selectedProject);

  const { completeSprint, isCompletingSprint } = useCompleteSprint(selectedProject);

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
    !!selectedProject && canViewUserStories
  );

  const { tasksList, isLoadingTasks } = useGetTasks(
    selectedProject,
    undefined,
    !!selectedProject && canViewTasks
  );

  const { sprints, isLoadingSprints, refetchSprints } = useGetSprints(
    selectedProject,
    undefined,
    !!selectedProject && canViewSprints
  );

  // Sync taskKey from URL with selectedTask / selectedUserStory
  useEffect(() => {
    if (!taskKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTask(null);
      setSelectedUserStory(null);
      return;
    }

    const isStory =
      taskKey.toUpperCase().startsWith('US-') || taskKey.toUpperCase().startsWith('US');
    if (isStory) {
      const matchedStory = userStories?.find(
        (s) => s.key?.toUpperCase() === taskKey.toUpperCase() || s.id === taskKey
      );
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
      const foundTask = tasksList?.find(
        (t) => t.key?.toUpperCase() === taskKey.toUpperCase() || t.id === taskKey
      );
      if (foundTask) {
        setSelectedTask(mapTaskResponseToKanbanTask(foundTask));
      } else {
        setSelectedTask({
          id: taskKey,
          key: taskKey,
          taskId: taskKey,
          title: 'Loading...',
          priority: 'Medium',
          status: 'todo',
          columnId: 'todo',
          project: selectedProject,
          projectId: selectedProject,
          assigneeInitials: '',
          assigneeColor: '',
          points: 0,
          labels: [],
        } as unknown as KanbanTask);
      }
      setSelectedUserStory(null);
    }
  }, [taskKey, userStories, tasksList, selectedProject]);

  const handleTaskClick = useCallback(
    (task: KanbanTask) => {
      setSelectedTask(task);
      setSelectedUserStory(null);
      const currentSlug = projectSlug || selectedApiProject?.slug || selectedApiProject?.id;
      if (orgSlug && currentSlug) {
        const key = task.id || task.taskId || task.key;
        window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/backlog/${key}`);
      }
    },
    [projectSlug, selectedApiProject?.slug, selectedApiProject?.id, orgSlug]
  );

  const handleUserStoryClick = useCallback(
    (story: UserStoryResponse) => {
      setSelectedUserStory(story);
      setSelectedTask(null);
      const currentSlug = projectSlug || selectedApiProject?.slug || selectedApiProject?.id;
      if (orgSlug && currentSlug) {
        const key = story.key || story.id;
        window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/backlog/${key}`);
      }
    },
    [projectSlug, selectedApiProject?.slug, selectedApiProject?.id, orgSlug]
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedTask(null);
    setSelectedUserStory(null);
    const currentSlug = projectSlug || selectedApiProject?.slug || selectedApiProject?.id;
    if (orgSlug && currentSlug) {
      window.history.pushState(null, '', `/${orgSlug}/${currentSlug}/backlog`);
    }
  }, [projectSlug, selectedApiProject?.slug, selectedApiProject?.id, orgSlug]);

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
        if (!canEditTask) {
          toast.error("You don't have permission to modify tasks");
          return;
        }
        const foundTask =
          (tasksList ?? []).find((t) => t.id === taskId || t.key === taskId) ?? task;
        if (foundTask) {
          setActiveTask(foundTask);
          setActiveStory(null);
        }
      } else if (type === 'story' || storyId) {
        if (!canEditUserStory) {
          toast.error("You don't have permission to modify user stories");
          return;
        }
        const foundStory = userStories.find((s) => s.id === storyId);
        if (foundStory) {
          setActiveStory(foundStory);
          setActiveTask(null);
        }
      }
    },
    [userStories, tasksList, canEditTask, canEditUserStory]
  );

  // Debounced API update function for user story sprint changes
  const scheduleUpdate = useCallback(
    (storyId: string, targetSprintId: string | null, currentStatus: string | null | undefined) => {
      const normalizedStatus = String(currentStatus ?? '')
        .toLowerCase()
        .trim()
        .replace(/_/g, ' ');

      let targetStatusId: string | undefined;

      // Unassigned -> Sprint
      // Todo -> In Progress
      if (targetSprintId && normalizedStatus === 'todo') {
        targetStatusId = userStoryStatuses.find(
          (status) => status.name.toLowerCase().trim().replace(/_/g, ' ') === 'in progress'
        )?.id;
      }

      // Sprint -> Unassigned
      // In Progress -> Todo
      if (!targetSprintId && normalizedStatus === 'in progress') {
        targetStatusId = userStoryStatuses.find(
          (status) => status.name.toLowerCase().trim().replace(/_/g, ' ') === 'todo'
        )?.id;
      }

      const existingTimeout = pendingUpdatesRef.current.get(storyId);

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeoutId = setTimeout(async () => {
        try {
          const payload = {
            sprint_id: targetSprintId,
            ...(targetStatusId ? { status_id: targetStatusId } : {}),
          };

          await updateUserStoryMutation.mutateAsync({
            projectId: selectedProject,
            userStoryId: storyId,
            payload,
          });

          pendingUpdatesRef.current.delete(storyId);

          queryClient.setQueryData<{ data: UserStoryResponse[] }>(
            ['user-stories', selectedProject, {}],
            (old) => {
              if (!old) return old;

              return {
                ...old,
                data: old.data.map((story) =>
                  story.id === storyId
                    ? {
                        ...story,
                        sprint_id: targetSprintId ?? undefined,
                        ...(targetStatusId
                          ? {
                              status_id: targetStatusId,
                              status: userStoryStatuses.find(
                                (status) => status.id === targetStatusId
                              )?.name,
                            }
                          : {}),
                      }
                    : story
                ),
              };
            }
          );

          setOptimisticUpdates((prev) => {
            const next = new Map(prev);
            next.delete(storyId);
            return next;
          });
        } catch {
          setOptimisticUpdates((prev) => {
            const next = new Map(prev);
            next.delete(storyId);
            return next;
          });

          toast.error('Failed to update user story');

          queryClient.invalidateQueries({
            queryKey: ['user-stories', selectedProject],
          });

          queryClient.invalidateQueries({
            queryKey: ['sprint-user-stories', selectedProject],
          });

          queryClient.invalidateQueries({
            queryKey: ['sprint-orphan-tasks', selectedProject],
          });
        }
      }, 500);

      pendingUpdatesRef.current.set(storyId, timeoutId);
    },
    [selectedProject, updateUserStoryMutation, queryClient, userStoryStatuses]
  );

  const handleDragOver = useCallback(() => {
    // Drag over handler
  }, []);

  // Track mouse/pointer position for manual backlog drop detection
  useEffect(() => {
    const handleMove = (e: MouseEvent | PointerEvent) => {
      (window as Window & { __lastMouseEvent?: MouseEvent | PointerEvent }).__lastMouseEvent = e;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      const currentActiveTask = activeTask;
      const currentActiveStory = activeStory;
      setActiveStory(null);
      setActiveTask(null);

      const effectiveProjectId =
        selectedProject ||
        active?.data?.current?.task?.project_id ||
        active?.data?.current?.task?.projectId ||
        currentActiveTask?.projectId ||
        '';

      if (!active || !effectiveProjectId) return;

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
            const directElements = document.querySelectorAll('[data-sprint-direct-id]');
            for (const el of Array.from(directElements)) {
              const rect = el.getBoundingClientRect();
              if (
                lastMouseEvent.clientX >= rect.left &&
                lastMouseEvent.clientX <= rect.right &&
                lastMouseEvent.clientY >= rect.top &&
                lastMouseEvent.clientY <= rect.bottom
              ) {
                const sprintId = el.getAttribute('data-sprint-direct-id');
                if (sprintId) {
                  finalOver = {
                    id: `sprint-direct-${sprintId}`,
                    data: { current: { type: 'sprint-direct', sprintId } },
                  } as NonNullable<typeof over>;
                  break;
                }
              }
            }
          }

          if (!finalOver) {
            const sprintElements = document.querySelectorAll('[data-sprint-drop-id]');
            for (const el of Array.from(sprintElements)) {
              const rect = el.getBoundingClientRect();
              if (
                lastMouseEvent.clientX >= rect.left &&
                lastMouseEvent.clientX <= rect.right &&
                lastMouseEvent.clientY >= rect.top &&
                lastMouseEvent.clientY <= rect.bottom
              ) {
                const sprintId = el.getAttribute('data-sprint-drop-id');
                if (sprintId) {
                  finalOver = {
                    id: `sprint-${sprintId}`,
                    data: { current: { type: 'sprint', sprintId } },
                  } as NonNullable<typeof over>;
                  break;
                }
              }
            }
          }

          if (!finalOver) {
            const tasksElement = document.querySelector('[data-tasks-drop="true"]');
            if (tasksElement) {
              const rect = tasksElement.getBoundingClientRect();
              if (
                lastMouseEvent.clientX >= rect.left &&
                lastMouseEvent.clientX <= rect.right &&
                lastMouseEvent.clientY >= rect.top &&
                lastMouseEvent.clientY <= rect.bottom
              ) {
                finalOver = {
                  id: 'tasks-unassigned',
                  data: { current: { type: 'unassigned-tasks' } },
                } as NonNullable<typeof over>;
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
        String(active.id).startsWith('task-') ||
        !!active.data.current?.taskId ||
        !!currentActiveTask;
      const isStoryDrag =
        active.data.current?.type === 'story' ||
        String(active.id).startsWith('story-') ||
        !!active.data.current?.storyId ||
        !!currentActiveStory;

      // ----------------------
      // CASE 1: TASK DRAGGED
      // ----------------------
      if (isTaskDrag) {
        if (!canEditTask) {
          toast.error("You don't have permission to modify tasks");
          return;
        }

        const taskId = (active.data.current?.task?.id ||
          active.data.current?.taskId ||
          currentActiveTask?.taskId ||
          currentActiveTask?.id ||
          String(active.id).replace(/^task-/, '')) as string;
        if (!taskId) return;

        // Resolve true task UUID
        const matchedTask =
          (tasksList ?? []).find((t) => t.id === taskId || t.key === taskId) ||
          (active.data.current?.task as TaskResponse | undefined) ||
          (currentActiveTask as unknown as TaskResponse | undefined);

        let actualTaskId = matchedTask?.id || taskId;
        if (!actualTaskId || actualTaskId === taskId) {
          for (const story of userStories) {
            const childTask = (story.tasks ?? []).find((t) => t.id === taskId || t.key === taskId);
            if (childTask?.id) {
              actualTaskId = childTask.id;
              break;
            }
          }
        }

        const targetType = finalOver.data.current?.type;
        const targetStoryId = finalOver.data.current?.storyId;
        const targetSprintId = finalOver.data.current?.sprintId;
        const overIdStr = String(finalOver.id);

        // A: Dropped on a User Story
        if (targetType === 'story' || targetStoryId || overIdStr.startsWith('story-')) {
          const storyId =
            targetStoryId || overIdStr.replace('story-drop-', '').replace('story-', '');
          const targetStory = userStories.find((s) => s.id === storyId);

          // Optimistic UI update: immediately remove from unassigned tasks
          setOptimisticTaskUpdates((prev) => {
            const next = new Map(prev);
            next.set(actualTaskId, {
              sprintId: targetStory?.sprint_id ?? null,
              userStoryId: storyId,
              timestamp: Date.now(),
            });
            return next;
          });

          // Optimistically update User Stories cache to increment task count
          const rawTask = (tasksList ?? []).find(
            (t) => t.id === taskId || t.key === taskId || t.id === actualTaskId
          );
          const taskToAppend: TaskResponse | undefined = rawTask
            ? { ...rawTask, id: actualTaskId, user_story_id: storyId }
            : currentActiveTask
              ? {
                  id: actualTaskId,
                  key: currentActiveTask.id,
                  title: currentActiveTask.title,
                  status: currentActiveTask.status || 'todo',
                  estimated_hours: 0,
                  user_story_id: storyId,
                  project_id: currentActiveTask.projectId || selectedProject,
                  story_points: currentActiveTask.storyPoints,
                  due_date: currentActiveTask.dueDate,
                }
              : undefined;

          if (taskToAppend) {
            queryClient.setQueriesData<{ data: UserStoryResponse[] }>(
              { queryKey: ['user-stories', selectedProject] },
              (old) => {
                if (!old?.data) return old;
                return {
                  ...old,
                  data: old.data.map((s) => {
                    if (s.id !== storyId) return s;
                    const currentTasks = s.tasks ?? [];
                    const alreadyExists = currentTasks.some(
                      (t) => t.id === actualTaskId || t.key === taskToAppend.key
                    );
                    if (alreadyExists) return s;
                    return {
                      ...s,
                      tasks: [...currentTasks, taskToAppend],
                      total_tasks: (s.total_tasks ?? currentTasks.length) + 1,
                    };
                  }),
                };
              }
            );

            // Optimistically update sprint user stories infinite cache
            if (targetStory?.sprint_id) {
              queryClient.setQueriesData<InfiniteStoryData>(
                { queryKey: ['sprint-user-stories', selectedProject, targetStory.sprint_id] },
                (old) => {
                  if (!old?.pages?.length) return old;
                  const pages = old.pages.map((page) => ({
                    ...page,
                    data: (page.data ?? []).map((s) => {
                      if (s.id !== storyId) return s;
                      const currentTasks = s.tasks ?? [];
                      const alreadyExists = currentTasks.some(
                        (t) => t.id === actualTaskId || t.key === taskToAppend.key
                      );
                      if (alreadyExists) return s;
                      return {
                        ...s,
                        tasks: [...currentTasks, taskToAppend],
                        total_tasks: (s.total_tasks ?? currentTasks.length) + 1,
                      };
                    }),
                  }));
                  return { ...old, pages };
                }
              );
            }
          }

          try {
            await updateTaskAsync({
              projectId: effectiveProjectId,
              taskId: actualTaskId,
              payload: {
                user_story_id: storyId,
                ...(targetStory?.sprint_id ? { sprint_id: targetStory.sprint_id } : {}),
              },
            });
            toast.success(`Task assigned to story "${targetStory?.title || 'User Story'}"`);
          } catch {
            // Rollback optimistic update
            setOptimisticTaskUpdates((prev) => {
              const next = new Map(prev);
              next.delete(actualTaskId);
              return next;
            });
            if (targetStory?.sprint_id) {
              queryClient.invalidateQueries({
                queryKey: ['sprint-user-stories', effectiveProjectId, targetStory.sprint_id],
              });
            }
            toast.error('Failed to assign task to user story');
          }
          return;
        }

        // B: Dropped on a Sprint or Direct Sprint Tasks
        const isDirectSprintDrop =
          targetType === 'sprint-direct' || overIdStr.startsWith('sprint-direct-');

        const isSprintDrop =
          isDirectSprintDrop ||
          targetType === 'sprint' ||
          (targetSprintId && !targetStoryId) ||
          overIdStr.startsWith('sprint-');

        if (isSprintDrop) {
          if (!canEditSprint) {
            toast.error("You don't have permission to modify sprints");
            return;
          }
          const sprintId =
            targetSprintId || overIdStr.replace('sprint-direct-', '').replace('sprint-', '');
          const targetSprint = (sprints ?? []).find((s) => s.id === sprintId);

          // Resolve the true Task ID (UUID)
          const matchedTask =
            (tasksList ?? []).find((t) => t.id === taskId || t.key === taskId) ||
            (active.data.current?.task as TaskResponse | undefined) ||
            (currentActiveTask as unknown as TaskResponse | undefined);

          let actualTaskId =
            matchedTask?.id ||
            active.data.current?.task?.id ||
            currentActiveTask?.taskId ||
            currentActiveTask?.id ||
            taskId;
          if (!actualTaskId || actualTaskId === taskId) {
            for (const story of userStories) {
              const childTask = (story.tasks ?? []).find(
                (t) => t.id === taskId || t.key === taskId
              );
              if (childTask?.id) {
                actualTaskId = childTask.id;
                break;
              }
            }
          }

          const taskToAppend: TaskResponse = matchedTask
            ? { ...matchedTask, id: actualTaskId, sprint_id: sprintId, user_story_id: undefined }
            : currentActiveTask
              ? {
                  id: actualTaskId,
                  key: currentActiveTask.id,
                  title: currentActiveTask.title,
                  status: currentActiveTask.status || 'todo',
                  estimated_hours: 0,
                  sprint_id: sprintId,
                  project_id: currentActiveTask.projectId || effectiveProjectId,
                  story_points: currentActiveTask.storyPoints,
                  due_date: currentActiveTask.dueDate,
                }
              : {
                  id: actualTaskId,
                  title: 'Task',
                  status: 'todo',
                  estimated_hours: 0,
                  sprint_id: sprintId,
                };

          // Optimistic UI update: immediately move to target sprint
          setOptimisticTaskUpdates((prev) => {
            const next = new Map(prev);
            next.set(actualTaskId, {
              sprintId,
              userStoryId: null,
              timestamp: Date.now(),
            });
            return next;
          });

          // Optimistically remove from any previous sprint's orphan tasks cache
          queryClient.setQueriesData<InfiniteTaskData>(
            { queryKey: ['sprint-orphan-tasks', effectiveProjectId] },
            (old) => removeFromInfiniteCache(old, actualTaskId)
          );

          // Optimistically add to target sprint's orphan tasks infinite cache
          queryClient.setQueriesData<InfiniteTaskData>(
            { queryKey: ['sprint-orphan-tasks', effectiveProjectId, sprintId] },
            (old) => addToInfiniteCache(old, taskToAppend)
          );

          // Optimistically remove from any sprint user story's tasks array
          queryClient.setQueriesData<InfiniteStoryData>(
            { queryKey: ['sprint-user-stories', effectiveProjectId] },
            (old) => {
              if (!old?.pages?.length) return old;
              const pages = old.pages.map((page) => ({
                ...page,
                data: (page.data ?? []).map((s) => {
                  const filtered = (s.tasks ?? []).filter(
                    (t) => t.id !== actualTaskId && t.key !== actualTaskId && t.id !== taskId
                  );
                  if (filtered.length === (s.tasks ?? []).length) return s;
                  return {
                    ...s,
                    tasks: filtered,
                    total_tasks: Math.max(0, (s.total_tasks ?? 0) - 1),
                  };
                }),
              }));
              return { ...old, pages };
            }
          );

          try {
            await updateTaskAsync({
              projectId: effectiveProjectId,
              taskId: actualTaskId,
              payload: {
                sprint_id: sprintId,
                user_story_id: null,
              },
            });
            toast.success(`Task assigned to sprint "${targetSprint?.name || 'Sprint'}"`);
          } catch (err) {
            // Rollback optimistic update
            setOptimisticTaskUpdates((prev) => {
              const next = new Map(prev);
              next.delete(actualTaskId);
              return next;
            });
            queryClient.invalidateQueries({
              queryKey: ['sprint-orphan-tasks', effectiveProjectId, sprintId],
            });
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
          const taskObj: TaskResponse | undefined =
            matchedTask ||
            (active.data.current?.task as TaskResponse | undefined) ||
            (currentActiveTask
              ? {
                  id: actualTaskId,
                  key: currentActiveTask.id,
                  title: currentActiveTask.title,
                  status: currentActiveTask.status || 'todo',
                  estimated_hours: 0,
                  project_id: currentActiveTask.projectId || effectiveProjectId,
                  story_points: currentActiveTask.storyPoints,
                  due_date: currentActiveTask.dueDate,
                }
              : undefined);

          // Optimistic UI update: explicitly set sprintId: null and userStoryId: null
          setOptimisticTaskUpdates((prev) => {
            const next = new Map(prev);
            next.set(actualTaskId, {
              sprintId: null,
              userStoryId: null,
              task: taskObj
                ? {
                    ...taskObj,
                    id: actualTaskId,
                    sprint_id: undefined,
                    user_story_id: undefined,
                  }
                : undefined,
              timestamp: Date.now(),
            });
            return next;
          });

          // Optimistically remove from all sprint orphan tasks caches
          queryClient.setQueriesData<InfiniteTaskData>(
            { queryKey: ['sprint-orphan-tasks', effectiveProjectId] },
            (old) => removeFromInfiniteCache(old, actualTaskId)
          );

          // Optimistically remove from any sprint user story's tasks array
          queryClient.setQueriesData<InfiniteStoryData>(
            { queryKey: ['sprint-user-stories', effectiveProjectId] },
            (old) => {
              if (!old?.pages?.length) return old;
              const pages = old.pages.map((page) => ({
                ...page,
                data: (page.data ?? []).map((s) => {
                  const filtered = (s.tasks ?? []).filter(
                    (t) => t.id !== actualTaskId && t.key !== actualTaskId && t.id !== taskId
                  );
                  if (filtered.length === (s.tasks ?? []).length) return s;
                  return {
                    ...s,
                    tasks: filtered,
                    total_tasks: Math.max(0, (s.total_tasks ?? 0) - 1),
                  };
                }),
              }));
              return { ...old, pages };
            }
          );

          try {
            await updateTaskAsync({
              projectId: effectiveProjectId,
              taskId: actualTaskId,
              payload: {
                sprint_id: null,
                user_story_id: null,
              },
            });
            toast.success('Task unassigned from sprint and story');
          } catch {
            // Rollback optimistic update
            setOptimisticTaskUpdates((prev) => {
              const next = new Map(prev);
              next.delete(actualTaskId);
              return next;
            });
            toast.error('Failed to unassign task');
          }
          return;
        }
      }

      // ----------------------
      // CASE 2: STORY DRAGGED
      // ----------------------
      if (isStoryDrag) {
        if (!canEditUserStory) {
          toast.error("You don't have permission to modify user stories");
          return;
        }

        const storyId = (active.data.current?.storyId || activeStory?.id) as string;
        const targetSprintId = finalOver.data.current?.sprintId;

        if (!storyId) return;

        if (targetSprintId && !canEditSprint) {
          toast.error("You don't have permission to modify sprints");
          return;
        }

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

        const storyObj: UserStoryResponse = currentStory ||
          activeStory || { id: storyId, title: 'Story' };

        // Optimistic UI update
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.set(storyId, {
            sprintId: normalizedTarget,
            statusId:
              normalizedTarget && storyObj.status?.toLowerCase() === 'todo'
                ? userStoryStatuses.find(
                    (status) =>
                      status.name.toLowerCase().trim().replace(/_/g, ' ') === 'in progress'
                  )?.id
                : !normalizedTarget &&
                    storyObj.status?.toLowerCase().replace(/_/g, ' ') === 'in progress'
                  ? userStoryStatuses.find(
                      (status) => status.name.toLowerCase().trim().replace(/_/g, ' ') === 'todo'
                    )?.id
                  : storyObj.status_id,
            timestamp: Date.now(),
          });
          return next;
        });

        // Optimistically add to target sprint's user stories cache
        if (normalizedTarget) {
          queryClient.setQueriesData<InfiniteStoryData>(
            { queryKey: ['sprint-user-stories', selectedProject, normalizedTarget] },
            (old) => addToInfiniteCache(old, { ...storyObj, sprint_id: normalizedTarget })
          );
        }

        // Optimistically remove from source sprint's user stories cache
        if (normalizedCurrent) {
          queryClient.setQueriesData<InfiniteStoryData>(
            { queryKey: ['sprint-user-stories', selectedProject, normalizedCurrent] },
            (old) => removeFromInfiniteCache(old, storyId)
          );
        }

        // Schedule debounced API call
        scheduleUpdate(storyId, normalizedTarget, storyObj.status);
      }
    },
    [
      selectedProject,
      userStories,
      tasksList,
      optimisticUpdates,
      optimisticTaskUpdates,
      scheduleUpdate,
      updateTaskAsync,
      activeTask,
      activeStory,
      sprints,
      queryClient,
      canEditTask,
      canEditUserStory,
      canEditSprint,
      userStoryStatuses,
    ]
  );

  const q = search.toLowerCase();

  // Apply optimistic updates to user stories
  const optimisticUserStories = userStories.map((story) => {
    const update = optimisticUpdates.get(story.id);

    if (update) {
      const updatedStatus = update.statusId
        ? userStoryStatuses.find((status) => status.id === update.statusId)
        : undefined;

      return {
        ...story,
        sprint_id: update.sprintId ?? undefined,
        status_id: update.statusId ?? undefined,
        status: updatedStatus?.name ?? story.status,
      };
    }

    return story;
  });

  // Apply optimistic updates to all tasks
  const baseTasks = [...(tasksList ?? [])];

  // If any unassigned task is in optimistic updates but not in tasksList yet, append it
  optimisticTaskUpdates.forEach((update, id) => {
    if (
      update.task &&
      update.sprintId === null &&
      update.userStoryId === null &&
      !baseTasks.some((t) => t.id === id || t.key === id)
    ) {
      baseTasks.push(update.task);
    }
  });

  const optimisticTasks = baseTasks.map((task) => {
    const taskId = task.id || task.key || '';
    const update =
      optimisticTaskUpdates.get(taskId) ||
      (task.id ? optimisticTaskUpdates.get(task.id) : undefined);
    if (update) {
      return {
        ...task,
        sprint_id: update.sprintId ?? undefined,
        user_story_id: update.userStoryId ?? undefined,
      };
    }
    return task;
  });

  // Filter unassigned tasks (tasks not assigned to any sprint or user story)
  const unassignedTasks = optimisticTasks.filter((task) => !task.sprint_id && !task.user_story_id);

  const filteredUnassignedTasks = (selectedProject ? unassignedTasks : []).filter(
    (t) =>
      t.title?.toLowerCase().includes(q) ||
      t.key?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q)
  );

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
  // Custom collision detection prioritizing specific drop targets
  const collisionDetectionStrategy = useCallback((args: Parameters<typeof pointerWithin>[0]) => {
    const { pointerCoordinates, active } = args;

    if (!pointerCoordinates || !active) {
      return closestCorners(args);
    }

    const isDraggingTask =
      active.data.current?.type === 'task' || String(active.id).startsWith('task-') || !!activeTask;

    // Try pointer detection
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      if (isDraggingTask) {
        // Prioritize story drop targets first for tasks
        const storyCollision = pointerCollisions.find(
          (c) => String(c.id).startsWith('story-drop-') || String(c.id).startsWith('story-')
        );
        if (storyCollision) {
          return [storyCollision];
        }

        // Prioritize direct sprint tasks drop zone over general sprint container
        const directCollision = pointerCollisions.find((c) =>
          String(c.id).startsWith('sprint-direct-')
        );
        if (directCollision) {
          return [directCollision];
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
      } else {
        // For stories: ignore self, prioritize sprint and backlog
        const filteredCollisions = pointerCollisions.filter((c) => c.id !== active.id);
        const sprintCollision = filteredCollisions.find((c) => String(c.id).startsWith('sprint-'));
        if (sprintCollision) {
          return [sprintCollision];
        }
        const backlogCollision = filteredCollisions.find((c) => c.id === 'backlog-unassigned');
        if (backlogCollision) {
          return [backlogCollision];
        }
        if (filteredCollisions.length > 0) {
          return filteredCollisions;
        }
      }

      return pointerCollisions;
    }

    // DOM-based fallback if droppable registration hasn't caught it yet
    if (isDraggingTask) {
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
    }
    if (isDraggingTask) {
      const directElements = document.querySelectorAll('[data-sprint-direct-id]');
      for (const el of Array.from(directElements)) {
        const rect = el.getBoundingClientRect();
        if (
          pointerCoordinates.x >= rect.left &&
          pointerCoordinates.x <= rect.right &&
          pointerCoordinates.y >= rect.top &&
          pointerCoordinates.y <= rect.bottom
        ) {
          const sprintId = el.getAttribute('data-sprint-direct-id');
          if (sprintId) {
            return [{ id: `sprint-direct-${sprintId}` }];
          }
        }
      }
    }
    if (isDraggingTask) {
      const sprintElements = document.querySelectorAll('[data-sprint-drop-id]');
      for (const el of Array.from(sprintElements)) {
        const rect = el.getBoundingClientRect();
        if (
          pointerCoordinates.x >= rect.left &&
          pointerCoordinates.x <= rect.right &&
          pointerCoordinates.y >= rect.top &&
          pointerCoordinates.y <= rect.bottom
        ) {
          const sprintId = el.getAttribute('data-sprint-drop-id');
          if (sprintId) {
            return [{ id: `sprint-${sprintId}` }];
          }
        }
      }
    }

    if (isDraggingTask) {
      const tasksElement = document.querySelector('[data-tasks-drop="true"]');
      if (tasksElement) {
        const rect = tasksElement.getBoundingClientRect();
        if (
          pointerCoordinates.x >= rect.left &&
          pointerCoordinates.x <= rect.right &&
          pointerCoordinates.y >= rect.top &&
          pointerCoordinates.y <= rect.bottom
        ) {
          return [{ id: 'tasks-unassigned' }];
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
  const sprintUserStories = selectedCompleteSprint
    ? userStories.filter((story) => story.sprint_id === selectedCompleteSprint.id)
    : [];

  const completedUserStories = sprintUserStories.filter((story) => {
    const status = String(story.status ?? '').toLowerCase();

    return status === 'completed' || status === 'complete' || status === 'done';
  }).length;

  const inProgressUserStories = sprintUserStories.filter((story) => {
    const status = String(story.status ?? '').toLowerCase();

    return status === 'in progress' || status === 'in_progress' || status === 'in-progress';
  }).length;

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

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
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Create User Story */}
              {canCreateUserStory && selectedProject && (
                <WpButton
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setShowCreateStoryModal(true)}
                  className="whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Create User Story</span>
                  <span className="sm:hidden">Create</span>
                </WpButton>
              )}
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
                {/* Unassigned User Stories Section */}
                <div
                  ref={canViewUserStories ? backlogRefCallback : undefined}
                  data-backlog-drop="true"
                  className={`rounded-xl border overflow-hidden mb-3 transition-all duration-200 min-h-[200px] ${
                    canViewUserStories && isOverBacklog
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 shadow-xl ring-2 ring-green-300 ring-opacity-50 scale-[1.01]'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b transition-all ${
                      canViewUserStories && isOverBacklog
                        ? 'border-green-200 bg-green-100 dark:bg-green-900/20'
                        : 'border-gray-100 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`font-semibold text-sm transition-colors ${
                        canViewUserStories && isOverBacklog
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-900 dark:text-slate-100'
                      }`}
                    >
                      Unassigned UserStories
                    </span>
                    {canViewUserStories && (
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
                    )}
                  </div>

                  {!canViewUserStories ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/kanban method-pana.svg"
                        alt="Access Restricted"
                        className="h-28 w-28 opacity-60 mb-2"
                      />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Access Restricted
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                        You do not have permission to view user stories.
                      </p>
                    </div>
                  ) : (
                    <>
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
                          {selectedProject && canCreateUserStory && (
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
                            tasks={optimisticTasks}
                            onStoryClick={handleUserStoryClick}
                          />
                        ))
                      )}
                    </>
                  )}
                </div>

                {/* Unassigned Tasks Section */}
                <div
                  ref={canViewTasks ? setUnassignedTasksNodeRef : undefined}
                  data-tasks-drop="true"
                  className={`rounded-xl border overflow-hidden mb-3 transition-all duration-200 ${
                    canViewTasks &&
                    isOverUnassignedTasks &&
                    (activeTask || activeDragType === 'task')
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
                        {unassignedTasksOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
                        Unassigned Tasks
                      </span>
                      {canViewTasks && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                          {isLoadingTasks ? '...' : filteredUnassignedTasks.length}{' '}
                          {filteredUnassignedTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      )}
                    </div>
                    {canViewTasks && canCreateTask && selectedProject && (
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

                  {!canViewTasks ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/kanban method-pana.svg"
                        alt="Access Restricted"
                        className="h-28 w-28 opacity-60 mb-2"
                      />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Access Restricted
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                        You do not have permission to view tasks.
                      </p>
                    </div>
                  ) : (
                    <>
                      {isOverUnassignedTasks && (activeTask || activeDragType === 'task') && (
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
                          ) : !filteredUnassignedTasks || filteredUnassignedTasks.length === 0 ? (
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
                                {!selectedProject
                                  ? 'Select a project to view tasks'
                                  : 'No unassigned tasks found'}
                              </p>
                              {selectedProject && canCreateTask && (
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
                            filteredUnassignedTasks.map((task) => (
                              <BacklogRow
                                key={task.id || task.key}
                                task={task}
                                onClick={() => handleTaskClick(mapTaskResponseToKanbanTask(task))}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Section: Sprint Drop Zones */}
          {canViewSprints && (
            <div className="w-full lg:w-[480px] xl:w-[560px] 2xl:w-[640px] flex-shrink-0 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1 border-t lg:border-t-0 lg:border-l dark:border-slate-700 pt-4 lg:pt-0 lg:pl-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-gray-900 dark:text-slate-100">
                    Sprints
                  </h2>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700">
                    {allSprints.length} sprints
                  </span>
                </div>
                {canCreateSprint && selectedProject && (
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
                    projectId={selectedProject}
                    activeDragType={activeDragType}
                    onStoryClick={handleUserStoryClick}
                    onTaskClick={(task) => handleTaskClick(mapTaskResponseToKanbanTask(task))}
                    onStartSprint={(sprint) => {
                      setActionSprint(sprint);
                      setShowStartSprintModal(true);
                    }}
                    onCompleteSprint={(sprint) => {
                      setSelectedCompleteSprint(sprint);
                    }}
                    isCompletingSprint={
                      isCompletingSprint && selectedCompleteSprint?.id === sprint.id
                    }
                  />
                ))
              )}
            </div>
          )}
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
              <StatusBadge status={activeTask?.status ?? ''} />
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

      {showAddTaskModal && canCreateTask && (
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
            // Invalidate sprint-scoped queries
            queryClient.invalidateQueries({ queryKey: ['sprint-user-stories', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['sprint-orphan-tasks', selectedProject] });
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

      {selectedTask && <TaskDetailDrawer task={selectedTask} onClose={handleCloseDrawer} />}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={handleCloseDrawer}
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
              handleCloseDrawer();
            } catch (error) {
              // Error is already handled by the mutation
            }
          }}
        />
      )}
      {showCreateStoryModal && canCreateUserStory && (
        <CreateUserStoryModal onClose={() => setShowCreateStoryModal(false)} />
      )}
      {showAddSprintModal && canCreateSprint && (
        <AddSprintModal
          projectId={selectedProject}
          onClose={() => setShowAddSprintModal(false)}
          onSuccess={async () => {
            await refetchSprints();
            setShowAddSprintModal(false);
          }}
        />
      )}

      {showStartSprintModal && actionSprint && canEditSprint && (
        <StartSprintModal
          sprint={actionSprint}
          isStarting={isStartingSprint}
          onClose={() => {
            setShowStartSprintModal(false);
            setActionSprint(null);
          }}
          onStart={async (payload) => {
            try {
              await startSprintAsync({
                sprintId: actionSprint.id,
                payload,
              });

              setShowStartSprintModal(false);
              setActionSprint(null);

              await refetchSprints();
            } catch {
              // API error is handled by apiService
            }
          }}
        />
      )}
      {selectedCompleteSprint && canEditSprint && (
        <CompleteSprintModal
          sprint={selectedCompleteSprint}
          completedUserStories={completedUserStories}
          inProgressUserStories={inProgressUserStories}
          onClose={() => setSelectedCompleteSprint(null)}
          isCompleting={isCompletingSprint}
          onComplete={async () => {
            try {
              await completeSprint(selectedCompleteSprint.id);

              toast.success('Sprint completed successfully');

              setSelectedCompleteSprint(null);
              await refetchSprints();
            } catch {
              toast.error('Failed to complete sprint');
            }
          }}
        />
      )}
    </DndContext>
  );
};
