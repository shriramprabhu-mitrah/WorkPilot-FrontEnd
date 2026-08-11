'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { WpDatePicker } from '@/src/app/components/common/datepicker';
import { statusOptions } from '../data/project';
import { TaskPayload } from '@/src/types/task';
import { formatISODateTime } from '@/src/app/components/common/format';
import { useCreateTask } from '../../tasks/hooks/useTask';
import { priorityOptions, taskTypeOptions } from '@/src/app/components/common/enum';

export interface Task {
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  priority?: string;
  sprint_id?: string;
  status?: string;
  story_points?: number;
  estimated_hours?: number;
  actual_hours?: number;
  type?: string;
}

interface AddTaskModalProps {
  projectId: string;
  sprintId: string;
  assigneeOptions: {
    label: string;
    value: string;
  }[];
  onClose: () => void;
  onCreate: (task: Task) => void;
}

interface FormValues {
  taskName: string;
  description: string;
  assignee: string;
  status: string;
  priority: string;
  type: string;
  dueDate: string;
  storyPoints: string;
  estimatedHours: string;
  actualHours: string;
}

const AddTaskModal = ({
  projectId,
  sprintId,
  assigneeOptions,
  onClose,
  onCreate,
}: AddTaskModalProps) => {
  const { createTaskAsync, isCreatingTask } = useCreateTask(projectId);
  const {
    control,
    register,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      taskName: '',
      description: '',
      assignee: '',
      status: 'todo',
      priority: 'low',
      type: 'task',
      dueDate: '',
      storyPoints: '',
      estimatedHours: '',
      actualHours: '',
    },
  });

  const validateField = (field: keyof FormValues): boolean => {
    const value = getValues(field)?.toString().trim() ?? '';
    const requiredMessages: Partial<Record<keyof FormValues, string>> = {
      taskName: 'Task name is required',
      type: 'Type is required',
      assignee: 'Assignee is required',
      status: 'Status is required',
      priority: 'Priority is required',
      storyPoints: 'Story points are required',
      estimatedHours: 'Estimated hours are required',
      actualHours: 'Actual hours are required',
      dueDate: 'Due date is required',
    };
    if (!value && requiredMessages[field]) {
      setError(field, {
        type: 'required',
        message: requiredMessages[field],
      });
      return false;
    }
    if (field === 'taskName') {
      if (value.length < 3) {
        setError(field, {
          type: 'minLength',
          message: 'Task name must be at least 3 characters',
        });
        return false;
      }
    }
    if (field === 'storyPoints' || field === 'estimatedHours' || field === 'actualHours') {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue)) {
        setError(field, {
          type: 'value',
          message: 'Enter a valid number',
        });
        return false;
      }
      if (field === 'storyPoints') {
        if (numberValue < 0) {
          setError(field, {
            type: 'min',
            message: 'Story points cannot be negative',
          });
          return false;
        }
        if (!Number.isInteger(numberValue)) {
          setError(field, {
            type: 'integer',
            message: 'Story points must be a whole number',
          });
          return false;
        }
      }
      if (field === 'estimatedHours' && numberValue <= 0) {
        setError(field, {
          type: 'min',
          message: 'Estimated hours must be greater than 0',
        });
        return false;
      }
      if (field === 'actualHours' && numberValue < 0) {
        setError(field, {
          type: 'min',
          message: 'Actual hours cannot be negative',
        });
        return false;
      }
    }
    if (field === 'dueDate' && Number.isNaN(new Date(value).getTime())) {
      setError(field, {
        type: 'value',
        message: 'Please select a valid due date',
      });
      return false;
    }
    clearErrors(field);
    return true;
  };

  const clearFieldError = (field: keyof FormValues) => {
    if (errors[field]) {
      clearErrors(field);
    }
  };

  const handleSave = async () => {
    const fieldsToValidate: (keyof FormValues)[] = [
      'taskName',
      'type',
      'assignee',
      'status',
      'priority',
      'storyPoints',
      'estimatedHours',
      'actualHours',
      'dueDate',
    ];
    for (const field of fieldsToValidate) {
      if (!validateField(field)) {
        return;
      }
    }
    try {
      const data = getValues();
      const payload: TaskPayload = {
        title: data.taskName.trim(),
        status: data.status,
        type: data.type,
        priority: data.priority,
        estimated_hours: Number(data.estimatedHours),
      };
      if (data.description.trim()) {
        payload.description = data.description.trim();
      }
      if (data.assignee) {
        payload.assignee_id = data.assignee;
      }
      if (data.dueDate) {
        payload.due_date = formatISODateTime(data.dueDate);
      }
      if (sprintId) {
        payload.sprint_id = sprintId;
      }
      if (data.storyPoints) {
        payload.story_points = Number(data.storyPoints);
      }
      if (data.actualHours) {
        payload.actual_hours = Number(data.actualHours);
      }
      const response = await createTaskAsync(payload);
      const createdTask = response.data?.[0];
      if (createdTask) {
        onCreate({
          title: createdTask.title ?? '',
          description: createdTask.description,
          assignee_id: createdTask.assignee_id,
          due_date: createdTask.due_date,
          priority: createdTask.priority,
          sprint_id: createdTask.sprint_id,
          status: createdTask.status,
          story_points: createdTask.story_points,
          estimated_hours: createdTask.estimated_hours,
          actual_hours: createdTask.actual_hours,
          type: createdTask.type,
        });
      }
      onClose();
    } catch (error) {}
  };
  const taskNameRegister = register('taskName');
  const descriptionRegister = register('description');
  const storyPointsRegister = register('storyPoints');
  const estimatedHoursRegister = register('estimatedHours');
  const actualHoursRegister = register('actualHours');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
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
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <WpInput
              id="taskName"
              label="Task name"
              placeholder="Enter task name"
              showRequired
              {...taskNameRegister}
              error={errors.taskName?.message}
              onChange={(e) => {
                taskNameRegister.onChange(e);
                clearFieldError('taskName');
              }}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <WpDropdown
                  label="Type"
                  options={taskTypeOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError('type');
                  }}
                  placeholder="Select type"
                  error={errors.type?.message}
                />
              )}
            />
          </div>
          <WpInput
            id="description"
            label="Description"
            placeholder="Optional details..."
            {...descriptionRegister}
            error={errors.description?.message}
            onChange={(e) => {
              descriptionRegister.onChange(e);
              clearFieldError('description');
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="assignee"
              control={control}
              render={({ field }) => (
                <WpDropdown
                  label="Assignee"
                  options={assigneeOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError('assignee');
                  }}
                  placeholder="Select assignee"
                  error={errors.assignee?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <WpDropdown
                  label="Status"
                  options={statusOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError('status');
                  }}
                  placeholder="Select status"
                  error={errors.status?.message}
                />
              )}
            />
          </div>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <WpDatePicker
                label="Due Date"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  if (value) {
                    clearFieldError('dueDate');
                  }
                }}
                showTime
                placeholder="Select due date and time"
                error={errors.dueDate?.message}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <WpDropdown
                  label="Priority"
                  options={priorityOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError('priority');
                  }}
                  placeholder="Select priority"
                  error={errors.priority?.message}
                />
              )}
            />
            <WpInput
              id="storyPoints"
              label="Story Points"
              type="number"
              min="0"
              placeholder="0"
              {...storyPointsRegister}
              error={errors.storyPoints?.message}
              onChange={(e) => {
                storyPointsRegister.onChange(e);
                clearFieldError('storyPoints');
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <WpInput
              id="estimatedHours"
              label="Estimated Hours"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              {...estimatedHoursRegister}
              error={errors.estimatedHours?.message}
              onChange={(e) => {
                estimatedHoursRegister.onChange(e);
                clearFieldError('estimatedHours');
              }}
            />

            <WpInput
              id="actualHours"
              label="Actual Hours"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              {...actualHoursRegister}
              error={errors.actualHours?.message}
              onChange={(e) => {
                actualHoursRegister.onChange(e);
                clearFieldError('actualHours');
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <WpButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isCreatingTask}
          >
            Cancel
          </WpButton>

          <WpButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isCreatingTask}
          >
            {isCreatingTask ? 'Creating...' : 'Save Task'}
          </WpButton>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
