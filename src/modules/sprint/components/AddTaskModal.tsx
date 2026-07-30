import { useState } from 'react';
import { X } from 'lucide-react';
import { Priority } from '@/src/types/board';
interface TaskData {
  title: string;
  description: string;
  assignee: string;
  status: string;
  priority: Priority;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: TaskData) => void;
}

const AddTaskModal = ({ open, onClose, onSave }: Props) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('Sarah Chen');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState<Priority>('Medium');
  if (!open) return null;

  const handleSave = () => {
    onSave({
      title: taskName,
      description,
      assignee,
      status,
      priority,
    });

    setTaskName('');
    setDescription('');
    setAssignee('Sarah Chen');
    setStatus('To Do');
    setPriority('Medium');
    onClose();
  };
  const isSaveDisabled = taskName.trim() === '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-[20px] font-semibold text-gray-900">Add Task</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Task Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>

              <textarea
                rows={3}
                placeholder="Optional details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Assignee</label>

                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                >
                  <option>Sarah Chen</option>
                  <option>David J</option>
                  <option>John</option>
                  <option>Priya Patel</option>
                  <option>Alex</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>In Review</option>
                  <option>Done</option>
                  <option>Backlog</option>
                  <option>Testing</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className={`rounded-lg px-5 py-2 font-medium text-white ${
                  isSaveDisabled
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
