'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Filter } from 'lucide-react';
import { logger } from '@/src/lib/utils/logger';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSprints } from '@/src/store/slices/project';
import { useGetBoard, type BoardPageFilters } from '@/src/modules/boards/hooks/useBoards';
import { useGetStatus, useGetLabels } from '@/src/modules/project/hooks/useLabels';
import {
  useGetProjectMembers,
  useGetProjectsWithSprints,
} from '@/src/modules/project/hooks/useProject';
import { taskService } from '@/src/services/tasks';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { TaskResponse } from '@/src/types/task';
import { taskTypeOptions } from '@/src/app/components/common/enum';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DropAnimation } from '@dnd-kit/core';
import { KanbanTask, BoardQueryParams, BoardStatusColumn } from '@/src/types/board';
import { FilterPanel, FilterState } from '@/src/app/components/common/filter-panel';
import { useOutsideClick } from '@/src/hooks/useOutsideClick';
import { WpButton } from '@/src/app/components/common/button';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import { useDeleteUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import toast from 'react-hot-toast';
import { useDebounce } from '@/src/hooks/useDebounce';
import { usePermissions } from '@/src/hooks/usePermissions';
import Image from 'next/image';
import {
  UserStoryRow,
  BoardSkeleton,
  KanbanCardPreview,
  ScrollIndicator,
  isStorylessId,
  patchPageData,
  columnsOf,
  STORYLESS_ID,
  type OptimisticUpdate,
  BoardInfiniteData,
  ColumnPatch,
  getStorylessColumns,
} from '../components';
import { CustomStatus } from '@/src/types/colors';
import { AssigneeAvatars } from '../components/assigneeAvatar';
import { StatusColumnHeader } from '../components/statusColumnHeader';

export const KanbanBoardTemplate = () => {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overCell, setOverCell] = useState<{ storyId: string; statusId: string } | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(
    new Map()
  );
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [collapsedStatuses, setCollapsedStatuses] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskUserStoryId, setTaskUserStoryId] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    priorities: [],
    assignees: [],
    labels: [],
    types: [],
    statuses: [],
  });
  const [assigneeIdFilter, setAssigneeIdFilter] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const closedTaskKeyRef = useRef<string | null>(null);
  const allTasksRef = useRef<Map<string, KanbanTask>>(new Map());
  const [memberSearch, setMemberSearch] = useState('');
  const [filterMemberSearch, setFilterMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const debouncedFilterMemberSearch = useDebounce(filterMemberSearch, 500);

  const queryClient = useQueryClient();
  const deleteUserStoryMutation = useDeleteUserStory();
  const { canViewTasks, canCreateTask, canEditTask, canViewUserStories, canViewSprints } =
    usePermissions();

  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = (params?.orgSlug as string) || '';
  const projectSlug = (params?.projectSlug as string) || '';
  const rawTaskKey = params?.taskKey;
  const taskKey = Array.isArray(rawTaskKey) ? rawTaskKey[0] : (rawTaskKey as string | undefined);

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

  // Find project matching current URL project slug if present
  const matchedProject = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return null;
    const lowerSlug = projectSlug.toLowerCase();
    return (
      projectsWithSprints.find(
        (p) =>
          p.slug?.toLowerCase() === lowerSlug ||
          p.id === projectSlug ||
          p.key?.toLowerCase() === lowerSlug ||
          p.name?.toLowerCase() === lowerSlug
      ) || null
    );
  }, [projectSlug, projectsWithSprints, isLoadingProjectsWithSprints]);

  const isProjectNotFound = useMemo(() => {
    if (!projectSlug || isLoadingProjectsWithSprints) return false;
    return !matchedProject;
  }, [projectSlug, matchedProject, isLoadingProjectsWithSprints]);

  const { selectedProject: storeProject, selectedSprint: storeSprint } = useAppSelector(
    (state) => state.project
  );

  // If on a projectSlug route, strictly use matchedProject; otherwise use Redux storeProject
  const effectiveProject = projectSlug ? matchedProject : storeProject;
  const selectedProject = effectiveProject?.id ?? '';
  const selectedSprint = storeSprint?.id ?? '';

  // Sync project to Redux when matched from URL projectSlug
  useEffect(() => {
    if (matchedProject && matchedProject.id !== storeProject?.id) {
      dispatch(setSelectedProject(matchedProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(matchedProject.sprints || []));
    }
  }, [matchedProject, storeProject?.id, dispatch]);

  // If on /boards without projectSlug in URL, redirect to /[orgSlug]/[slug]/boards
  useEffect(() => {
    if (!projectSlug && storeProject?.slug && orgSlug) {
      router.replace(`/${orgSlug}/${storeProject.slug}/boards${taskKey ? `/${taskKey}` : ''}`);
    }
  }, [projectSlug, storeProject?.slug, orgSlug, taskKey, router]);

  // Fetch project members for outer avatar display (always fetch all members, no search)
  const { members: displayMembers } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 50,
      name: '', // No search filter for display members
    },
    true // Always fetch
  );

  // Fetch project members for assignee filtering with search
  const {
    members: filterMembers,
    isLoadingMembers: isLoadingFilterMembers,
    isFetchingMembers: isFetchingFilterMembers,
  } = useGetProjectMembers(
    selectedProject,
    {
      page: 1,
      page_size: 50,
      name: debouncedFilterMemberSearch,
    },
    showFilter // Only fetch when filter is open
  );

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
    showAddTaskModal && canCreateTask // Only fetch when modal is open and has permission
  );

  // Generate assignee options from fetched members
  const assigneeOptions =
    projectMembers?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  useOutsideClick(filterRef, () => setShowFilter(false));

  const canViewBoard = canViewTasks && canViewUserStories && canViewSprints;

  // Board API query params — user stories with their statuses+tasks
  const boardQueryParams = useMemo(() => {
    const p: BoardQueryParams = { page_size: 50, tasks_per_status: 3 };
    if (selectedSprint) p.sprint_id = selectedSprint;
    if (filters.priorities.length > 0)
      p.priority = filters.priorities.map((v) => v.toLowerCase()).join(',');
    if (assigneeIdFilter.length > 0) p.task_assignee_id = assigneeIdFilter.join(',');
    if (filters.types.length > 0) p.type = filters.types.map((v) => v.toLowerCase()).join(',');
    if (filters.statuses.length > 0) p.task_status_id = filters.statuses.join(',');
    return p;
  }, [selectedSprint, filters.priorities, filters.types, filters.statuses, assigneeIdFilter]);

  const pageFilters = useMemo<BoardPageFilters>(
    () => ({
      sprint_id: boardQueryParams.sprint_id,
      priority: boardQueryParams.priority,
      task_assignee_id: boardQueryParams.task_assignee_id,
      type: boardQueryParams.type,
      task_status_id: boardQueryParams.task_status_id,
    }),
    [boardQueryParams]
  );

  const { boardStories, isLoadingBoard, refetchBoard } = useGetBoard(
    selectedProject,
    boardQueryParams,
    !!selectedProject && canViewBoard
  );

  const storylessQueryParams = useMemo(() => {
    const p: BoardQueryParams = {
      page_size: 50,
      tasks_per_status: 3,
      storyless_tasks: true,
    };
    if (selectedSprint) p.sprint_id = selectedSprint;
    if (filters.priorities.length > 0)
      p.priority = filters.priorities.map((v) => v.toLowerCase()).join(',');
    if (assigneeIdFilter.length > 0) p.task_assignee_id = assigneeIdFilter.join(',');
    if (filters.types.length > 0) p.type = filters.types.map((v) => v.toLowerCase()).join(',');
    if (filters.statuses.length > 0) p.task_status_id = filters.statuses.join(',');
    return p;
  }, [selectedSprint, filters.priorities, filters.types, filters.statuses, assigneeIdFilter]);

  const {
    boardStories: storylessStories,
    isLoadingBoard: isLoadingStorylessTasks,
    refetchBoard: refetchStorylessTasks,
  } = useGetBoard(selectedProject, storylessQueryParams, !!selectedProject && canViewBoard);

  const handleRefetch = useCallback(() => {
    refetchBoard();
    refetchStorylessTasks();
  }, [refetchBoard, refetchStorylessTasks]);

  // Fetch status columns
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(selectedProject);

  // Fetch labels for filtering
  const { data: labelsResponse } = useGetLabels(selectedProject);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const boardLoading =
    !!selectedProject &&
    canViewBoard &&
    (isLoadingBoard || isLoadingStorylessTasks || isLoadingStatus);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.4' } },
    }),
    duration: 150,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  };

  const hasActiveFilter =
    filters.priorities.length > 0 ||
    assigneeIdFilter.length > 0 ||
    filters.labels.length > 0 ||
    filters.types.length > 0 ||
    filters.statuses.length > 0;

  // Helper to resolve status ID for a task
  const resolveStatusId = useCallback(
    (task: TaskResponse): string => {
      // 1. If task has status_id and it directly matches a custom status
      if (task.status_id && statuses.some((s) => s.id === task.status_id)) {
        return task.status_id;
      }

      // 2. If task.status matches a status id
      if (task.status && statuses.some((s) => s.id === task.status)) {
        return task.status;
      }

      // 3. Match by name (case-insensitive) against task.status or task.status_id
      const targetStatusName = (task.status || task.status_id || '')
        .toLowerCase()
        .replace(/_/g, ' ');
      const matchedByName = statuses.find((s) => {
        const sName = s.name.toLowerCase().replace(/_/g, ' ');
        return sName === targetStatusName;
      });

      if (matchedByName) {
        return matchedByName.id;
      }

      // 4. Fallback to first custom status or task status_id
      return task.status_id || task.status || statuses[0]?.id || '';
    },
    [statuses]
  );

  // Helper to filter tasks based on active filters
  const taskMatchesFilters = useCallback(
    (task: TaskResponse): boolean => {
      // Priority filter
      if (filters.priorities.length > 0) {
        const taskPriority = (task.priority || '').toLowerCase();
        if (!filters.priorities.some((p) => p.toLowerCase() === taskPriority)) {
          return false;
        }
      }

      // Assignee filter
      if (assigneeIdFilter.length > 0) {
        const taskAssigneeId =
          task.assignee_id || task.assignee?.id || (task.assignee as { user_id?: string })?.user_id;
        if (!taskAssigneeId || !assigneeIdFilter.includes(taskAssigneeId)) {
          return false;
        }
      }

      // Label filter
      if (filters.labels.length > 0) {
        const taskLabelIds = (task.labels || []).map((label) =>
          typeof label === 'string' ? label : label.id
        );
        // Check if task has at least one of the selected labels
        const hasMatchingLabel = filters.labels.some((labelId) => taskLabelIds.includes(labelId));
        if (!hasMatchingLabel) {
          return false;
        }
      }

      // Type filter
      if (filters.types.length > 0) {
        const taskType = (task.type || '').toLowerCase();
        if (!filters.types.some((t) => t.toLowerCase() === taskType)) {
          return false;
        }
      }

      // Status filter
      if (filters.statuses.length > 0) {
        const resolved = resolveStatusId(task);
        if (
          !filters.statuses.includes(resolved) &&
          !filters.statuses.includes(task.status_id || '') &&
          !filters.statuses.includes(task.status || '')
        ) {
          return false;
        }
      }

      return true;
    },
    [filters, assigneeIdFilter, resolveStatusId]
  );

  // Helper to map a TaskResponse to KanbanTask
  const mapToKanbanTask = useCallback(
    (
      task: TaskResponse,
      parentStoryId: string,
      resolvedStatusId: string,
      parentStoryKey?: string,
      parentStoryTitle?: string
    ): KanbanTask => {
      const taskKey = task.key ?? task.id ?? '';
      const isRealStory = !!parentStoryId && !isStorylessId(parentStoryId);
      return {
        id: taskKey,
        taskId: task.id ?? '',
        projectId: task.project_id ?? selectedProject,
        title: task.title ?? '',
        priority: task.priority
          ? ((task.priority.charAt(0).toUpperCase() +
              task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
          : 'Medium',
        labels: [],
        assigneeInitials: task.assignee_name
          ? task.assignee_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : '',
        assigneeColor: task?.assignee?.color ?? '',
        storyPoints: task.story_points ?? 0,
        dueDate: task.due_date ? task.due_date.split('T')[0] : '',
        columnId: resolvedStatusId,
        sprint: task.sprint_name ?? '',
        parent: parentStoryId,
        user_story_id: task.user_story_id || (isRealStory ? parentStoryId : undefined),
        user_story_title: task.user_story_title || parentStoryTitle,
        user_story_key: parentStoryKey,
        assignee: task.assignee_name ?? task.assignee?.name ?? '',
      };
    },
    [selectedProject]
  );

  // Process tasks from the board API — user stories with statuses[].tasks already grouped.
  const processedStories = useMemo(() => {
    const mappedStories = boardStories.map((story) => {
      const allStoryTasks = story.statuses.flatMap((col) => col.tasks);
      const taskLookup = new Map(allStoryTasks.map((t) => [t.key ?? t.id, t]));
      // Track which status cells have more tasks beyond the initial page
      const hasMoreByStatus = new Map<string, boolean>(
        story.statuses.map((col) => [col.status_id, col.meta?.has_next ?? false])
      );
      const tasksByStatus = story.statuses.reduce<Map<string, KanbanTask[]>>((acc, statusCol) => {
        const tasks = allStoryTasks
          .filter((task) => {
            const key = task.key ?? task.id ?? '';
            const optimistic = optimisticUpdates.get(key);
            if (optimistic) {
              return optimistic.statusId === statusCol.status_id && optimistic.storyId === story.id;
            }
            return (
              task.status_id === statusCol.status_id ||
              resolveStatusId(task) === statusCol.status_id
            );
          })
          .filter((task) => !hasActiveFilter || taskMatchesFilters(task))
          .map((task) => {
            const key = task.key ?? task.id ?? '';
            const optimistic = optimisticUpdates.get(key);
            const effectiveStatusId = optimistic?.statusId ?? statusCol.status_id;
            const effectiveStoryId = optimistic?.storyId ?? story.id;
            return mapToKanbanTask(
              task,
              effectiveStoryId,
              effectiveStatusId,
              story.key,
              story.title
            );
          });

        const movedInFromOtherStory: KanbanTask[] = Array.from(optimisticUpdates.entries())
          .filter(
            ([key, upd]) =>
              !!upd.task &&
              upd.storyId === story.id &&
              upd.statusId === statusCol.status_id &&
              !taskLookup.has(key)
          )
          .map(([, upd]) => ({
            ...(upd.task as KanbanTask),
            columnId: statusCol.status_id,
            parent: story.id,
          }))
          .filter((t) => !tasks.some((kt) => kt.id === t.id));

        const allTasks = [...tasks, ...movedInFromOtherStory];
        if (allTasks.length > 0) acc.set(statusCol.status_id, allTasks);
        return acc;
      }, new Map());

      return { ...story, tasksByStatus, hasMoreByStatus, total_tasks: story.total_tasks ?? 0 };
    });

    const storylessStatusColumns = getStorylessColumns(storylessStories);

    const storylessTasks = storylessStatusColumns
      .flatMap((statusCol) => statusCol.tasks ?? [])
      .filter((task) => !hasActiveFilter || taskMatchesFilters(task));

    const storylessTasksByStatus = storylessTasks.reduce<Map<string, KanbanTask[]>>((acc, task) => {
      const key = task.key ?? task.id ?? '';
      const optimistic = optimisticUpdates.get(key);
      const effectiveStoryId = optimistic?.storyId ?? STORYLESS_ID;
      if (effectiveStoryId !== STORYLESS_ID) return acc;
      const resolvedStatus = resolveStatusId(task);
      const effectiveStatusId = optimistic?.statusId ?? resolvedStatus;
      const kt = mapToKanbanTask(task, STORYLESS_ID, effectiveStatusId);
      const bucket = acc.get(effectiveStatusId) ?? [];
      if (bucket.some((t) => t.id === kt.id)) return acc;
      acc.set(effectiveStatusId, [...bucket, kt]);
      return acc;
    }, new Map());

    optimisticUpdates.forEach((upd, key) => {
      if (upd.storyId !== STORYLESS_ID || !upd.task) return;
      const bucket = storylessTasksByStatus.get(upd.statusId) ?? [];
      if (bucket.some((t) => t.id === key)) return;
      storylessTasksByStatus.set(upd.statusId, [
        ...bucket,
        { ...upd.task, columnId: upd.statusId, parent: STORYLESS_ID },
      ]);
    });

    const storylessHasMoreByStatus = new Map<string, boolean>(
      storylessStatusColumns.map((col) => [col.status_id, col.meta?.has_next ?? false])
    );

    const directSprintTotal = storylessStatusColumns.reduce(
      (sum, col) => sum + (col.task_count ?? 0),
      0
    );

    if (directSprintTotal > 0 || (!!selectedSprint && !hasActiveFilter)) {
      mappedStories.push({
        id: STORYLESS_ID,
        title: 'Storyless Tasks',
        description: selectedSprint
          ? 'Tasks assigned to this sprint without a user story'
          : 'Tasks assigned to sprints without a user story',
        priority: 'medium',
        status: 'in_progress',
        statuses: [],
        tasksByStatus: storylessTasksByStatus,
        hasMoreByStatus: storylessHasMoreByStatus,
        total_tasks: directSprintTotal,
      } as unknown as (typeof mappedStories)[0]);
    }

    return mappedStories;
  }, [
    boardStories,
    storylessStories,
    selectedSprint,
    hasActiveFilter,
    taskMatchesFilters,
    optimisticUpdates,
    resolveStatusId,
    mapToKanbanTask,
  ]);

  // Sync taskKey from URL with selectedTask / selectedUserStory
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
  }, [taskKey]);

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

  const hasTasks = processedStories.some((story) => (story.total_tasks ?? 0) > 0);

  // Derive unique assignees from filter members search results
  const allAssignees = useMemo(() => {
    if (!filterMembers || filterMembers.length === 0) return [];

    return filterMembers
      .map((m) => ({
        name: m.full_name || m.user?.full_name || '',
        color: m.color ?? null,
      }))
      .filter((assignee) => assignee.name !== '')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filterMembers]);

  // Use labels from API instead of extracting from tasks
  const allLabels = useMemo(() => {
    return labelsResponse?.data || [];
  }, [labelsResponse]);

  // Use predefined task type options
  const allTypes = useMemo(() => {
    return taskTypeOptions.map((option) => option.label);
  }, []);

  // Map assignee names to IDs
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);

      // Convert selected assignee names to user IDs
      const assigneeIds = newFilters.assignees
        .map((assigneeName) => {
          const member = filterMembers?.find((m) => {
            const name = m.full_name || m.user?.full_name || '';
            return name === assigneeName;
          });
          return member?.user_id || member?.user?.id || member?.id;
        })
        .filter((id): id is string => !!id);

      setAssigneeIdFilter(assigneeIds);
    },
    [filterMembers]
  );

  // Helper to get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Toggle assignee filter
  const toggleAssigneeFilter = (memberId: string, memberName: string) => {
    logger.log('Toggle assignee filter:', { memberId, memberName });
    const isSelected = assigneeIdFilter.includes(memberId);
    const newAssigneeIds = isSelected
      ? assigneeIdFilter.filter((id) => id !== memberId)
      : [...assigneeIdFilter, memberId]; // Add to existing selections for multi-select

    const newAssigneeNames = isSelected
      ? filters.assignees.filter((name) => name !== memberName)
      : [...filters.assignees, memberName]; // Add to existing selections for multi-select

    logger.log('New assignee filter state:', { newAssigneeIds, newAssigneeNames });
    setAssigneeIdFilter(newAssigneeIds);
    setFilters({ ...filters, assignees: newAssigneeNames });
  };

  // Handle assignee search in filter panel
  const handleAssigneeSearch = useCallback((search: string) => {
    setFilterMemberSearch(search);
  }, []);

  // Toggle status column collapse/expand
  const toggleStatusCollapse = useCallback((statusId: string) => {
    setCollapsedStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(statusId)) {
        newSet.delete(statusId);
      } else {
        newSet.add(statusId);
      }
      return newSet;
    });
  }, []);

  // Count tasks per status across all stories
  const taskCountsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    boardStories.forEach((story) => {
      story.statuses.forEach((statusCol) => {
        counts.set(
          statusCol.status_id,
          (counts.get(statusCol.status_id) ?? 0) +
            (statusCol.task_count ?? statusCol.meta?.total ?? 0)
        );
      });
    });
    const storylessStatusColumns = getStorylessColumns(storylessStories);
    storylessStatusColumns.forEach((statusCol) => {
      counts.set(
        statusCol.status_id,
        (counts.get(statusCol.status_id) ?? 0) + (statusCol.task_count ?? 0)
      );
    });

    return counts;
  }, [boardStories, storylessStories]);

  const onDragStart = ({ active }: DragStartEvent) => {
    // First try to find in the global tasks ref (includes lazy-loaded tasks)
    const taskFromRef = allTasksRef.current.get(active.id as string);
    if (taskFromRef) {
      setActiveTask(taskFromRef);
      return;
    }

    // Fallback: search in processedStories
    for (const story of processedStories) {
      for (const tasks of story.tasksByStatus.values()) {
        const task = tasks.find((t) => t.id === active.id);
        if (task) {
          setActiveTask(task);
          return;
        }
      }
    }
  };

  const onDragOver = useCallback(({ over }: DragOverEvent) => {
    if (!over) {
      setOverCell(null);
      return;
    }

    const overData = over.data.current;
    const overId = over.id as string;

    // Check if over a cell (droppable area)
    if (overData?.type === 'cell') {
      setOverCell({ storyId: overData.storyId, statusId: overData.statusId });
    }
    // Check if over a card (get the parent cell info from the card's columnId)
    else if (overData?.type === 'card') {
      const task = overData.task as KanbanTask;
      if (task.parent && task.columnId) {
        setOverCell({ storyId: task.parent, statusId: task.columnId });
      }
    }
    // Fallback: parse from ID if it contains a dash
    else if (overId.includes('-')) {
      const [storyId, statusId] = overId.split('-');
      setOverCell({ storyId, statusId });
    } else {
      setOverCell(null);
    }
  }, []);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveTask(null);
      setOverCell(null);

      if (!over) return;

      if (!canEditTask) {
        toast.error("You don't have permission to modify tasks");
        return;
      }

      // Get the status ID and story ID from the droppable's data
      const overData = over.data.current;
      let targetStatusId: string | null = null;
      let targetStoryId: string | null = null;

      // Check if dropped on a cell
      if (overData?.type === 'cell') {
        targetStatusId = overData.statusId as string;
        targetStoryId = overData.storyId as string;
      }
      // Check if dropped on a card (use the card's status and story)
      else if (overData?.type === 'card') {
        const targetTask = overData.task as KanbanTask;
        targetStatusId = targetTask.columnId;
        targetStoryId = targetTask.parent ?? null;
      }

      if (!targetStatusId || !targetStoryId) return;
      const activeId = active.id as string;

      // Find the source story and task
      let sourceStory: (typeof processedStories)[0] | null = null;
      let sourceStatusId: string | null = null;
      let task: KanbanTask | null = null;

      // First try to find in the global tasks ref (includes lazy-loaded tasks)
      const taskFromRef = allTasksRef.current.get(activeId);
      if (taskFromRef) {
        task = taskFromRef;
        // Find the story containing this task
        for (const story of processedStories) {
          for (const [statusId, tasks] of story.tasksByStatus.entries()) {
            if (tasks.some((t) => t.id === activeId)) {
              sourceStory = story;
              sourceStatusId = statusId;
              break;
            }
          }
          if (sourceStory) break;
        }

        if (!sourceStory && taskFromRef.parent && taskFromRef.columnId) {
          sourceStatusId = taskFromRef.columnId;
          // Find the story by ID
          sourceStory = processedStories.find((s) => s.id === taskFromRef.parent) || null;
        }
      } else {
        // Fallback: search in processedStories
        for (const story of processedStories) {
          for (const [statusId, tasks] of story.tasksByStatus.entries()) {
            const foundTask = tasks.find((t) => t.id === activeId);

            if (foundTask) {
              sourceStory = story;
              sourceStatusId = statusId;
              task = foundTask;
              break;
            }
          }
          if (task) break;
        }
      }

      if (!task || !sourceStory || !sourceStatusId || !task.taskId) return;

      const movedTask: KanbanTask = task;
      const taskId: string = task.taskId;
      const projectId = task.projectId ?? selectedProject;
      const srcStoryId = sourceStory.id ?? '';
      const srcStatusId: string = sourceStatusId;
      const tgtStoryId: string = targetStoryId;
      const tgtStatusId: string = targetStatusId;

      const statusChanged = srcStatusId !== tgtStatusId;
      const storyChanged = srcStoryId !== tgtStoryId;

      if (!statusChanged && !storyChanged) return;
      // Build the update payload
      const updatePayload: {
        status_id: string;
        user_story_id?: string | null;
        sprint_id?: string | null;
      } = {
        status_id: tgtStatusId,
      };

      // If the user story / section changed, include it in the payload
      if (storyChanged) {
        if (isStorylessId(tgtStoryId)) {
          updatePayload.user_story_id = null;
          if (selectedSprint) {
            updatePayload.sprint_id = selectedSprint;
          }
        } else {
          updatePayload.user_story_id = tgtStoryId;
        }
      }

      // Optimistically update the UI — save task snapshot for moved-in cells
      setOptimisticUpdates((prev) => {
        const next = new Map(prev);
        next.set(movedTask.id, {
          statusId: tgtStatusId,
          storyId: storyChanged ? tgtStoryId : srcStoryId,
          task: movedTask,
        });
        return next;
      });

      const clearOptimistic = () =>
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(movedTask.id);
          return next;
        });

      const isSameTask = (t: TaskResponse) =>
        t.id === taskId || t.id === movedTask.id || t.key === movedTask.id;

      const reconcileCaches = () => {
        let rawTask: TaskResponse | undefined;
        const cachedBoards = queryClient.getQueriesData<BoardInfiniteData>({
          queryKey: ['board', projectId],
        });
        outer: for (const [, data] of cachedBoards) {
          for (const page of data?.pages ?? []) {
            for (const { col } of columnsOf(page.data)) {
              const found = col.tasks?.find(isSameTask);
              if (found) {
                rawTask = found;
                break outer;
              }
            }
          }
        }

        let pagedSourceHasTask = false;
        const cachedSourcePages = queryClient.getQueriesData<BoardInfiniteData>({
          queryKey: ['board-status-tasks', projectId, srcStoryId, srcStatusId],
        });
        for (const [, data] of cachedSourcePages) {
          for (const page of data?.pages ?? []) {
            for (const { col } of columnsOf(page.data)) {
              if (col.status_id === srcStatusId && col.tasks?.some(isSameTask)) {
                pagedSourceHasTask = true;
              }
            }
          }
        }

        const baseTask: TaskResponse = rawTask ?? {
          id: taskId,
          project_id: projectId,
          key: movedTask.id,
          title: movedTask.title,
          type: 'task',
          status: '',
          priority: movedTask.priority?.toLowerCase() as 'low' | 'medium' | 'high' | undefined,
          assignee_id: undefined,
          assignee_name:
            typeof movedTask.assignee === 'string' ? movedTask.assignee : movedTask.assignee?.name,
          assignee: movedTask.assigneeColor
            ? {
                color: movedTask.assigneeColor,
                name:
                  typeof movedTask.assignee === 'string'
                    ? movedTask.assignee
                    : (movedTask.assignee?.name ?? ''),
              }
            : undefined,
          estimated_hours: 0,
          reporter_id: undefined,
          reporter_name: undefined,
          story_points: movedTask.storyPoints ?? 0,
          due_date: movedTask.dueDate ? `${movedTask.dueDate}T00:00:00Z` : '',
          user_story_id: movedTask.user_story_id,
          sprint_id: undefined,
          created_at: '',
          updated_at: '',
        };

        const withNewPlace = (t: TaskResponse, col: BoardStatusColumn): TaskResponse => ({
          ...t,
          status_id: tgtStatusId,
          status: col.status_name ?? t.status,
          status_color: col.color ?? t.status_color,
          user_story_id: storyChanged
            ? (updatePayload.user_story_id ?? undefined)
            : t.user_story_id,
          sprint_id: updatePayload.sprint_id ?? t.sprint_id,
        });

        const buildPatch = (insertIfMissing: boolean, countAbsentSource: boolean): ColumnPatch => {
          let inserted = false;
          return (col, sId) => {
            if (sId === srcStoryId && col.status_id === srcStatusId) {
              const present = col.tasks.some(isSameTask);
              if (!present && !countAbsentSource) return col;
              return {
                ...col,
                tasks: present ? col.tasks.filter((t) => !isSameTask(t)) : col.tasks,
                task_count: Math.max((col.task_count || 0) - 1, 0),
              };
            }
            if (sId === tgtStoryId && col.status_id === tgtStatusId) {
              if (col.tasks.some(isSameTask)) {
                return {
                  ...col,
                  tasks: col.tasks.map((t) => (isSameTask(t) ? withNewPlace(t, col) : t)),
                };
              }
              if (!insertIfMissing || inserted) return col;
              inserted = true;
              return {
                ...col,
                tasks: [...col.tasks, withNewPlace(baseTask, col)],
                task_count: (col.task_count || 0) + 1,
              };
            }
            return col;
          };
        };

        queryClient.setQueriesData<BoardInfiniteData>({ queryKey: ['board', projectId] }, (old) => {
          if (!old?.pages) return old;
          const patch = buildPatch(true, pagedSourceHasTask);
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: patchPageData(page.data, patch),
            })),
          };
        });

        queryClient.setQueriesData<BoardInfiniteData>(
          {
            predicate: (query) => {
              const key = query.queryKey;
              return (
                Array.isArray(key) &&
                key[0] === 'board-status-tasks' &&
                key[1] === projectId &&
                ((key[2] === srcStoryId && key[3] === srcStatusId) ||
                  (key[2] === tgtStoryId && key[3] === tgtStatusId))
              );
            },
          },
          (old) => {
            if (!old?.pages) return old;
            const patch = buildPatch(true, false);
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: patchPageData(page.data, patch),
              })),
            };
          }
        );

        queryClient.setQueriesData<{
          data: TaskResponse[];
          [key: string]: unknown;
        }>({ queryKey: ['tasks', projectId] }, (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((item) =>
              isSameTask(item)
                ? {
                    ...item,
                    status_id: tgtStatusId,
                    user_story_id: storyChanged
                      ? (updatePayload.user_story_id ?? undefined)
                      : item.user_story_id,
                    sprint_id: updatePayload.sprint_id ?? item.sprint_id,
                  }
                : item
            ),
          };
        });
      };

      taskService
        .updateTask(projectId, taskId, updatePayload)
        .then(async () => {
          const snapshots: Array<[QueryKey, unknown]> = [
            ...queryClient.getQueriesData({ queryKey: ['board', projectId] }),
            ...queryClient.getQueriesData({ queryKey: ['board-status-tasks', projectId] }),
            ...queryClient.getQueriesData({ queryKey: ['tasks', projectId] }),
          ];

          try {
            reconcileCaches();
          } catch (cacheErr) {
            logger.log('Cache reconcile failed', cacheErr);
            snapshots.forEach(([key, data]) => queryClient.setQueryData(key, data));
            queryClient.invalidateQueries({ queryKey: ['board', projectId] });
            queryClient.invalidateQueries({ queryKey: ['board-status-tasks', projectId] });
          }

          await new Promise((resolve) => setTimeout(resolve, 0));
          clearOptimistic();
        })
        .catch((err: Error) => {
          logger.log('Failed to update task', err);
          clearOptimistic();
          toast.error('Failed to move task');
        });
    },
    [processedStories, selectedProject, selectedSprint, canEditTask, queryClient]
  );

  if (isProjectNotFound) {
    return <ProjectNotFound slug={projectSlug} />;
  }

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 flex-shrink-0 px-3 sm:px-0">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Kanban Board</h1>
          <p className="text-sm text-gray-500 dark:text-slate-100">
            Visualize and manage your team&apos;s tasks across workflow stages.
          </p>
          {storeProject && (
            <p className="text-xs text-gray-400 dark:text-slate-100 mt-0.5">
              {storeProject.name}
              {storeSprint ? ` · ${storeSprint.name}` : ' · All Sprints'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:mr-18">
          {/* Filter button */}
          <div ref={filterRef} className="relative">
            <WpButton
              variant={hasActiveFilter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilter((v) => !v)}
              leftIcon={<Filter size={15} />}
              className="dark:text-white dark:border-gray-600"
            >
              <span>Filter</span>
              {hasActiveFilter && (
                <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
                  {filters.priorities.length +
                    assigneeIdFilter.length +
                    filters.labels.length +
                    filters.types.length +
                    filters.statuses.length}
                </span>
              )}
            </WpButton>

            {showFilter && (
              <FilterPanel
                filters={filters}
                allAssignees={allAssignees}
                allLabels={allLabels}
                allTypes={allTypes}
                allStatuses={statuses}
                onChange={handleFilterChange}
                onClose={() => setShowFilter(false)}
                onAssigneeSearch={handleAssigneeSearch}
                isLoadingAssignees={isLoadingFilterMembers || isFetchingFilterMembers}
              />
            )}
          </div>

          {/* <WpButton variant="secondary" size="sm" leftIcon={<UserCircle2 size={15} />}>
            <span className="hidden xs:inline">Team</span>
          </WpButton> */}

          <AssigneeAvatars
            displayMembers={displayMembers ?? []}
            assigneeIdFilter={assigneeIdFilter}
            toggleAssigneeFilter={toggleAssigneeFilter}
            getInitials={getInitials}
          />
        </div>
      </div>

      {/* Board */}
      {!canViewBoard ? (
        <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/images/kanban method-pana.svg"
              alt="Access Restricted"
              width={360}
              height={360}
              className="h-90 w-90 opacity-60"
            />

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Restricted
            </h2>

            <p className="mt-3 max-w-md text-center text-gray-500 dark:text-gray-400">
              You do not have permission to view tasks on this board.
            </p>
          </div>
        </div>
      ) : boardLoading ? (
        <BoardSkeleton />
      ) : !hasTasks ? (
        <div className="flex flex-1 items-center justify-center px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/images/kanban method-pana.svg"
              alt="No Tasks"
              width={360}
              height={360}
              className="h-90 w-90"
            />

            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">No tasks found</h2>

            <p className="mt-3 max-w-md text-center text-gray-500 dark:text-slate-200">
              There are no tasks for this selection. Try a different project or sprint.
            </p>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={(args) =>
            pointerWithin(args).length ? pointerWithin(args) : closestCenter(args)
          }
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-auto -mx-3 sm:mx-0"
          >
            <div className="inline-block min-w-full px-3 sm:px-0">
              {/* Status Headers */}
              <div className="sticky top-0 z-20 bg-white dark:bg-gray-100 flex border-b-2 border-gray-300 dark:border-gray-700">
                <div className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-[200px] sm:w-[250px] flex-shrink-0 p-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-100">
                    User Stories
                  </span>
                </div>
                {statuses.map((status) => {
                  const isCollapsed = collapsedStatuses.has(status.id);
                  const taskCount = taskCountsByStatus.get(status.id) || 0;

                  return (
                    <StatusColumnHeader
                      key={status.id}
                      status={status}
                      taskCount={taskCount}
                      isCollapsed={isCollapsed}
                      toggleStatusCollapse={toggleStatusCollapse}
                    />
                  );
                })}
              </div>

              {/* User Story Rows */}
              {processedStories.map((story) => (
                <UserStoryRow
                  key={story.id}
                  story={story}
                  statuses={statuses}
                  overCell={overCell}
                  onUserStoryClick={handleUserStoryClick}
                  onTaskClick={handleTaskClick}
                  onRefetch={handleRefetch}
                  collapsedStatuses={collapsedStatuses}
                  hasMoreByStatus={story.hasMoreByStatus ?? new Map()}
                  projectId={selectedProject}
                  mapTask={mapToKanbanTask}
                  allTasksRef={allTasksRef}
                  optimisticUpdates={optimisticUpdates}
                  pageFilters={pageFilters}
                />
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask && <KanbanCardPreview task={activeTask} />}
          </DragOverlay>

          {/* Scroll Indicator */}
          <ScrollIndicator
            scrollContainerRef={scrollContainerRef}
            statuses={statuses}
            userStoriesCount={processedStories.length}
          />
        </DndContext>
      )}

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={handleCloseDrawer}
          onOpenUserStory={handleUserStoryClick}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
          }}
          onDelete={() => {
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
            handleRefetch();
            handleCloseDrawer();
          }}
        />
      )}

      {/* User Story Detail Drawer */}
      {selectedUserStory && (
        <UserStoryDetailDrawer
          userStory={selectedUserStory}
          onClose={handleCloseDrawer}
          onOpenTask={handleTaskClick}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
            queryClient.invalidateQueries({ queryKey: ['tasks', selectedProject] });
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
              queryClient.invalidateQueries({ queryKey: ['board', selectedProject] });
              handleCloseDrawer();
            } catch {
              return;
            }
          }}
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
          isLoadingMembers={isLoadingProjectMembers || isFetchingProjectMembers}
          onClose={() => {
            setShowAddTaskModal(false);
            setTaskUserStoryId('');
            setMemberSearch(''); // Clear search on close
          }}
          onCreate={() => {
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
          }}
        />
      )}
    </div>
  );
};
