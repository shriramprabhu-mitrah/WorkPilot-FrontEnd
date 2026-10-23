import type { Dispatch, SetStateAction } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { UserStoryResponse } from '@/src/types/userstories';
import { TaskResponse } from '@/src/types/task';
import { BacklogPagination } from '@/src/app/components/common/pagination/backlogPagination';
import { AccessRestricted, EmptyState } from './BacklogStates';
import type { StoriesSection } from '../hooks/useBacklogLists';
import UnassignedUserStoriesHeader from './unassignedUserStories';
import { DraggableUserStory } from './DraggableUserStory';
import UnassignedUserStoriesSkeleton from './UnassignedUserStoriesSkeleton';

interface Props {
  projectId: string;
  section: StoriesSection;
  stories: UserStoryResponse[];
  tasks: TaskResponse[];
  open: boolean;
  onToggle: Dispatch<SetStateAction<boolean>>;
  canView: boolean;
  canCreate: boolean;
  activeDragType: 'task' | 'story' | null;
  onStoryClick: (story: UserStoryResponse) => void;
  onCreate: () => void;
}

export const UnassignedStoriesSection = ({
  projectId,
  section,
  stories,
  tasks,
  open,
  onToggle,
  canView,
  canCreate,
  activeDragType,
  onStoryClick,
  onCreate,
}: Props) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog-unassigned',
    data: { sprintId: null },
  });
  const isLoading = (section.isLoading || section.isFetching) && !!projectId;
  const highlight = canView && isOver;

  return (
    <div
      ref={canView ? setNodeRef : undefined}
      data-backlog-drop="true"
      className={`rounded-xl border mb-3 transition-all duration-200 ${open ? 'min-h-[200px]' : ''} ${
        highlight
          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 shadow-xl ring-2 ring-green-300 ring-opacity-50 scale-[1.01]'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      <UnassignedUserStoriesHeader
        canViewUserStories={canView}
        isOverBacklog={isOver}
        unassignedUserStoriesOpen={open}
        setUnassignedUserStoriesOpen={onToggle}
        isLoadingUserStories={section.isLoading}
        selectedProject={projectId}
        unassignedStories={stories}
        userStoriesSearch={section.search}
        handleUserStoriesSearchChange={section.onSearch}
        userStoriesFilters={section.filters}
        handleUserStoriesFiltersChange={section.onFilters}
        userStoryStatusOptions={section.statusOptions}
        isLoadingUserStoryStatuses={section.isLoadingStatuses}
        userStoriesSortOrder={section.sortOrder}
        handleUserStoriesSort={section.onSort}
      />

      {open &&
        (!canView ? (
          <AccessRestricted what="user stories" />
        ) : isLoading ? (
          <UnassignedUserStoriesSkeleton />
        ) : (
          <>
            {isOver && (
              <div className="px-3 sm:px-4 pt-2 pb-1">
                <div className="border-2 border-dashed border-green-400 rounded-lg p-4 text-center bg-white bg-opacity-60 backdrop-blur-sm animate-pulse">
                  <p className="text-sm text-green-700 font-semibold">
                    {activeDragType === 'task'
                      ? 'Drop task here to unassign from sprint'
                      : 'Drop here to remove from sprint'}
                  </p>
                </div>
              </div>
            )}

            {stories.length === 0 && !isOver ? (
              <EmptyState
                className="py-12"
                message={
                  !projectId ? 'Select a project to view stories' : 'No unassigned user stories'
                }
                actionLabel={projectId && canCreate ? 'Create User story' : undefined}
                onAction={onCreate}
              />
            ) : (
              stories.map((story) => (
                <DraggableUserStory
                  key={story.id}
                  story={story}
                  projectId={projectId}
                  tasks={tasks}
                  onStoryClick={onStoryClick}
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
          </>
        ))}
    </div>
  );
};
