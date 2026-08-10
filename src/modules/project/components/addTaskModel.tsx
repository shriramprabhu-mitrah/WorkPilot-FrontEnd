'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { assigneeOptions, statusOptions } from '../data/project';
import { useCreateTask } from '@/src/modules/tasks/hooks/useTask';
import { TaskPayload } from '@/src/types/task';

export interface Task {
  id: string;
  name: string;
  description: string;
  assignee: string;
  status: string;
}

interface AddTaskModalProps {
  onClose: () => void;
  onCreate: (task?: Task) => void;
  projectId: string;
  sprintId?: string;
}

const AddTaskModal = ({ onClose, onCreate, projectId, sprintId }: AddTaskModalProps) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('Sarah Chen');
  const [status, setStatus] = useState('To Do');
  
  const { createTaskAsync, isCreatingTask } = useCreateTask(projectId);

  const handleSave = async () => {
    if (!taskName.trim()) {
      return;
    }

    try {
      const payload: TaskPayload = {
        title: taskName,
        description,
        status,
        estimated_hours: 0,
        sprint_id: sprintId,
      };

      await createTaskAsync(payload);
      onCreate();
      setTaskName('');
      setDescription('');
      setAssignee('Sarah Chen');
      setStatus('To Do');
    } catch  {
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-bold text-gray-900">Add Task</h2>
          <WpButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-1.5 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </WpButton>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <WpInput
              id="taskName"
              label="Task name"
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              showRequired
            />
          </div>
          <WpInput
            id="description"
            label="Description"
            placeholder="Optional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <WpDropdown
              label="Assignee"
              options={assigneeOptions}
              value={assignee}
              onChange={setAssignee}
              placeholder="Select assignee"
            />
            <WpDropdown
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
              placeholder="Select status"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <WpButton type="button" variant="secondary" size="md" onClick={onClose} disabled={isCreatingTask}>
            Cancel
          </WpButton>
          <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!taskName.trim() || isCreatingTask}
          >
            {isCreatingTask ? 'Saving...' : 'Save Task'}
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
