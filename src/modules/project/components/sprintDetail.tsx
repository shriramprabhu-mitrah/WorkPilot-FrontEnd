'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import AddTaskModal, { Task } from './addTaskModel';
import { WpButton } from '@/src/app/components/common/button';
import { useGetSprintById, useDeleteSprint } from '@/src/modules/project/hooks/useSprint';
import SprintDetailSkeleton from './sprintDetailSkeleton';
import EditSprintModal from './editSprintModal';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useGetTasks } from '@/src/modules/tasks/hooks/useTask';

const SprintDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sprintId = searchParams.get('sprintId') ?? '';
  const projectId = searchParams.get('projectId') ?? '';
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { hasPermission } = usePermissions();

  const { sprint, isLoadingSprint, isError, refetch } = useGetSprintById(projectId, sprintId);
  const { deleteSprintAsync, isDeletingSprint } = useDeleteSprint(projectId);
  const { tasksList, isLoadingTasks, refetchTasks } = useGetTasks(projectId, {
    sprint_id: sprintId,
  });

  if (isLoadingSprint || isLoadingTasks) return <SprintDetailSkeleton />;

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

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';
  const handleCreateTask = (newTask: Task) => {
    refetchTasks();
    setShowAddTaskModal(false);
  };
  const closeModal = () => {
    setShowEditModal(false);
    refetch();
  };
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push('/projects');
          }}
          className="cursor-pointer text-gray-500 hover:text-gray-700 hover:underline bg-transparent border-0 p-0 font-inherit"
        >
          Projects
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500" onClick={() => router.back()}>
          Sprints
        </span>
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

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{sprint.name}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {formatDate(sprint.start_date)} → {formatDate(sprint.end_date)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
              {sprint.status}
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
                onClick={() => setShowDeleteConfirm(true)}
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
      {!tasksList || tasksList.length === 0 ? (
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
          {tasksList.map((task) => (
            <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>

                  {task.description && (
                    <p className="mt-1 text-xs text-gray-500">{task.description}</p>
                  )}

                  {/* Assuming assignee info isn't directly returned by TaskResponse yet */}
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddTaskModal && (
        <AddTaskModal onClose={() => setShowAddTaskModal(false)} onCreate={handleCreateTask} />
      )}
      {showEditModal && (
        <EditSprintModal projectId={projectId} sprint={sprint} onClose={() => closeModal()} />
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete Sprint</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-800">{sprint.name}</span>? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <WpButton variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
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
                    setShowDeleteConfirm(false);
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
