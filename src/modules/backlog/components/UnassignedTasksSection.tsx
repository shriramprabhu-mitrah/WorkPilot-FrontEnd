import type { Dispatch, SetStateAction } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Inbox } from 'lucide-react';
import { TaskResponse } from '@/src/types/task';
import { BacklogPagination } from '@/src/app/components/common/pagination/backlogPagination';

import { AccessRestricted, EmptyState } from './BacklogStates';
import type { TasksSection } from '../hooks/useBacklogLists';
import UnassignedTasksHeader from './unassignedTaskHeader';
import UnassignedTasksSkeleton from './UnassignedTasksSkeleton';
import { BacklogRow } from './BacklogRow';

interface Props {
  projectId: string;
  section: TasksSection;
  tasks: TaskResponse[];
  open: boolean;
  onToggle: Dispatch<SetStateAction<boolean>>;
  canView: boolean;
  canCreate: boolean;
  activeDragType: 'task' | 'story' | null;
  onTaskClick: (task: TaskResponse) => void;
  setTaskUserStoryId: Dispatch<SetStateAction<string>>;
  setShowAddTaskModal: Dispatch<SetStateAction<boolean>>;
}

export const UnassignedTasksSection = ({
  projectId,
  section,
  tasks,
  open,
  onToggle,
  canView,
  canCreate,
  activeDragType,
  onTaskClick,
  setTaskUserStoryId,
  setShowAddTaskModal,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'tasks-unassigned',
    data: { type: 'unassigned-tasks' },
  });
  const dragOver = canView && isOver && activeDragType === 'task';
  const isLoading = (section.isLoading || section.isFetching) && !!projectId;

  return (
    <div
      ref={canView ? setNodeRef : undefined}
      data-tasks-drop="true"
      className={`rounded-xl border mb-3 transition-all duration-200 ${
        dragOver
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-xl ring-2 ring-blue-300 ring-opacity-50 scale-[1.01]'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      <UnassignedTasksHeader
        canViewTasks={canView}
        canCreateTask={canCreate}
        selectedProject={projectId}
        unassignedTasksOpen={open}
        setUnassignedTasksOpen={onToggle}
        isLoadingTasks={section.isLoading}
        filteredUnassignedTasks={tasks}
        tasksSearch={section.search}
        handleTasksSearchChange={section.onSearch}
        tasksFilters={section.filters}
        handleTasksFiltersChange={section.onFilters}
        taskStatusOptions={section.statusOptions}
        isLoadingCustomStatuses={section.isLoadingStatuses}
        setTaskUserStoryId={setTaskUserStoryId}
        setShowAddTaskModal={setShowAddTaskModal}
        tasksSortOrder={section.sortOrder}
        handleTasksSort={section.onSort}
      />

      {!canView ? (
        <AccessRestricted what="tasks" />
      ) : (
        <>
          {dragOver && (
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

          {open && (
            <div>
              {isLoading ? (
                <UnassignedTasksSkeleton />
              ) : tasks.length === 0 ? (
                <EmptyState
                  message={
                    !projectId ? 'Select a project to view tasks' : 'No unassigned tasks found'
                  }
                  actionLabel={projectId && canCreate ? 'Create Task' : undefined}
                  onAction={() => {
                    setTaskUserStoryId('');
                    setShowAddTaskModal(true);
                  }}
                />
              ) : (
                tasks.map((task) => (
                  <BacklogRow
                    key={task.id || task.key}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}

              {section.meta && (
                <BacklogPagination
                  currentPage={section.page}
                  totalPages={section.meta.total_pages}
                  pageSize={section.pageSize}
                  totalItems={section.meta.total_items}
                  onPageChange={section.onPage}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
