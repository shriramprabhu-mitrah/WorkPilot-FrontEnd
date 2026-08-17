'use client';

import { useState } from 'react';
import { Plus, X, } from 'lucide-react';
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
    } catch { }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-md overflow-visible rounded-2xl bg-white shadow-xl">
        {/* future purpose
         {step === 1 && (
          <>
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">Add Sprints</h2>
              <WpButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="p-2"
                leftIcon={<X size={18} />}
              />
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500">How many sprints do you want to create?</p>
              <div className="mt-5 flex items-center gap-3">
                <WpButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSprintCount((prev) => Math.max(1, prev - 1))}
                  className="h-10 w-10 p-0"
                  leftIcon={<Minus size={16} />}
                />
                <div className="w-14">
                  <WpInput
                    id="sprintCount"
                    type="number"
                    min="1"
                    step="1"
                    value={sprintCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setSprintCount(0);
                        return;
                      }
                      const numberValue = Number(value);
                      if (Number.isInteger(numberValue) && numberValue > 0) {
                        setSprintCount(numberValue);
                      }
                    }}
                    className="h-10 w-14 text-center font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <WpButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSprintCount((prev) => prev + 1)}
                  className="h-10 w-10 p-0"
                  leftIcon={<Plus size={16} />}
                />
              </div>
              <p className="mt-4 text-xs text-gray-400">
                {sprintCount} sprint{sprintCount > 1 ? 's' : ''} will be created.
              </p>
            </div>
            <div className="flex justify-between border-t p-5">
              <WpButton variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </WpButton>
              <WpButton
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight size={16} />}
              >
                Next
              </WpButton>
            </div>
          </>
        )} */}
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white">

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">Configure {fields.length} Sprints</h2>
              <WpButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="p-2"
                leftIcon={<X size={18} />}
              />
            </div>
            <div className="max-h-[40vh] overflow-y-auto px-5 py-4 space-y-4">
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
            <div className="px-5 pb-3">
              <button
                type="button"
                onClick={() => {
                  append({
                    name: `Sprint ${fields.length + 1}`,
                    goal: '',
                    start_date: '',
                    end_date: '',
                  });

                  setOpenSprint(fields.length);
                }}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} />
                Add Sprint
              </button>
            </div>
            <div className="flex justify-end p-5">
              <WpButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isCreatingSprint}
              >
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
