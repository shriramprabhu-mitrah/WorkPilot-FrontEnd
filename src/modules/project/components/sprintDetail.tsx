'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2, Hash } from 'lucide-react';

import { WpButton } from '@/src/app/components/common/button';
import { useGetSprintById, useDeleteSprint } from '@/src/modules/project/hooks/useSprint';
import SprintDetailSkeleton from './sprintDetailSkeleton';
import AddTaskModal, { Task } from './addTaskModel';
import EditSprintModal from './editSprintModal';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useDeleteTask } from '@/src/modules/tasks/hooks/useTask';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { ColumnId, KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';
import { statusOptions } from '../data/project';
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
  const { hasPermission } = usePermissions();
  const { sprint, isLoadingSprint, isError, refetch } = useGetSprintById(projectId, sprintId);
  const { deleteSprintAsync, isDeletingSprint } = useDeleteSprint(projectId);
  const { userStories: tasksList, isLoadingUserStories: isLoadingTasks, isFetchingUserStories: isFetchingTasks } = useGetUserStories(projectId, {
    sprint_id: sprintId,
  });

  const { deleteTaskAsync, isDeletingTask } = useDeleteTask(projectId);
  const deleteUserStoryMutation = useDeleteUserStory();
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const { members, isLoadingMembers, isFetchingMembers } = useGetProjectMembers(
    projectId,
    {
      page: 1,
      page_size: 10,
      name: debouncedMemberSearch,
    },
    true
  );
  const assigneeOptions =
    members?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  const STATUS_LABELS = Object.fromEntries(
    statusOptions.map((option) => [option.value, option.label])
  );
  const mapTaskToDrawerTask = (task: UserStoryResponse | TaskResponse): KanbanTask => ({
    id: 'key' in task && task.key ? task.key : '',
    taskId: task.id ?? '',
    projectId: task.project_id ?? '',
    title: task.title ?? '',
    columnId: (task.status ?? 'todo') as ColumnId,
    description: task.description ?? '',
    priority: task.priority
      ? ((task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
      : 'Medium',
    labels: [],
    dueDate: 'due_date' in task ? task.due_date ?? '' : '',
    startDate: 'start_date' in task ? task.start_date ?? '' : '',
    storyPoints: task.story_points ?? 0,
    sprint: '',
    parent: '',
    subtasks: [],
    assigneeInitials: '',
    assigneeColor: '',
    reporter: '',
    reporterInitials: '',
    reporterColor: undefined,
    activity: [],
  });

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';

  const handleCreateTask = async (_newTask: Task) => {
    setShowAddTaskModal(false);
  };
  
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
        await deleteUserStoryMutation.mutateAsync({
          projectId: projectId,
          userStoryId: userStoryId,
        });
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
        return {
          backgroundColor: colors.priorityCriticalBg,
          color: colors.priorityCriticalText,
        };
      case 'high':
        return {
          backgroundColor: colors.priorityHighBg,
          color: colors.priorityHighText,
        };
      case 'medium':
        return {
          backgroundColor: colors.priorityMediumBg,
          color: colors.priorityMediumText,
        };
      case 'low':
        return {
          backgroundColor: colors.priorityLowBg,
          color: colors.priorityLowText,
        };
      default:
        return {
          backgroundColor: colors.gray100,
          color: colors.gray500,
        };
    }
  };

  // Status UI helper
  const getStatusStyle = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed':
        return {
          backgroundColor: colors.colDoneBg,
          color: colors.colDone,
        };
      case 'in_progress':
      case 'in progress':
        return {
          backgroundColor: colors.colInProgressBg,
          color: colors.colInProgress,
        };
      case 'in_review':
      case 'in review':
        return {
          backgroundColor: colors.colInReviewBg,
          color: colors.colInReview,
        };
      case 'testing':
        return {
          backgroundColor: colors.priorityMediumBg,
          color: colors.priorityMediumText,
        };
      case 'blocked':
        return {
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
        };
      case 'todo':
      case 'to do':
      default:
        return {
          backgroundColor: colors.colTodoBg,
          color: colors.colTodo,
        };
    }
  };

  if (isLoadingSprint || isLoadingTasks) {
    return <SprintDetailSkeleton />;
  }

  if (!sprint || isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">Sprint not found.</p>

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
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push('/projects')}
          className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-gray-500 hover:text-gray-700 hover:underline"
        >
          Projects
        </button>
        <span className="text-gray-400">/</span>

        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700"
        >
          Sprints
        </button>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-900">{sprint.name}</span>
      </div>
      <WpButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        leftIcon={<ArrowLeft size={16} />}
        className="text-gray-500"
      >
        Sprints
      </WpButton>
      <div className="relative rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{sprint.name}</h1>

            <p className="mt-2 text-sm text-gray-500">
              {formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
              {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
            </span>

            {hasPermission('SPRINT_EDIT') && (
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

            {hasPermission('SPRINT_DELETE') && (
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteSprintConfirm(true)}
                className="!p-2 text-red-600 hover:bg-red-50"
                aria-label="Delete sprint"
              >
                <Trash2 size={15} />
              </WpButton>
            )}
          </div>
        </div>

        <div className="my-5 border-t" />
        <div className="grid grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-gray-400">START DATE</p>
            <p className="mt-2 text-sm">{formatDate(sprint.start_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">END DATE</p>
            <p className="mt-2 text-sm">{formatDate(sprint.end_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">GOAL</p>
            <p className="mt-2 text-sm">{sprint.goal || '-'}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Stories</h2>
        <div className="flex items-center gap-2">
          {selectedUserStoryIds.length > 0 && (
            <WpButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setShowDeleteUserStoryConfirm(true)}
              disabled={deleteUserStoryMutation.isPending}
              className="text-red-600 hover:bg-red-50"
              leftIcon={<Trash2 size={16} />}
            >
              {deleteUserStoryMutation.isPending ? 'Deleting...' : 'Delete'}
            </WpButton>
          )}

          {/* <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={() => setShowAddTaskModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Task
          </WpButton> */}
        </div>
      </div>

      {isFetchingTasks ? (
        <div className="flex min-h-[215px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">Loading updated user stories...</p>
          </div>
        </div>
      ) : !(tasksList || []).length ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16">
          <div className="flex flex-col items-center justify-center">
            <img src="/images/Time management-rafiki.png" alt="No Tasks" className="h-72 w-72" />

            <p className="text-sm font-medium text-gray-400">
              No user stories have been assigned to this sprint.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Go to backlog to assign user stories to this sprint.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <input
              type="checkbox"
              checked={allUserStoriesSelected}
              onChange={handleSelectAll}
              className="h-4 w-4 cursor-pointer rounded border-gray-300"
            />
            <span className="text-xs text-gray-500">Select all</span>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: colors.gray500, backgroundColor: colors.gray100 }}
            >
              {(tasksList || []).length} {(tasksList || []).length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          {(tasksList || []).map((story) => {
            const userStoryId = story.id ?? '';
            const priorityStyle = getPriorityStyle(story.priority);
            const statusStyle = getStatusStyle(story.status);

            return (
              <div
                key={userStoryId}
                className={`
                  flex items-center gap-3
                  px-4 py-2.5
                  border-b last:border-0
                  hover:bg-gray-50
                  transition-all duration-200
                  ${
                    selectedUserStoryIds.includes(userStoryId)
                      ? 'bg-blue-50/30 border-l-4 border-l-blue-400'
                      : ''
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedUserStoryIds.includes(userStoryId)}
                  onChange={() => handleUserStorySelection(userStoryId)}
                  onClick={(event) => event.stopPropagation()}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300"
                />

                {/* Story title */}
                <div
                  onClick={() => setSelectedUserStory(story)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <span className="text-sm truncate block" style={{ color: colors.gray800 }}>
                    {story.title}
                  </span>
                  {story.description && (
                    <p className="mt-0.5 text-xs text-gray-400 truncate">{story.description}</p>
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
                  className="flex items-center gap-0.5 text-xs w-10 shrink-0"
                  style={{ color: colors.gray400 }}
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
                queryKey: ['user-story', projectId, taskUserStoryId] 
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
          onCreateTask={() => {
            setTaskUserStoryId(selectedUserStory.id);
            setShowAddTaskModal(true);
          }}
          onDelete={async () => {
            try {
              await deleteUserStoryMutation.mutateAsync({
                projectId: projectId,
                userStoryId: selectedUserStory.id,
              });
              queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
              setSelectedUserStory(null);
            } catch (error) {
              // Error is already handled by the mutation
            }
          }}
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

      {showDeleteUserStoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete User Stories</h3>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{' '}
              {selectedUserStoryIds.length === 1 ? 'this user story' : `${selectedUserStoryIds.length} user stories`}?
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

      {showDeleteSprintConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Sprint</h3>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-800">{sprint.name}</span>?
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
