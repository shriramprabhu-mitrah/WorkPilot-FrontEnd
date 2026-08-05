'use client';
import { tasksData } from '../data/tasks';
import { TaskTable } from '../components/TaskTable';
import { useState } from 'react';
import { TaskHeader } from '../components/TaskHeader';
import { useEffect } from 'react';
import TaskSkeleton from '../components/taskSkeleton';
import { WpButton } from '@/src/app/components/common/button';
export const TaskTemplate = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    project: 'All Projects',
    status: 'All Statuses',
    priority: 'All Priorities',
    assignee: 'All Assignees',
    sprint: 'All Sprints',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [tasks, setTasks] = useState(tasksData);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <TaskSkeleton />;
  }
  const handleBulkDelete = () => {
    setTasks((prev) =>
      prev.filter((task) => !selectedRows.includes(task.id))
    );

    setSelectedRows([]);
    setShowBulkDeleteModal(false);
  };
  return (
    <div className="w-full">
      <>
        <TaskHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedRows={selectedRows}
          setShowBulkDeleteModal={setShowBulkDeleteModal}
        />
        <TaskTable
          tasks={tasks}
          setTasks={setTasks}
          selectedFilters={selectedFilters}
          searchTerm={searchTerm}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </>
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Tasks
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {selectedRows.length} selected
              {selectedRows.length === 1 ? ' task' : ' tasks'}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <WpButton
                variant="secondary"
                onClick={() => setShowBulkDeleteModal(false)}
              >
                Cancel
              </WpButton>

              <WpButton
                variant="danger"
                onClick={handleBulkDelete}
              >
                Delete
              </WpButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
