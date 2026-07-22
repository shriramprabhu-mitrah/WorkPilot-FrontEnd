'use client';
import { tasksData } from '../data/tasks';
import { TaskTable } from '../components/TaskTable';
import { useState } from 'react';
import { TaskHeader } from '../components/TaskHeader';
export const TaskTemplate = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'All Statuses',
    priority: 'All Priorities',
    assignee: 'All Assignees',
    sprint: 'All Sprints',
  });
  const [searchTerm, setSearchTerm] = useState('');
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
