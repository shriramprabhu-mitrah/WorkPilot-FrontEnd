'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { WpDatePicker } from '@/src/app/components/common/datepicker';
import { TaskPayload } from '@/src/types/task';
import { formatISODateTime } from '@/src/app/components/common/format';
import { useCreateTask } from '../../tasks/hooks/useTask';
import { priorityOptions, taskTypeOptions } from '@/src/app/components/common/enum';
import { useGetStatus } from '../hooks/useLabels';
import WpRichTextEditor from '@/src/app/components/common/htmlEditor';

export interface Task {
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  priority?: string;
  sprint_id?: string;
  status_id?: string;
  story_points?: number;
  estimated_hours?: number;
  actual_hours?: number;
  type?: string;
}

interface AddTaskModalProps {
  projectId: string;
  sprintId: string;
  userStoryId?: string; // Optional user story ID

  assigneeOptions: {
    label: string;
    value: string;
  }[];

  memberSearch?: string;
  onMemberSearchChange?: (value: string) => void;
  isLoadingMembers?: boolean;

  onClose: () => void;
  onCreate: (task: Task) => void;
}

interface FormValues {
  taskName: string;
  description: string;
  assignee: string;
  status_id: string;
  priority: string;
  type: string;
  dueDate: string;
  storyPoints: string;
  estimatedHours: string;
  estimatedMinutes: string;
  actualHours: string;
  actualMinutes: string;
}

const AddTaskModal = ({
  projectId,
  userStoryId,
  assigneeOptions,
  memberSearch,
  onMemberSearchChange,
  isLoadingMembers,
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
      status_id: '',
      priority: 'low',
      type: 'task',
      dueDate: '',
      storyPoints: '',
      estimatedHours: '',
      estimatedMinutes: '',
      actualHours: '',
      actualMinutes: '',
    },
  });
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const { data: statuses = [], isLoading: isLoadingStatus } = useGetStatus(projectId);
  const statusOptions = statuses.map((status) => ({
    label: status.name,
    value: status.id,
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateField = (field: keyof FormValues): boolean => {
    const value = getValues(field)?.toString().trim() ?? '';
    const requiredMessages: Partial<Record<keyof FormValues, string>> = {
      taskName: 'Task name is required',
      type: 'Type is required',
      priority: 'Priority is required',
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
    const fieldsToValidate: (keyof FormValues)[] = ['taskName', 'type', 'priority'];
    for (const field of fieldsToValidate) {
      if (!validateField(field)) {
        return;
      }
    }
    try {
      const data = getValues();

      const payload: TaskPayload = {
        title: data.taskName.trim(),
        type: data.type,
        priority: data.priority,
      };

      if (data.status_id) {
        payload.status_id = data.status_id;
      }

      if (data.estimatedHours || data.estimatedMinutes) {
        const hours = Number(data.estimatedHours) || 0;
        const minutes = Number(data.estimatedMinutes) || 0;

        payload.estimated_hours = hours + minutes / 60;
      }

      if (data.description.trim()) {
        payload.description = data.description.trim();
      }

      if (data.assignee) {
        payload.assignee_id = data.assignee;
      }

      if (data.dueDate) {
        payload.due_date = formatISODateTime(data.dueDate);
      }

      if (userStoryId) {
        payload.user_story_id = userStoryId;
      }

      if (data.storyPoints) {
        payload.story_points = Number(data.storyPoints);
      }

      if (data.actualHours || data.actualMinutes) {
        const hours = Number(data.actualHours) || 0;
        const minutes = Number(data.actualMinutes) || 0;

        payload.actual_hours = hours + minutes / 60;
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
          status_id: createdTask.status_id,
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
  const storyPointsRegister = register('storyPoints');
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 px-5 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add Task</h2>
          <WpButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={18} />
          </WpButton>
        </div>

        {/* Body */}
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
                  showRequired
                />
              )}
            />
          </div>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <WpRichTextEditor
                  value={field.value ?? ''}
                  placeholder="Optional details..."
                  minHeight="120px"
                  onChange={(html) => {
                    field.onChange(html);
                    clearFieldError('description');
                  }}
                />
                {errors.description?.message && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="relative" ref={assigneeRef}>
              <Controller
                name="assignee"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <WpInput
                      id="assignee"
                      label="Assignee"
                      placeholder="Search assignee..."
                      value={memberSearch}
                      onFocus={() => setShowAssigneeDropdown(true)}
                      onChange={(e) => {
                        onMemberSearchChange?.(e.target.value);
                        setShowAssigneeDropdown(true);
                        clearFieldError('assignee');
                      }}
                      error={errors.assignee?.message}
                    />
                    {showAssigneeDropdown && (
                      <div className="absolute z-50 mt-[-20px] w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                        {isLoadingMembers ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                            Searching...
                          </div>
                        ) : assigneeOptions.length > 0 ? (
                          assigneeOptions.map((member) => (
                            <button
                              key={member.value}
                              type="button"
                              onClick={() => {
                                field.onChange(member.value);
                                onMemberSearchChange?.(member.label);
                                setShowAssigneeDropdown(false);
                                clearFieldError('assignee');
                              }}
                              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <span>{member.label}</span>
                              {field.value === member.value && (
                                <Check size={14} className="text-blue-600 dark:text-blue-400" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                            {memberSearch ? 'No members found' : 'No members available'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            <Controller
              name="status_id"
              control={control}
              render={({ field }) => (
                <WpDropdown
                  label="Status"
                  options={statusOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError('status_id');
                  }}
                  placeholder={isLoadingStatus ? 'Loading statuses...' : 'Select status'}
                  error={errors.status_id?.message}
                  disabled={isLoadingStatus}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <WpDatePicker
                  label="Due Date"
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value) clearFieldError('dueDate');
                  }}
                  showTime
                  placeholder="Select due date and time"
                  error={errors.dueDate?.message}
                />
              )}
            />
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
                  showRequired
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WpInput
              id="storyPoints"
              label="Story Points"
              type="number"
              min="0"
              placeholder="0"
              {...storyPointsRegister}
              error={errors.storyPoints?.message}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || Number(value) >= 0) {
                  storyPointsRegister.onChange(e);
                  clearFieldError('storyPoints');
                }
              }}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                Estimated Hours
              </label>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register('estimatedHours')}
                    className="w-16 h-9 rounded-lg border border-gray-300 px-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                    h
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    {...register('estimatedMinutes')}
                    className="w-16 h-9 rounded-lg border border-gray-300 px-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                    m
                  </span>
                </div>
              </div>

              {errors.estimatedHours?.message && (
                <p className="mt-1 text-sm text-red-500">{errors.estimatedHours.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Actual Hours
            </label>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('actualHours')}
                  className="w-16 h-9 rounded-lg border border-gray-300 px-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                  h
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  {...register('actualMinutes')}
                  className="w-16 h-9 rounded-lg border border-gray-300 px-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                  m
                </span>
              </div>

              <span className="mb-2 text-sm text-gray-500 dark:text-slate-400">m</span>
            </div>

            {errors.actualHours?.message && (
              <p className="mt-1 text-sm text-red-500">{errors.actualHours.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700 px-5 py-4">
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
