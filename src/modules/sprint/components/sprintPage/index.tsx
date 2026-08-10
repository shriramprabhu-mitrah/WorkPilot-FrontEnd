'use client';

import SprintStatsCard from '../sprintStatsCard';
import ProgressCard from '../ProgressCard';
import TaskColumn from '../taskColumn';
import WorkloadItem from '../workloadItem';
import { WpButton } from '@/src/app/components/common/button';
import { sprintStats, progressCards, taskColumns, workload } from '../../data/sprint';
import { useState, useEffect } from 'react';
import { projectService } from '@/src/services/project';
import { sprintService } from '@/src/services/sprint';
import AddTaskModal from '../AddTaskModal';
import { Task } from '../../types/sprint';
import SprintSkeleton from '../sprintSkeleton';
import { logger } from '@/src/lib/utils/logger';
type NewTask = Task & {
  description: string;
  assignee: string;
  status: string;
};

const SprintPage = () => {
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedSprint, setSelectedSprint] = useState('All Sprints');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [columns, setColumns] = useState(taskColumns);

  // Real dynamic data
  const [projectsList, setProjectsList] = useState<{ id: string; name: string }[]>([]);
  const [sprintsList, setSprintsList] = useState<{ id: string; name: string }[]>([]);

  //temp loading
  const [loading, setLoading] = useState(true);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProject({ fieldName: 'id,name' });
        if (res.data) {
          setProjectsList(res.data.map((p) => ({ id: p.id || '', name: p.name })));
        }
      } catch (error) {
        logger.log('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch sprints when a specific project is selected
  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProject || selectedProject === 'All Projects') {
        setSprintsList([]);
        setSelectedSprint('All Sprints');
        return;
      }
      try {
        const res = await sprintService.getSprints(selectedProject, 'id,name');
        if (res.data) {
          setSprintsList(res.data.map((s) => ({ id: s.id, name: s.name })));
        }
      } catch (error) {
        logger.log('Failed to fetch sprints', error);
      }
    };
    fetchSprints();
  }, [selectedProject]);

  if (loading) {
    return <SprintSkeleton />;
  }
  const handleSaveTask = (newTask: NewTask) => {
    setColumns((prev) =>
      prev.map((column) => {
        if (column.status !== newTask.status) {
          return column;
        }

        const updatedTasks = [
          ...column.tasks,
          {
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
          },
        ];

        return {
          ...column,
          tasks: updatedTasks,
          count: updatedTasks.length,
        };
      })
    );

    setIsAddTaskOpen(false);
  };
  const hasTasks = columns.some((column) => column.tasks.length > 0);
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[15px] font-medium shadow-sm hover:bg-gray-50"
            >
              <option value="All Projects">All Projects</option>

              {projectsList.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              disabled={selectedProject === 'All Projects'}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[15px] font-medium shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All Sprints">All Sprints</option>

              {sprintsList.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Complete authentication refactor and ship onboarding v2.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-green-50 px-3 text-sm font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Active
          </span>

          <WpButton variant="secondary" size="sm" className="h-9 px-3">
            Complete Sprint
          </WpButton>

          <WpButton size="sm" className="h-9 px-3" onClick={() => setIsAddTaskOpen(true)}>
            + Add Task
          </WpButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {sprintStats.map((task) => (
          <SprintStatsCard
            key={task.title}
            value={task.value}
            title={task.title}
            valueColor={task.valueColor}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {progressCards.map((card) => (
          <ProgressCard
            key={card.title}
            title={card.title}
            progress={card.progress}
            progressColor={card.progressColor}
            rightLabel={card.rightLabel}
            subtitle={card.subtitle}
            startDate={card.startDate}
            endDate={card.endDate}
          />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Task Status Board</h2>

        {!hasTasks ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16">
            <div className="flex flex-col items-center justify-center">
              <img src="/images/Empty-rafiki.svg" alt="No Sprint Tasks" className="h-72 w-72" />

              <h2 className="mt-6 text-2xl font-bold text-gray-900">No Sprint Tasks</h2>

              <p className="mt-2 max-w-md text-center text-gray-500">
                There are no tasks in this sprint yet. Create your first task to start planning and
                tracking sprint work.
              </p>

              <WpButton className="mt-8" onClick={() => setIsAddTaskOpen(true)}>
                + Add Task
              </WpButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {columns.map((column) => (
              <TaskColumn key={column.status} column={column} />
            ))}
          </div>
        )}
      </div>

      {hasTasks && (
        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Team Workload in Sprint</h2>

          <div className="space-y-1">
            {workload.map((member) => (
              <WorkloadItem key={member.name} member={member} />
            ))}
          </div>
        </div>
      )}
      <AddTaskModal
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default SprintPage;
