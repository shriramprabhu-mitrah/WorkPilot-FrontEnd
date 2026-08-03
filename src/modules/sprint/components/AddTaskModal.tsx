import { useState } from 'react';
import { X } from 'lucide-react';
import { Priority } from '@/src/types/board';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { priorityOptions } from '../data/sprint';
import { assigneeOptions } from '../data/sprint';
import { statusOptions } from '../data/sprint';
import { WpTextarea } from '@/src/app/components/common/textarea';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-[520px] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-[20px] font-semibold text-gray-900">Add Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-700)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-5">
            <WpInput
              label="Task Name"
              showRequired
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />

            <WpTextarea
              label="Description"
              rows={3}
              placeholder="Optional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <WpDropdown
              label="Priority"
              options={priorityOptions}
              value={priority}
              onChange={(value) => setPriority(value as Priority)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WpDropdown
                label="Assignee"
                options={assigneeOptions}
                value={assignee}
                onChange={setAssignee}
              />

              <WpDropdown
                label="Status"
                options={statusOptions}
                value={status}
                onChange={setStatus}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <WpButton variant="secondary" onClick={onClose}>
                Cancel
              </WpButton>

              <WpButton variant="primary" onClick={handleSave} disabled={isSaveDisabled}>
                Save Task
              </WpButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
