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

const editSprintSchema = z
  .object({
    name: z.string().min(1, 'Sprint name is required'),
    goal: z.string().optional(),
    start_date: z
      .string()
      .min(1, 'Start date is required')
      .refine((d) => d >= today, { message: 'Start date cannot be in the past' }),
    end_date: z.string().min(1, 'Due date is required'),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: 'Due date must be after start date',
    path: ['end_date'],
  });

type EditSprintForm = z.infer<typeof editSprintSchema>;

interface EditSprintModalProps {
  projectId: string;
  sprint: SprintDetail;
  onClose: () => void;
}

const EditSprintModal = ({ projectId, sprint, onClose }: EditSprintModalProps) => {
  const { updateSprintAsync, isUpdatingSprint } = useUpdateSprint(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditSprintForm>({
    resolver: zodResolver(editSprintSchema),
    defaultValues: {
      name: sprint.name,
      goal: sprint.goal ?? '',
      start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '',
      end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '',
    },
  });

  const onSubmit = async (data: EditSprintForm) => {
    try {
      await updateSprintAsync({ sprintId: sprint.id, payload: data });
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
                type="date"
                label="Start date"
                showRequired
                error={errors.start_date?.message}
                {...register('start_date')}
              />
              <WpInput
                id="edit-end-date"
                type="date"
                label="Due date"
                showRequired
                error={errors.end_date?.message}
                {...register('end_date')}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t p-5">
            <WpButton type="button" variant="ghost" size="sm" onClick={onClose}>
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
