'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableCheckbox } from './TableCheckbox';
import { ActionMenu } from './ActionMenu';
import { AssigneeAvatar, PriorityBadge, StatusBadge } from '@/src/app/components/common/task';
import { Task } from '@/src/types/task';
import { logger } from '@/src/lib/utils/logger';
import { tasksData } from '../data/tasks';
import { WpButton } from '@/src/app/components/common/button';

type TaskTableProps = {
  selectedFilters: {
    status: string;
    priority: string;
    assignee: string;
    sprint: string;
  };
  searchTerm: string;
};
export const TaskTable = ({ selectedFilters, searchTerm }: TaskTableProps) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tasksData.map((task) => task.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };
  const filteredTasks = tasksData.filter((task) => {
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

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesSprint;
  });

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks: Task[] = filteredTasks.slice(startIndex, endIndex);

  return (
    <div className="w-350 overflow-hidden rounded-xl border border-gray-200">
      <table className="w-350 border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr className="h-12 text-[11px] font-medium uppercase tracking-wide text-gray-500">
            <th className="w-12 p-3">
              <TableCheckbox
                checked={selectedRows.length === tasksData.length}
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
            <tr key={task.id} className="border-b-1 border-gray-200 hover:bg-gray-50">
              <td className="p-3">
                <TableCheckbox
                  checked={selectedRows.includes(task.id)}
                  onChange={() => handleSelectRow(task.id)}
                />
              </td>
              <td className="p-3 font-semibold text-blue-600">
                <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                  {' '}
                  {task.id}
                </span>
              </td>
              <td className="p-3">{task.title}</td>
              <td className="w-16 sm:w-20 shrink-0">
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
                <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
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
                  onView={() => logger.log('View', task.id)}
                  onUpdate={() => logger.log('Update', task.id)}
                  onDelete={() => logger.log('Delete', task.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4">
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
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight size={18} />
          </WpButton>
        </div>
      </div>
    </div>
  );
};
