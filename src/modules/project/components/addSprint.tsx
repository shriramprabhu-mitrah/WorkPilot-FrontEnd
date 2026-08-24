'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { WpButton } from '@/src/app/components/common/button';
import { useCreateSprint } from '../hooks/useSprint';
import { SprintPayload } from '@/src/types/project';
import SprintAccordionItem from './sprintAccordionItem';

const today = new Date().toISOString().split('T')[0];

const sprintItemSchema = z
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

const addSprintSchema = z.object({ sprints: z.array(sprintItemSchema) });
export type AddSprintFormValues = z.infer<typeof addSprintSchema>;

interface AddSprintModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddSprintModal = ({ projectId, onClose, onSuccess }: AddSprintModalProps) => {
  const [openSprint, setOpenSprint] = useState(0);

  const { createSprintAsync, isCreatingSprint } = useCreateSprint(projectId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddSprintFormValues>({
    resolver: zodResolver(addSprintSchema),
    defaultValues: {
      sprints: [
        {
          name: 'Sprint 1',
          goal: '',
          start_date: '',
          end_date: '',
        },
      ],
    },
  });

  const { fields, append } = useFieldArray({ control, name: 'sprints' });
  const onSubmit = async (data: AddSprintFormValues) => {
    try {
      const payload: SprintPayload = {
        sprints: data.sprints.map((s) => ({
          name: s.name,
          goal: s.goal || undefined,
          start_date: s.start_date,
          end_date: s.end_date,
        })),
      };
      await createSprintAsync(payload);
      onSuccess?.();
      onClose();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="flex w-full flex-col">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 p-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Configure {fields.length} Sprints</h2>
              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="p-2 dark:text-slate-300"
                leftIcon={<X size={18} />}
              />
            </div>

            <div className="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-4">
              {fields.map((field, index) => (
                <SprintAccordionItem
                  key={field.id}
                  index={index}
                  fieldId={field.id}
                  isOpen={openSprint === index}
                  onToggle={() => setOpenSprint(openSprint === index ? -1 : index)}
                  control={control}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>
            <div className="flex justify-end border-t border-gray-200 dark:border-slate-700 p-5">
              <WpButton type="submit" variant="primary" size="md" disabled={isCreatingSprint}>
                {isCreatingSprint ? 'Creating...' : 'Create Sprints'}
              </WpButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSprintModal;
