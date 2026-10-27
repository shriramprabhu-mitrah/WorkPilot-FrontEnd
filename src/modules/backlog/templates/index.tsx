'use client';

import { DndContext } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { ProjectNotFound } from '@/src/app/components/common/project-not-found';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useState } from 'react';
import { TaskResponse } from '@/src/types/task';
import { BacklogDragOverlayContent } from '../components/backlogDragOverlay';
import { useBacklogProject } from '../hooks/useBacklogProject';
import { useBacklogLists } from '../hooks/useBacklogLists';
import { useBacklogOptimistic } from '../hooks/useBacklogOptimistic';
import { useBacklogSelection } from '../hooks/useBacklogSelection';
import { useBacklogModals } from '../hooks/useBacklogModals';
import { useTaskDrop } from '../hooks/useTaskDrop';
import { useStoryDrop } from '../hooks/useStoryDrop';
import { useBacklogDnd } from '../hooks/useBacklogDnd';
import { useBacklogCollision } from '../hooks/useBacklogCollision';
import { mapTaskResponseToKanbanTask } from '../utils/backlogUtils';
import { UnassignedStoriesSection } from '../components/UnassignedStoriesSection';
import { UnassignedTasksSection } from '../components/UnassignedTasksSection';
import { SprintsPanel } from '../components/sprintsPanel';
import { BacklogDrawers } from '../components/BacklogDrawers';
import { BacklogModals } from '../components/BacklogModals';

export const BacklogTemplate = () => {
  const perms = usePermissions();
  const project = useBacklogProject();
  const { selectedProject } = project;

  const lists = useBacklogLists(selectedProject, perms);
  const opt = useBacklogOptimistic({
    projectId: selectedProject,
    stories: lists.stories,
    tasks: lists.tasks,
    userStoryStatuses: lists.userStoryStatuses,
  });
  const selection = useBacklogSelection({
    taskKey: project.taskKey,
    orgSlug: project.orgSlug,
    currentSlug: project.currentSlug,
    projectId: selectedProject,
    userStories: lists.stories.items,
    tasks: lists.tasks.items,
  });
  const modals = useBacklogModals(selectedProject);

  const onTaskDrop = useTaskDrop({
    tasksList: lists.tasks.items,
    userStories: lists.stories.items,
    sprints: lists.sprints.items,
    storyUpdates: opt.storyUpdates,
    setTaskUpdates: opt.setTaskUpdates,
    settleTask: opt.settleTask,
    setSelectedTask: selection.setSelectedTask,
    setSelectedUserStory: selection.setSelectedUserStory,
    canEditTask: perms.canEditTask,
    canEditSprint: perms.canEditSprint,
  });
  const onStoryDrop = useStoryDrop({
    userStories: lists.stories.items,
    sprints: lists.sprints.items,
    userStoryStatuses: lists.userStoryStatuses,
    storyUpdates: opt.storyUpdates,
    setStoryUpdates: opt.setStoryUpdates,
    settleStory: opt.settleStory,
    setSelectedUserStory: selection.setSelectedUserStory,
    canEditUserStory: perms.canEditUserStory,
    canEditSprint: perms.canEditSprint,
  });
  const dnd = useBacklogDnd({
    projectId: selectedProject,
    tasksList: lists.tasks.items,
    userStories: lists.stories.items,
    canEditTask: perms.canEditTask,
    canEditUserStory: perms.canEditUserStory,
    onTaskDrop,
    onStoryDrop,
  });
  const collisionDetection = useBacklogCollision(!!dnd.activeTask);

  const [storiesOpen, setStoriesOpen] = useState(true);
  const [tasksOpen, setTasksOpen] = useState(true);

  if (project.isProjectNotFound) return <ProjectNotFound slug={project.projectSlug} />;

  const openTask = (task: TaskResponse) =>
    selection.handleTaskClick(mapTaskResponseToKanbanTask(task));

  return (
    <DndContext
      sensors={dnd.sensors}
      onDragStart={dnd.handleDragStart}
      onDragEnd={dnd.handleDragEnd}
      collisionDetection={collisionDetection}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 flex-shrink-0">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
              Backlog
            </h1>
            {project.selectedApiProject && (
              <p className="text-sm mt-0.5 truncate text-gray-500 dark:text-slate-100">
                {project.selectedApiProject.name}
                {project.selectedSprintStore
                  ? ` · ${project.selectedSprintStore.name}`
                  : ' · All Sprints'}
              </p>
            )}
          </div>
          {perms.canCreateUserStory && selectedProject && (
            <WpButton
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => modals.setShowCreateStory(true)}
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">Create User Story</span>
              <span className="sm:hidden">Create</span>
            </WpButton>
          )}
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row gap-4">
          <div
            className="flex-none lg:flex-1 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1"
            style={{ minHeight: '400px' }}
          >
            <UnassignedStoriesSection
              projectId={selectedProject}
              section={lists.stories}
              stories={opt.unassignedStories}
              tasks={opt.optimisticTasks}
              open={storiesOpen}
              onToggle={setStoriesOpen}
              canView={perms.canViewUserStories}
              canCreate={perms.canCreateUserStory}
              activeDragType={dnd.activeDragType}
              onStoryClick={selection.handleUserStoryClick}
              onCreate={() => modals.setShowCreateStory(true)}
            />
            <UnassignedTasksSection
              projectId={selectedProject}
              section={lists.tasks}
              tasks={opt.unassignedTasks}
              open={tasksOpen}
              onToggle={setTasksOpen}
              canView={perms.canViewTasks}
              canCreate={perms.canCreateTask}
              activeDragType={dnd.activeDragType}
              onTaskClick={openTask}
              setTaskUserStoryId={modals.setTaskUserStoryId}
              setShowAddTaskModal={modals.setShowAddTask}
            />
          </div>

          {perms.canViewSprints && (
            <SprintsPanel
              projectId={selectedProject}
              sprints={lists.sprints}
              canCreate={perms.canCreateSprint}
              activeDragType={dnd.activeDragType}
              completingSprintId={
                modals.isCompletingSprint ? (modals.completeTarget?.id ?? null) : null
              }
              onNewSprint={() => modals.setShowAddSprint(true)}
              onStoryClick={selection.handleUserStoryClick}
              onTaskClick={openTask}
              onStartSprint={modals.setStartTarget}
              onCompleteSprint={modals.setCompleteTarget}
            />
          )}
        </div>
      </div>

      <BacklogDragOverlayContent activeTask={dnd.activeTask} activeStory={dnd.activeStory} />

      <BacklogModals
        projectId={selectedProject}
        selectedSprint={project.selectedSprint}
        userStories={lists.stories.items}
        modals={modals}
        canCreateTask={perms.canCreateTask}
        canCreateUserStory={perms.canCreateUserStory}
        canCreateSprint={perms.canCreateSprint}
        canEditSprint={perms.canEditSprint}
      />
      <BacklogDrawers
        projectId={selectedProject}
        selection={selection}
        onCreateTask={modals.openAddTask}
      />
    </DndContext>
  );
};
