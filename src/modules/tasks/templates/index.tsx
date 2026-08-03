'use client';
import { tasksData } from '../data/tasks';
import { TaskTable } from '../components/TaskTable';
import { useState } from 'react';
import { TaskHeader } from '../components/TaskHeader';
import { useEffect } from 'react';
import TaskSkeleton from '../components/taskSkeleton';
export const TaskTemplate = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'All Statuses',
    priority: 'All Priorities',
    assignee: 'All Assignees',
    sprint: 'All Sprints',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <TaskSkeleton />;
  }
  return (
    <div className="w-350">
      <>
        <TaskHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
        <TaskTable selectedFilters={selectedFilters} searchTerm={searchTerm} />
      </>
    </div>
  );
};
