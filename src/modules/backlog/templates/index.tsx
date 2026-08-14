'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
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
import { useGetUserStories, useUpdateUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import { useGetSprints } from '@/src/modules/project/hooks/useSprint';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import AddSprintModal from '@/src/modules/project/components/addSprint';
import { useAppSelector } from '@/src/store';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { KanbanTask } from '@/src/types/board';
import { ProjectDetailMember } from '@/src/types/project';
import { UserStoryResponse } from '@/src/types/userstories';
import CreateUserStoryModal from '../components/createUserStoryModal';
import { SprintDropZone } from '../components/SprintDropZone';
import { DraggableUserStory } from '../components/DraggableUserStory';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/src/hooks/usePermissions';

export const BacklogTemplate = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showAddSprintModal, setShowAddSprintModal] = useState(false);
  const [activeStory, setActiveStory] = useState<UserStoryResponse | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<string, { sprintId: string | null; timestamp: number }>
  >(new Map());

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const selectedSprintStore = useAppSelector((state) => state.project.selectedSprint);
  const selectedProject = selectedApiProject?.id ?? '';
  const selectedSprint = selectedSprintStore?.id ?? '';

  // Ref to store pending API calls
  const pendingUpdatesRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Configure sensors for drag and drop with better touch support
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

  const assigneeOptions =
    selectedApiProject?.members?.map((member: ProjectDetailMember) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  const { userStories, isLoadingUserStories } = useGetUserStories(
    selectedProject,
    {},
    !!selectedProject
  );

  const { sprints, isLoadingSprints, refetchSprints } = useGetSprints(
    selectedProject,
    !!selectedProject
  );

  const updateUserStoryMutation = useUpdateUserStory();

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const storyId = event.active.data.current?.storyId;
      const story = userStories.find((s) => s.id === storyId);
      if (story) {
        setActiveStory(story);
      }
    },
    [userStories]
  );

  // Debounced API update function
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
    // Optional: Add any drag over logic here if needed
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveStory(null);

      if (!over) return;

      const storyId = active.data.current?.storyId;
      const targetSprintId = over.data.current?.sprintId;

      if (!storyId || !selectedProject) return;

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
    },
    [selectedProject, userStories, optimisticUpdates, scheduleUpdate]
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

  // Custom collision detection - prioritize pointer position and handle nested droppables
  const collisionDetectionStrategy = useCallback((args: Parameters<typeof pointerWithin>[0]) => {
    const { droppableContainers, pointerCoordinates, active } = args;

    if (!pointerCoordinates || !active) {
      return closestCorners(args);
    }

    // Get all potential collisions using pointer detection
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // When dragging from a sprint, check if we're over the backlog
      const isFromSprint = active.data.current?.storyId;
      const backlogCollision = pointerCollisions.find(({ id }) => id === 'backlog-unassigned');

      // If we're over the backlog droppable, return only that
      // This ensures backlog takes priority when cursor is over it
      if (backlogCollision && isFromSprint) {
        return [backlogCollision];
      }

      // Otherwise return all pointer collisions (for sprint-to-sprint moves)
      return pointerCollisions;
    }

    // Fallback to closest corners if no pointer collisions
    return closestCorners(args);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={collisionDetectionStrategy}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.gray900 }}>
              Backlog
            </h1>
            {selectedApiProject && (
              <p className="text-sm mt-0.5 truncate" style={{ color: colors.gray500 }}>
                {selectedApiProject.name}
                {selectedSprintStore ? ` · ${selectedSprintStore.name}` : ' · All Sprints'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <WpButton
              size="sm"
              leftIcon={<Plus size={14} />}
              disabled={!selectedProject}
              onClick={() => setShowCreateStoryModal(true)}
            >
              <span className="hidden sm:inline">Create User Story</span>
              <span className="sm:hidden">Create</span>
            </WpButton>
            <WpInput
              type="text"
              placeholder="Search tasks..."
              icon={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              wrapperClassName="w-full sm:w-40"
              className="!py-1.5"
            />
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
                  className={`rounded-xl border bg-white overflow-hidden mb-3 transition-all duration-200 ${
                    isOverBacklog
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-xl ring-2 ring-green-300 ring-opacity-50 scale-[1.01]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div ref={setBacklogNodeRef} className="min-h-[400px] w-full">
                    <div
                      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b transition-all ${
                        isOverBacklog ? 'border-green-200 bg-green-100' : 'border-gray-100'
                      }`}
                    >
                      <span
                        className={`font-semibold text-sm transition-colors ${isOverBacklog ? 'text-green-700' : 'text-gray-900'}`}
                      >
                        User Stories
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 transition-all ${
                          isOverBacklog
                            ? 'bg-green-200 text-green-800 scale-110'
                            : 'bg-gray-100 text-gray-500'
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
                              Drop here to remove from sprint
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                        <p className="text-sm text-gray-500 text-center">
                          {!selectedProject
                            ? 'Select a project to view stories'
                            : 'No unassigned user stories'}
                        </p>
                        {selectedProject && (
                          <p className="text-xs text-gray-400 mt-1 text-center">
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
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Backlog Tasks Section */}
                {/* <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-3">
                  <div
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                    onClick={() => setBacklogOpen((v) => !v)}
                  >
                    <span className="text-gray-400 shrink-0">
                      {backlogOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="font-semibold text-sm" style={{ color: colors.gray900 }}>
                      Backlog
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                      style={{ color: colors.gray500, backgroundColor: colors.gray100 }}
                    >
                      {filteredBacklog.length} issues
                    </span>
                  </div>

                  {backlogOpen && (
                    <div>
                      {filteredBacklog.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Image
                            src="/images/Multitasking-rafiki.svg"
                            alt="No Tasks"
                            width={300}
                            height={200}
                            className="h-90 w-90"
                          />
                          <h2 className="mt-4 text-lg font-bold text-gray-900">
                            {!selectedProject ? 'Please select a project' : 'No backlogs found'}
                          </h2>
                          <p className="mt-1 text-sm text-gray-500">
                            {!selectedProject
                              ? 'Select a project to view its backlogs.'
                              : 'Create your first backlog task and track progress.'}
                          </p>
                        </div>
                      ) : (
                        filteredBacklog.map((task: TaskResponse) => (
                          <BacklogRow
                            key={task.id}
                            task={task}
                            onClick={() => setSelectedTask(mapTaskToDrawerTask(task))}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div> */}
              </>
            )}
          </div>

          {/* Right Section: Sprint Drop Zones */}
          <div className="w-full lg:w-96 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm" style={{ color: colors.gray900 }}>
                  Sprints
                </h2>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ color: colors.gray500, backgroundColor: colors.gray100 }}
                >
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
              <div className="text-sm text-gray-500 text-center py-4">Loading sprints...</div>
            ) : allSprints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-gray-500 text-center">
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
                />
              ))
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeStory ? (
          <div className="bg-white rounded-lg shadow-2xl p-3 border-2 border-blue-500 max-w-md transform rotate-3 scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{activeStory.title}</p>
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
          sprintId={selectedSprint}
          assigneeOptions={assigneeOptions}
          onClose={() => setShowAddTaskModal(false)}
          onCreate={() => setShowAddTaskModal(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
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
