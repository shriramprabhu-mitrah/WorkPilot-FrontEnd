'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { Sprint } from '../types/project';
import AddTaskModal, { Task } from './addTaskModel';
import { WpButton } from '@/src/app/components/common/button';
const SprintDetail = () => {
  const router = useRouter();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprint] = useState<Sprint | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const storedSprint = sessionStorage.getItem('selectedSprint');
    if (!storedSprint) {
      return null;
    }
    try {
      return JSON.parse(storedSprint) as Sprint;
    } catch {
      return null;
    }
  });
  if (!sprint) {
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
  const handleCreateTask = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setShowAddTaskModal(false);
  };
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Projects</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">Sprints</span>
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
              {sprint.startDate || 'No start date'} → {sprint.endDate || 'No end date'}
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
            {sprint.status}
          </span>
        </div>

        <div className="my-5 border-t" />
        <div className="grid grid-cols-3 gap-5">
          <div>
            <p className="text-xs text-gray-400">START DATE</p>
            <p className="mt-2 text-sm">{sprint.startDate || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">END DATE</p>
            <p className="mt-2 text-sm">{sprint.endDate || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">TASKS</p>
            <p className="mt-2 text-sm">{sprint.tasks}</p>
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
      {tasks.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              No tasks have been created for this sprint.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Add your first task to start tracking work.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{task.name}</h3>

                  {task.description && (
                    <p className="mt-1 text-xs text-gray-500">{task.description}</p>
                  )}

                  {task.assignee && (
                    <p className="mt-2 text-xs text-gray-400">Assigned to: {task.assignee}</p>
                  )}
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
    </div>
  );
};
export default SprintDetail;
