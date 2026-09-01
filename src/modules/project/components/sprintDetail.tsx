'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Trash2, Hash } from 'lucide-react';

import { WpButton } from '@/src/app/components/common/button';
import { useGetSprintById, useDeleteSprint } from '@/src/modules/project/hooks/useSprint';
import SprintDetailSkeleton from './sprintDetailSkeleton';
import AddTaskModal from './addTaskModel';
import EditSprintModal from './editSprintModal';
import { usePermissions } from '@/src/hooks/usePermissions';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { KanbanTask } from '@/src/types/board';
import { UserStoryResponse } from '@/src/types/userstories';
import { useGetProjectMembers } from '../hooks/useProject';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useGetUserStories, useDeleteUserStory } from '../../tasks/hooks/useUserStory';
import { colors } from '@/src/styles/colors';
import { UserStoryDetailDrawer } from '@/src/app/components/common/user-story-detail';
import { useQueryClient } from '@tanstack/react-query';

const SprintDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sprintId = searchParams.get('sprintId') ?? '';
  const projectId = searchParams.get('projectId') ?? '';
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteSprintConfirm, setShowDeleteSprintConfirm] = useState(false);
  const [showDeleteUserStoryConfirm, setShowDeleteUserStoryConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [selectedUserStory, setSelectedUserStory] = useState<UserStoryResponse | null>(null);
  const [selectedUserStoryIds, setSelectedUserStoryIds] = useState<string[]>([]);
  const [taskUserStoryId, setTaskUserStoryId] = useState<string>('');
  const { canEditSprint, canDeleteSprint, canViewUserStories, canDeleteUserStory, canCreateTask } =
    usePermissions();
  const { sprint, isLoadingSprint, isError, refetch } = useGetSprintById(projectId, sprintId);
  const { deleteSprintAsync, isDeletingSprint } = useDeleteSprint(projectId);
  const {
    userStories: tasksList,
    isLoadingUserStories: isLoadingTasks,
    isFetchingUserStories: isFetchingTasks,
  } = useGetUserStories(projectId, { sprint_id: sprintId }, !!projectId && canViewUserStories);

  const deleteUserStoryMutation = useDeleteUserStory();
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    projectId,
    { page: 1, page_size: 10, name: debouncedMemberSearch },
    true
  );
  const assigneeOptions =
    members?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';

  const handleUserStorySelection = (userStoryId: string) => {
    setSelectedUserStoryIds((prev) =>
      prev.includes(userStoryId) ? prev.filter((id) => id !== userStoryId) : [...prev, userStoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserStoryIds.length === (tasksList || []).length) {
      setSelectedUserStoryIds([]);
      return;
    }
    setSelectedUserStoryIds(
      (tasksList || []).map((task) => task.id).filter((id): id is string => Boolean(id))
    );
  };

  const handleDeleteUserStories = async () => {
    if (selectedUserStoryIds.length === 0) return;
    try {
      for (const userStoryId of selectedUserStoryIds) {
        await deleteUserStoryMutation.mutateAsync({ projectId, userStoryId });
      }
      queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
      setSelectedUserStoryIds([]);
      setShowDeleteUserStoryConfirm(false);
    } catch (error) {}
  };

  const handleSprintSuccess = async () => {
    await refetch();
  };

  // Priority UI helper
  const getPriorityStyle = (priority?: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return { backgroundColor: colors.priorityCriticalBg, color: colors.priorityCriticalText };
      case 'high':
        return { backgroundColor: colors.priorityHighBg, color: colors.priorityHighText };
      case 'medium':
        return { backgroundColor: colors.priorityMediumBg, color: colors.priorityMediumText };
      case 'low':
        return { backgroundColor: colors.priorityLowBg, color: colors.priorityLowText };
      default:
        return { backgroundColor: colors.gray100, color: colors.gray500 };
    }
  };

  // Status UI helper
  const getStatusStyle = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return { backgroundColor: colors.colDoneBg, color: colors.colDone };
      case 'in_progress':
      case 'in progress':
        return { backgroundColor: colors.colInProgressBg, color: colors.colInProgress };
      case 'in_review':
      case 'in review':
        return { backgroundColor: colors.colInReviewBg, color: colors.colInReview };
      case 'testing':
        return { backgroundColor: colors.priorityMediumBg, color: colors.priorityMediumText };
      case 'blocked':
        return { backgroundColor: '#FEE2E2', color: '#DC2626' };
      case 'todo':
      case 'to do':
      default:
        return { backgroundColor: colors.colTodoBg, color: colors.colTodo };
    }
  };

  if (isLoadingSprint || isLoadingTasks) {
    return <SprintDetailSkeleton />;
  }

  if (!sprint || isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">Sprint not found.</p>
          <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </WpButton>
        </div>
      </div>
    );
  }

  const allUserStoriesSelected =
    (tasksList || []).length > 0 && selectedUserStoryIds.length === (tasksList || []).length;

  return (
    <div className="space-y-6">
      {/* Sprint info card */}
      <div className="relative rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">{sprint.name}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs text-blue-600 dark:text-blue-400">
              {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
            </span>

            {canEditSprint && (
              <WpButton
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="!p-2"
                aria-label="Edit sprint"
              >
                <Pencil size={15} />
              </WpButton>
            )}

            {canDeleteSprint && (
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteSprintConfirm(true)}
                className="!p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete sprint"
              >
                <Trash2 size={15} />
              </WpButton>
            )}
          </div>
        </div>

        <div className="my-5 border-t border-gray-100 dark:border-slate-700" />

        <div className="grid grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">START DATE</p>
            <p className="mt-2 text-sm text-gray-900 dark:text-slate-100">
              {formatDate(sprint.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">END DATE</p>
            <p className="mt-2 text-sm text-gray-900 dark:text-slate-100">
              {formatDate(sprint.end_date)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-slate-500">GOAL</p>
            <p className="mt-2 text-sm text-gray-900 dark:text-slate-100">{sprint.goal || '-'}</p>
          </div>
        </div>
      </div>

      {/* User Stories section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">User Stories</h2>
        <div className="flex items-center gap-2">
          {canDeleteUserStory && selectedUserStoryIds.length > 0 && (
            <WpButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setShowDeleteUserStoryConfirm(true)}
              disabled={deleteUserStoryMutation.isPending}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              leftIcon={<Trash2 size={16} />}
            >
              {deleteUserStoryMutation.isPending ? 'Deleting...' : 'Delete'}
            </WpButton>
          )}
        </div>
      </div>

      {/* User Stories list */}
      {!canViewUserStories ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kanban method-pana.svg"
            alt="Access Restricted"
            className="h-32 w-32 opacity-60 mb-2"
          />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Access Restricted
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            You do not have permission to view user stories.
          </p>
        </div>
      ) : isFetchingTasks ? (
        <div className="flex min-h-[215px] items-center justify-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-slate-700 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
              Loading updated user stories...
            </p>
          </div>
        </div>
      ) : !(tasksList || []).length ? (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-16">
          <div className="flex flex-col items-center justify-center">
            <img src="/images/Time management-rafiki.png" alt="No Tasks" className="h-72 w-72" />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
              No user stories have been assigned to this sprint.
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
              Go to backlog to assign user stories to this sprint.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            {canDeleteUserStory && (
              <input
                type="checkbox"
                checked={allUserStoriesSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 dark:border-slate-600"
              />
            )}
            {canDeleteUserStory && (
              <span className="text-xs text-gray-500 dark:text-slate-400">Select all</span>
            )}
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300">
              {(tasksList || []).length} {(tasksList || []).length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {/* Story rows */}
          {(tasksList || []).map((story) => {
            const userStoryId = story.id ?? '';
            const priorityStyle = getPriorityStyle(story.priority);
            const statusStyle = getStatusStyle(story.status);
            const isSelected = selectedUserStoryIds.includes(userStoryId);

            return (
              <div
                key={userStoryId}
                className={`
                  flex items-center gap-3 px-4 py-2.5 border-b last:border-0
                  hover:bg-gray-50 dark:hover:bg-slate-800/60
                  transition-all duration-200
                  ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/20 border-l-4 border-l-blue-400' : ''}
                `}
              >
                {canDeleteUserStory && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleUserStorySelection(userStoryId)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 dark:border-slate-600"
                  />
                )}

                {/* Story title */}
                <div
                  onClick={() => setSelectedUserStory(story)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <span className="text-sm truncate block text-gray-800 dark:text-slate-100">
                    {story.title}
                  </span>
                  {story.description && (
                    <div
                      className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 line-clamp-2 [&_p]:mb-1 [&_ol]:mb-1 [&_ul]:mb-1 [&_li]:mb-0.5"
                      dangerouslySetInnerHTML={{ __html: story.description }}
                    />
                  )}
                </div>

                {/* Priority */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium w-16 text-center"
                  style={priorityStyle}
                >
                  {story.priority ?? 'medium'}
                </span>

                {/* Story points */}
                <span
                  className="flex items-center gap-0.5 text-xs w-10 shrink-0 text-gray-400 dark:text-slate-500"
                  title="Story points"
                >
                  <Hash size={11} />
                  {story.story_points ?? 0}
                </span>

                {/* Status */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0 font-medium w-20 text-center"
                  style={statusStyle}
                >
                  {story.status ?? 'todo'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showAddTaskModal && (
        <AddTaskModal
          projectId={projectId}
          sprintId={sprintId}
          userStoryId={taskUserStoryId || undefined}
          assigneeOptions={assigneeOptions}
          memberSearch={memberSearch}
          onMemberSearchChange={setMemberSearch}
          isLoadingMembers={isLoadingMembers || isFetchingMembers}
          onClose={() => {
            setShowAddTaskModal(false);
            setTaskUserStoryId('');
            setMemberSearch('');
          }}
          onCreate={() => {
            setShowAddTaskModal(false);
            queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
            if (taskUserStoryId) {
              queryClient.invalidateQueries({
                queryKey: ['user-story', projectId, taskUserStoryId],
              });
            }
            setTaskUserStoryId('');
            setMemberSearch('');
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
            queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
          }}
          onCreateTask={
            canCreateTask
              ? () => {
                  setTaskUserStoryId(selectedUserStory.id);
                  setShowAddTaskModal(true);
                }
              : undefined
          }
          onDelete={
            canDeleteUserStory
              ? async () => {
                  try {
                    await deleteUserStoryMutation.mutateAsync({
                      projectId,
                      userStoryId: selectedUserStory.id,
                    });
                    queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
                    setSelectedUserStory(null);
                  } catch (error) {}
                }
              : undefined
          }
        />
      )}

      {showEditModal && (
        <EditSprintModal
          projectId={projectId}
          sprint={sprint}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSprintSuccess}
        />
      )}

      {/* Delete user stories confirm modal */}
      {showDeleteUserStoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-transparent dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Delete User Stories
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Are you sure you want to delete{' '}
              {selectedUserStoryIds.length === 1
                ? 'this user story'
                : `${selectedUserStoryIds.length} user stories`}
              ?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteUserStoryConfirm(false)}
                disabled={deleteUserStoryMutation.isPending}
              >
                Cancel
              </WpButton>
              <WpButton
                variant="primary"
                size="sm"
                onClick={handleDeleteUserStories}
                disabled={deleteUserStoryMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteUserStoryMutation.isPending ? 'Deleting...' : 'Delete'}
              </WpButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete sprint confirm modal */}
      {showDeleteSprintConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-transparent dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Delete Sprint</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-800 dark:text-slate-200">{sprint.name}</span>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteSprintConfirm(false)}
                disabled={isDeletingSprint}
              >
                Cancel
              </WpButton>
              <WpButton
                variant="primary"
                size="sm"
                disabled={isDeletingSprint}
                onClick={async () => {
                  try {
                    await deleteSprintAsync(sprintId);
                    router.back();
                  } catch {
                    setShowDeleteSprintConfirm(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingSprint ? 'Deleting...' : 'Delete'}
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetail;
