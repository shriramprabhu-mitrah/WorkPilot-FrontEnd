'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { WpButton } from '@/src/app/components/common/button';
import { useGetUserStoryById, useDeleteUserStory } from '@/src/modules/tasks/hooks/useUserStory';
import { useTaskStoryRelationship } from '@/src/modules/tasks/hooks/useTaskStoryRelationship';
import UserStoryDetailSkeleton from './userStoryDetailSkeleton';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import EditUserStoryModal from './editUserStoryModal';
import { usePermissions } from '@/src/hooks/usePermissions';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { ColumnId, KanbanTask } from '@/src/types/board';
import { TaskStoryRelationshipItem } from '@/src/types/taskStoryRelationship';
import { statusOptions } from '@/src/modules/project/data/project';
import { useGetProjectMembers } from '@/src/modules/project/hooks/useProject';
import { useDebounce } from '@/src/hooks/useDebounce';
import { AssigneeAvatar } from '@/src/app/components/common/task';
import { colors } from '@/src/styles/colors';

interface UserStoryDetailProps {
  projectId: string;
  storyId: string;
}

const UserStoryDetail = ({ projectId, storyId }: UserStoryDetailProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const { hasPermission } = usePermissions();

  const { userStory, isLoadingUserStory, isError, refetchUserStory } = useGetUserStoryById(
    projectId,
    storyId
  );

  const { relatedTasks, isLoadingRelatedTasks, isFetchingRelatedTasks, refetchRelatedTasks } =
    useTaskStoryRelationship(projectId, storyId);

  const deleteUserStoryMutation = useDeleteUserStory();

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

  const mapTaskToDrawerTask = (task: TaskStoryRelationshipItem): KanbanTask => ({
    id: task.key ?? '',
    taskId: task.id ?? '',
    projectId: task.project_id ?? '',
    title: task.title ?? '',
    columnId: task.status as ColumnId,
    description: '',
    priority: task.priority
      ? ((task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
      : 'Medium',
    labels: [],
    dueDate: task.due_date ?? '',
    startDate: '',
    storyPoints: task.story_points ?? 0,
    sprint: task.sprint_name ?? '',
    parent: '',
    subtasks: [],
    assigneeInitials: task.assignee_name ? task.assignee_name.substring(0, 2).toUpperCase() : 'UN',
    assigneeColor: '#3B82F6',
    reporter: '',
    reporterInitials: '',
    reporterColor: undefined,
    activity: [],
  });

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';

  const handleTaskCreated = async () => {
    setShowCreateTaskModal(false);
    setMemberSearch('');
    await refetchRelatedTasks();
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await refetchUserStory();
  };

  const handleDelete = async () => {
    try {
      await deleteUserStoryMutation.mutateAsync({
        projectId,
        userStoryId: storyId,
      });
      // Invalidate user stories cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['user-stories', projectId] });
      router.push('/backlog');
    } catch (error) {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoadingUserStory || isLoadingRelatedTasks) {
    return <UserStoryDetailSkeleton />;
  }

  if (!userStory || isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">User story not found.</p>
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

  const tasks = relatedTasks?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push('/backlog')}
          className="cursor-pointer border-0 bg-transparent p-0 font-inherit text-gray-500 hover:text-gray-700 hover:underline"
        >
          Backlog
        </button>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-900">{userStory.title}</span>
      </div>

      {/* Back Button */}
      <WpButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        leftIcon={<ArrowLeft size={16} />}
        className="text-gray-500"
      >
        Back to Backlog
      </WpButton>

      {/* User Story Details Card */}
      <div className="relative rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{userStory.title}</h1>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                User Story
              </span>
            </div>

            {userStory.description && (
              <p className="mt-3 text-sm text-gray-600">{userStory.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasPermission('USER_STORY_EDIT') && (
              <WpButton
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="!p-2"
                aria-label="Edit user story"
              >
                <Pencil size={15} />
              </WpButton>
            )}

            {hasPermission('USER_STORY_DELETE') && (
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="!p-2 text-red-600 hover:bg-red-50"
                aria-label="Delete user story"
              >
                <Trash2 size={15} />
              </WpButton>
            )}
          </div>
        </div>

        <div className="my-5 border-t" />

        <div className="grid grid-cols-4 gap-5">
          <div>
            <p className="text-xs text-gray-400">STATUS</p>
            <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {userStory.status
                ? userStory.status.charAt(0).toUpperCase() + userStory.status.slice(1)
                : 'To Do'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400">PRIORITY</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                userStory.priority === 'critical'
                  ? 'bg-red-50 text-red-600'
                  : userStory.priority === 'high'
                    ? 'bg-orange-50 text-orange-600'
                    : userStory.priority === 'medium'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-green-50 text-green-600'
              }`}
            >
              {userStory.priority
                ? userStory.priority.charAt(0).toUpperCase() + userStory.priority.slice(1)
                : 'Medium'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400">STORY POINTS</p>
            <p className="mt-2 text-sm">{userStory.story_points ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">CREATED</p>
            <p className="mt-2 text-sm">{formatDate(userStory.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
        <WpButton
          type="button"
          variant="primary"
          size="md"
          onClick={() => setShowCreateTaskModal(true)}
          leftIcon={<Plus size={16} />}
          disabled={!hasPermission('TASK_CREATE')}
        >
          Create Task
        </WpButton>
      </div>

      {/* Tasks List */}
      {isFetchingRelatedTasks ? (
        <div className="flex min-h-[215px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Loading tasks...</p>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16">
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/images/Time management-rafiki.png"
              alt="No Tasks"
              width={288}
              height={288}
            />
            <p className="text-sm font-medium text-gray-400">
              No tasks have been created for this user story.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Add your first task to start tracking work.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(mapTaskToDrawerTask(task))}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-gray-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-6">
                {/* Left Content */}
                <div className="min-w-0 flex-1">
                  {/* Task key + title */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-bold text-blue-500">
                      {task.key}
                    </span>

                    <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-gray-700 ml-4">
                      {task.title}
                    </h3>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5  text-xs text-gray-500">
                    {/* Type */}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">
                      {task.type}
                    </span>

                    {task.assignee_name && (
                      <span className="flex items-center gap-2 ml-3">
                        <AssigneeAvatar
                          initials={task.assignee_name
                            .split(' ')
                            .map((name) => name[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                          color={colors.primaryFocus}
                          size="sm"
                        />

                        <span className="text-gray-600">{task.assignee_name}</span>
                      </span>
                    )}

                    {/* Sprint */}
                    {task.sprint_name && (
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-400">Sprint</span>
                        <span className="text-gray-600">{task.sprint_name}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* Priority */}
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      task.priority === 'critical'
                        ? 'bg-red-50 text-red-600'
                        : task.priority === 'high'
                          ? 'bg-orange-50 text-orange-600'
                          : task.priority === 'medium'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>

                  {/* Status */}
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <AddTaskModal
          projectId={projectId}
          sprintId="" // Empty sprint ID, will use user story ID instead
          userStoryId={storyId} // Pass user story ID
          assigneeOptions={assigneeOptions}
          memberSearch={memberSearch}
          onMemberSearchChange={setMemberSearch}
          isLoadingMembers={isLoadingMembers || isFetchingMembers}
          onClose={() => {
            setShowCreateTaskModal(false);
            setMemberSearch('');
          }}
          onCreate={handleTaskCreated}
        />
      )}

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* Edit User Story Modal */}
      {showEditModal && userStory && (
        <EditUserStoryModal
          projectId={projectId}
          userStory={userStory}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete User Story</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this user story? This action cannot be undone and will
              also affect all associated tasks.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteUserStoryMutation.isPending}
              >
                Cancel
              </WpButton>
              <WpButton
                variant="primary"
                size="sm"
                onClick={handleDelete}
                disabled={deleteUserStoryMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteUserStoryMutation.isPending ? 'Deleting...' : 'Delete'}
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoryDetail;
