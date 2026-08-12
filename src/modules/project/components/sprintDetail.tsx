'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';

import { WpButton } from '@/src/app/components/common/button';
import { useGetSprintById, useDeleteSprint } from '@/src/modules/project/hooks/useSprint';
import SprintDetailSkeleton from './sprintDetailSkeleton';
import AddTaskModal, { Task } from './addTaskModel';
import EditSprintModal from './editSprintModal';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useGetTasks, useDeleteTask } from '@/src/modules/tasks/hooks/useTask';
import { useAppSelector } from '@/src/store';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { ColumnId, KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { statusOptions } from '../data/project';
const SprintDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sprintId = searchParams.get('sprintId') ?? '';
  const projectId = searchParams.get('projectId') ?? '';
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteSprintConfirm, setShowDeleteSprintConfirm] = useState(false);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const { hasPermission } = usePermissions();
  const { sprint, isLoadingSprint, isError, refetch } = useGetSprintById(projectId, sprintId);
  const { deleteSprintAsync, isDeletingSprint } = useDeleteSprint(projectId);
  const { tasksList, isLoadingTasks, isFetchingTasks } = useGetTasks(projectId, {
    sprint_id: sprintId,
  });

  const { deleteTaskAsync, isDeletingTask } = useDeleteTask(projectId);
  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const assigneeOptions =
    selectedApiProject?.members?.map((member) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];
  const STATUS_LABELS = Object.fromEntries(
    statusOptions.map((option) => [option.value, option.label])
  );
  const mapTaskToDrawerTask = (task: TaskResponse): KanbanTask => ({
    id: task.key ?? '',
    taskId: task.id ?? '',
    projectId: task.project_id ?? '',
    title: task.title ?? '',
    columnId: task.status as ColumnId,
    description: task.description ?? '',
    priority: task.priority
      ? ((task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
      : 'Medium',
    labels: [],
    dueDate: task.due_date ?? '',
    startDate: task.start_date ?? '',
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
  const handleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === (tasksList || []).length) {
      setSelectedTaskIds([]);
      return;
    }

    setSelectedTaskIds((tasksList || []).map((task) => task.id).filter((id): id is string => Boolean(id)));
  };
  const handleDeleteTasks = async () => {
    if (selectedTaskIds.length === 0) return;

    try {
      await Promise.all(selectedTaskIds.map((taskId) => deleteTaskAsync(taskId)));

      setSelectedTaskIds([]);
      setShowDeleteTaskConfirm(false);
    } catch (error) {}
  };
  const handleSprintSuccess = async () => {
    await refetch();
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
  const allTasksSelected = (tasksList || []).length > 0 && selectedTaskIds.length === (tasksList || []).length;
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
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex items-center gap-2">
          {selectedTaskIds.length > 0 && (
            <WpButton
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setShowDeleteTaskConfirm(true)}
              disabled={isDeletingTask}
              className="text-red-600 hover:bg-red-50"
              leftIcon={<Trash2 size={16} />}
            >
              {isDeletingTask ? 'Deleting...' : 'Delete'}
            </WpButton>
          )}

          <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={() => setShowAddTaskModal(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Task
          </WpButton>
        </div>
      </div>

      {isFetchingTasks ? (
        <div className="flex min-h-[215px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">Loading updated tasks...</p>
          </div>
        </div>
      ) : !(tasksList || []).length ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16">
          <div className="flex flex-col items-center justify-center">
            <img src="/images/Empty-rafiki.svg" alt="No Tasks" className="h-72 w-72" />

            <p className="text-sm font-medium text-gray-400">
              No tasks have been created for this sprint.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Add your first task to start tracking work.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <input
              type="checkbox"
              checked={allTasksSelected}
              onChange={handleSelectAll}
              className="h-4 w-4 cursor-pointer rounded border-gray-300"
            />

            <span className="text-xs text-gray-500">Select all</span>
          </div>

          {(tasksList || []).map((task) => {
            const taskId = task.id ?? '';

            return (
              <div
                key={taskId}
                className={`flex items-center gap-4 rounded-xl border bg-white p-5 transition ${
                  selectedTaskIds.includes(taskId)
                    ? 'border-blue-400 bg-blue-50/30'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTaskIds.includes(taskId)}
                  onChange={() => handleTaskSelection(taskId)}
                  onClick={(event) => event.stopPropagation()}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300"
                />

                <div
                  onClick={() => setSelectedTask(mapTaskToDrawerTask(task))}
                  className="flex min-w-0 flex-1 cursor-pointer items-center justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>

                    {task.description && (
                      <p className="mt-1 truncate text-xs text-gray-500">{task.description}</p>
                    )}
                  </div>

                  <span className="ml-4 shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddTaskModal && (
        <AddTaskModal
          projectId={projectId}
          sprintId={sprintId}
          assigneeOptions={assigneeOptions}
          onClose={() => setShowAddTaskModal(false)}
          onCreate={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {showEditModal && (
        <EditSprintModal
          projectId={projectId}
          sprint={sprint}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSprintSuccess}
        />
      )}

      {showDeleteTaskConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Task</h3>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{' '}
              {selectedTaskIds.length === 1 ? 'this task' : `${selectedTaskIds.length} tasks`}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteTaskConfirm(false)}
                disabled={isDeletingTask}
              >
                Cancel
              </WpButton>

              <WpButton
                variant="primary"
                size="sm"
                onClick={handleDeleteTasks}
                disabled={isDeletingTask}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeletingTask ? 'Deleting...' : 'Delete'}
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
