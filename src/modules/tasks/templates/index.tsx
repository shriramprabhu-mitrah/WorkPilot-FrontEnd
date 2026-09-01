'use client';
import { TaskTable } from '../components/TaskTable';
import { useState } from 'react';
import { TaskHeader } from '../components/TaskHeader';
import { useEffect } from 'react';
import TaskSkeleton from '../components/taskSkeleton';
import { WpButton } from '@/src/app/components/common/button';
import { useGetTasks, useDeleteTask } from '../hooks/useTask';
import { Task, TaskResponse } from '@/src/types/task';
import { Priority } from '@/src/types/board';
import { TaskStatus } from '@/src/app/components/common/task';
import { useAppSelector } from '@/src/store';
import { formatMonthYear } from '@/src/app/components/common/format';
import { usePermissions } from '@/src/hooks/usePermissions';

export const TaskTemplate = () => {
  const { canViewTasks } = usePermissions();
  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const selectedSprintStore = useAppSelector((state) => state.project.selectedSprint);
  const projectId = selectedApiProject?.id ?? '';
  const sprintId = selectedSprintStore?.id ?? '';
  const { deleteTask, isDeletingTask } = useDeleteTask(projectId);

  const [selectedFilters, setSelectedFilters] = useState({
    project: projectId,
    status: 'All Statuses',
    priority: 'All Priorities',
    assignee: 'All Assignees',
    sprint: sprintId,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const mergedFilters = { ...selectedFilters, project: projectId, sprint: sprintId };

  const { tasksList, isLoadingTasks } = useGetTasks(
    mergedFilters.project,
    { sprint_id: mergedFilters.sprint || undefined },
    !!mergedFilters.project && canViewTasks
  );

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (tasksList) {
      const statusMap: Record<string, string> = {
        todo: 'To Do',
        in_progress: 'In Progress',
        in_review: 'In Review',
        testing: 'Testing',
        done: 'Done',
        backlog: 'Backlog',
      };
      const mappedTasks: Task[] = tasksList.map((t: TaskResponse) => ({
        id: t.id || '-',
        key: t.key || '',
        title: t.title || '-',
        priority: (t.priority
          ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1).toLowerCase()
          : 'Medium') as Priority,
        status: (t.status ? statusMap[t.status.toLowerCase()] || t.status : 'To Do') as TaskStatus,
        project: t.project_id || '',
        assignee: {
          name: t.assignee_name || 'Unassigned',
          initials: t.assignee_name ? t.assignee_name.substring(0, 2).toUpperCase() : 'UN',
          color: '#3B82F6',
        },
        points: t.story_points || 0,
        dueDate: formatMonthYear(t.due_date || '-'),
        sprint: t.sprint_name || '-',
        sprintId: t.sprint_id || '',
        labels: [],
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks(mappedTasks);
    }
  }, [tasksList]);

  const handleBulkDelete = () => {
    if (!projectId || selectedRows.length === 0) return;

    deleteTask(selectedRows, {
      onSuccess: () => {
        setTasks((prev) => prev.filter((task) => !selectedRows.includes(task.id)));
        setSelectedRows([]);
        setShowBulkDeleteModal(false);
      },
    });
  };

  return (
    <div className="w-full">
      <TaskHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedFilters={mergedFilters}
        setSelectedFilters={setSelectedFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        selectedRows={selectedRows}
        setShowBulkDeleteModal={setShowBulkDeleteModal}
      />
      {isLoadingTasks && mergedFilters.project ? (
        <div className="mt-4">
          <TaskSkeleton />
        </div>
      ) : !canViewTasks ? (
        <div className="flex flex-1 items-center justify-center py-16 px-3 sm:px-0">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Access Restricted
            </h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400 text-sm">
              You do not have permission to view tasks.
            </p>
          </div>
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          setTasks={setTasks}
          projectId={projectId}
          sprintId={sprintId}
          selectedFilters={mergedFilters}
          searchTerm={searchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      )}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Delete Tasks</h2>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {selectedRows.length} selected
              {selectedRows.length === 1 ? ' task' : ' tasks'}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <WpButton variant="secondary" onClick={() => setShowBulkDeleteModal(false)}>
                Cancel
              </WpButton>
              <WpButton variant="danger" onClick={handleBulkDelete} isLoading={isDeletingTask}>
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
