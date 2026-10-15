'use client';

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { useUpdateSprint } from '../hooks/useSprint';
import { SprintDetail } from '@/src/types/project';

const today = new Date().toISOString().split('T')[0];

const formatDateTimeLocal = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const editSprintSchema = z.object({
  name: z.string().trim().min(1, 'Sprint name is required'),
  goal: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().min(1, 'Due date and time are required'),
});

type EditSprintForm = z.infer<typeof editSprintSchema>;

interface EditSprintModalProps {
  projectId: string;
  sprint: SprintDetail;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditSprintModal = ({ projectId, sprint, onClose, onSuccess }: EditSprintModalProps) => {
  const { updateSprintAsync, isUpdatingSprint } = useUpdateSprint(projectId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditSprintForm>({
    resolver: zodResolver(editSprintSchema),
    defaultValues: {
      name: sprint.name,
      goal: sprint.goal ?? '',
      start_date: formatDateTimeLocal(sprint.start_date),
      end_date: formatDateTimeLocal(sprint.end_date),
    },
  });

  const startDate = watch('start_date');

  const onSubmit = async (data: EditSprintForm) => {
    try {
      await updateSprintAsync({
        sprintId: sprint.id,
        payload: {
          name: data.name,
          goal: data.goal ?? '',
          end_date: new Date(data.end_date).toISOString(),
        },
      });

      onClose();
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Edit Sprint</h2>

          <WpButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-2 text-gray-400 dark:text-slate-500"
            leftIcon={<X size={18} />}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 p-5">
            <WpInput
              id="edit-sprint-name"
              label="Sprint name"
              showRequired
              error={errors.name?.message}
              {...register('name')}
            />

            <WpInput id="edit-sprint-goal" label="Goal" {...register('goal')} />

            <div className="grid grid-cols-2 gap-3">
              <WpInput
                id="edit-start-date"
                type="datetime-local"
                label="Start date"
                disabled
                {...register('start_date')}
              />

              <WpInput
                id="edit-end-date"
                type="datetime-local"
                label="Due date"
                min={startDate || `${today}T00:00`}
                error={errors.end_date?.message}
                {...register('end_date')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 p-5">
            <WpButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isUpdatingSprint}
              className="text-gray-600 dark:text-slate-300"
            >
              Cancel
            </WpButton>

            <WpButton type="submit" variant="primary" size="md" disabled={isUpdatingSprint}>
              {isUpdatingSprint ? 'Saving...' : 'Save Changes'}
            </WpButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSprintModal;
