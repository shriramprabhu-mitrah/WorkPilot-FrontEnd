'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { useUpdateSprint } from '../hooks/useSprint';
import { SprintDetail } from '@/src/types/project';

interface EditSprintModalProps {
  projectId: string;
  sprint: SprintDetail;
  onClose: () => void;
}

const EditSprintModal = ({ projectId, sprint, onClose }: EditSprintModalProps) => {
  const [form, setForm] = useState({
    name: sprint.name,
    goal: sprint.goal ?? '',
    start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '',
    end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '',
  });

  const { updateSprintAsync, isUpdatingSprint } = useUpdateSprint(projectId);

  const handleSubmit = async () => {
    try {
      await updateSprintAsync({ sprintId: sprint.id, payload: form });
      onClose();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold">Edit Sprint</h2>
          <WpButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            leftIcon={<X size={18} />}
          />
        </div>
        <div className="space-y-4 p-5">
          <WpInput
            id="edit-sprint-name"
            label="Sprint name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <WpInput
            id="edit-sprint-goal"
            label="Goal"
            value={form.goal}
            onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <WpInput
              id="edit-start-date"
              type="date"
              label="Start date"
              value={form.start_date}
              onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
            />
            <WpInput
              id="edit-end-date"
              type="date"
              label="Due date"
              value={form.end_date}
              onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t p-5">
          <WpButton variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </WpButton>
          <WpButton variant="primary" size="md" onClick={handleSubmit} disabled={isUpdatingSprint}>
            {isUpdatingSprint ? 'Saving...' : 'Save Changes'}
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default EditSprintModal;
