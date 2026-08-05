'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableCheckbox } from './TableCheckbox';
import { ActionMenu } from './ActionMenu';
import { AssigneeAvatar, PriorityBadge, StatusBadge } from '@/src/app/components/common/task';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { WpButton } from '@/src/app/components/common/button';
import { Task } from '@/src/types/task';
import { KanbanTask, ColumnId } from '@/src/types/board';
import { logger } from '@/src/lib/utils/logger';
import { usePermissions } from '@/src/hooks/usePermissions';
import Image from 'next/image';

type TaskTableProps = {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

  selectedFilters: {
    project: string;
    status: string;
    priority: string;
    assignee: string;
    sprint: string;
  };
  searchTerm: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>;
};
export const TaskTable = ({
  tasks,
  setTasks,
  selectedFilters,
  searchTerm,
  currentPage,
  setCurrentPage,
  selectedRows,
  setSelectedRows,
}: TaskTableProps) => {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const rowsPerPage = 10;
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('TASK_EDIT');
  const canDelete = hasPermission('TASK_DELETE');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredTasks.map((task) => task.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedFilters.status === 'All Statuses' || task.status === selectedFilters.status;

    const matchesPriority =
      selectedFilters.priority === 'All Priorities' || task.priority === selectedFilters.priority;

    const matchesAssignee =
      selectedFilters.assignee === 'All Assignees' ||
      task.assignee.name === selectedFilters.assignee;

    const matchesSprint =
      selectedFilters.sprint === 'All Sprints' || task.sprint === selectedFilters.sprint;
    const matchesProject =
      selectedFilters.project === 'All Projects' || task.project === selectedFilters.project;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee &&
      matchesSprint &&
      matchesProject
    );
  });

  const toKanbanTask = (task: Task): KanbanTask => ({
    id: task.id,
    title: task.title,
    priority: task.priority,
    labels: task.labels,
    assigneeInitials: task.assignee.initials,
    assigneeColor: task.assignee.color,
    storyPoints: task.points,
    dueDate: task.dueDate,
    sprint: task.sprint,
    columnId: task.status.toLowerCase().replace(/\s+/g, '') as ColumnId,
    description: '',
    subtasks: [],
    activity: [],
    reporter: '',
    reporterInitials: '',
    reporterColor: '',
  });

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  const handleDelete = () => {
    if (!deleteTaskId) return;
    setTasks((prev) => prev.filter((task) => task.id !== deleteTaskId));
    setSelectedRows((prev) => prev.filter((id) => id !== deleteTaskId));
    setDeleteTaskId(null);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200">
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Image
            src="/images/Empty-rafiki.svg"
            alt="No Tasks"
            width={288}
            height={288}
            className="h-72 w-72"
          />

          <h2 className="mt-6 text-2xl font-bold text-gray-900">No Tasks Yet</h2>

          <p className="mt-2 max-w-md text-center text-gray-500">
            Create your first task and track progress.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr className="h-12 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <th className="w-12 p-3">
                  <TableCheckbox
                    checked={
                      filteredTasks.length > 0 &&
                      filteredTasks.every((task) => selectedRows.includes(task.id))
                    }
                    onChange={handleSelectAll}
                  />
                </th>

                <th className="p-3 text-left">Task ID</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Assignee</th>
                <th className="p-3 text-left">PTS</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Sprint</th>
                <th className="p-3 text-left">Labels</th>
                <th className="p-3 text-center"></th>
              </tr>
            </thead>

            <tbody>
              {paginatedTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <TableCheckbox
                      checked={selectedRows.includes(task.id)}
                      onChange={() => handleSelectRow(task.id)}
                    />
                  </td>

                  <td className="p-3 font-semibold text-blue-600">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-blue-600">
                      {task.id}
                    </span>
                  </td>

                  <td className="p-3">{task.title}</td>

                  <td className="w-16 shrink-0 sm:w-20">
                    <PriorityBadge priority={task.priority} />
                  </td>

                  <td className="p-3">
                    <StatusBadge status={task.status} />
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <AssigneeAvatar
                        initials={task.assignee.initials}
                        color={task.assignee.color}
                        size="md"
                      />
                      <span>{task.assignee.name}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {task.points}
                    </span>
                  </td>

                  <td className="p-3">{task.dueDate}</td>

                  <td className="p-3">{task.sprint}</td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {task.labels.map((label) => (
                        <span key={label} className="rounded bg-gray-200 px-2 py-1 text-xs">
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <ActionMenu
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => setSelectedTask(toKanbanTask(task))}
                      onUpdate={() => logger.log('Update', task.id)}
                      onDelete={() => setDeleteTaskId(task.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTasks.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 px-4 py-4">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredTasks.length)} of{' '}
            {filteredTasks.length} tasks
          </p>

          <div className="flex items-center gap-2">
            <WpButton
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
            </WpButton>

            {Array.from({ length: totalPages }).map((_, index) => (
              <WpButton
                key={index}
                size="sm"
                variant={currentPage === index + 1 ? 'primary' : 'secondary'}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </WpButton>
            ))}

            <WpButton
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={18} />
            </WpButton>
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {deleteTaskId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Delete Task</h2>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this task?</p>

            <div className="mt-6 flex justify-end gap-3">
              <WpButton variant="secondary" onClick={() => setDeleteTaskId(null)}>
                Cancel
              </WpButton>

              <WpButton variant="danger" onClick={handleDelete}>
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
