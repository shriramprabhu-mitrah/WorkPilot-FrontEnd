'use client';

import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import type { AddSprintFormValues } from './addSprint';

const formatShort = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

interface SprintAccordionItemProps {
  index: number;
  fieldId: string;
  isOpen: boolean;
  onToggle: () => void;
  control: Control<AddSprintFormValues>;
  register: UseFormRegister<AddSprintFormValues>;
  errors: FieldErrors<AddSprintFormValues>;
}

const SprintAccordionItem = ({
  index,
  fieldId,
  isOpen,
  onToggle,
  control,
  register,
  errors,
}: SprintAccordionItemProps) => {
  const watched = useWatch({ control, name: `sprints.${index}` });
  const sprintErrors = errors.sprints?.[index];
  const hasError = !!sprintErrors;
  const startDate = watched?.start_date;
  const endDate = watched?.end_date;
  const datePreview =
    startDate && endDate
      ? `${formatShort(startDate)} → ${formatShort(endDate)}`
      : startDate
        ? `From ${formatShort(startDate)}`
        : null;

  return (
    <div
      key={fieldId}
      className={`overflow-hidden rounded-xl border ${hasError ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-600'}`}
    >
      <WpButton
        variant="ghost"
        size="md"
        type="button"
        onClick={onToggle}
        className="w-full justify-between rounded-none p-4 text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700/50"
        rightIcon={isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${hasError ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}
          >
            {index + 1}
          </span>
          <span className="text-sm font-medium">{watched?.name || `Sprint ${index + 1}`}</span>
          {!isOpen && datePreview && <span className="text-xs text-gray-400 dark:text-slate-500">{datePreview}</span>}
          {!isOpen && hasError && (
            <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
              Incomplete
            </span>
          )}
        </div>
      </WpButton>
      {isOpen && (
        <div className="p-4 space-y-3 bg-gray-50 dark:bg-slate-700/40">
          <WpInput
            id={`sprint-name-${index}`}
            label="Sprint name"
            showRequired
            error={sprintErrors?.name?.message}
            {...register(`sprints.${index}.name`)}
          />
          <WpInput
            id={`sprint-goal-${index}`}
            label="Goal"
            {...register(`sprints.${index}.goal`)}
          />
          <div className="grid grid-cols-2 gap-3">
            <WpInput
              id={`start-date-${index}`}
              type="date"
              label="Start date"
              showRequired
              error={sprintErrors?.start_date?.message}
              {...register(`sprints.${index}.start_date`)}
            />
            <WpInput
              id={`end-date-${index}`}
              type="date"
              label="Due date"
              showRequired
              error={sprintErrors?.end_date?.message}
              {...register(`sprints.${index}.end_date`)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintAccordionItem;
