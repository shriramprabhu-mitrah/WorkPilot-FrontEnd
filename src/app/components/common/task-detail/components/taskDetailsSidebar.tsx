'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Bug, Check, ChevronDown } from 'lucide-react';
import { DetailRow } from './detail-row';
import { EditableDate, EditableNumber, EditablePriority, EditableLabels } from './editable-fields';

import { TaskData, TaskLabel } from '@/src/types/task';
import {
  AssigneeField,
  ReporterField,
  SprintField,
  UserStoryField,
  AssigneePatch,
  ReporterPatch,
} from './taskDetailFields';
interface TaskDetailsSidebarProps {
  taskData: TaskData;
  resolvedProjectId: string;
  resolvedTaskId: string;
  canEditTask: boolean;
  canViewUserStories: boolean;
  currentUser?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
  isAssigning: boolean;
  handleUpdate: (patch: Partial<TaskData>) => Promise<boolean>;
  handleAssigneeUpdate: (patch: AssigneePatch) => Promise<void>;
  handleReporterUpdate: (patch: ReporterPatch) => Promise<boolean>;
  handleAssignToMe: () => void;
  taskTypeOptions: Array<{
    value: string;
    label: string;
  }>;
  isLoadingStatus?: boolean;
  estimatedHoursInput: string;
  setEstimatedHoursInput: (value: string) => void;
  estimatedMinutesInput: string;
  setEstimatedMinutesInput: (value: string) => void;
  actualHoursInput: string;
  setActualHoursInput: (value: string) => void;
  actualMinutesInput: string;
  setActualMinutesInput: (value: string) => void;
}

export default function TaskDetailsSidebar({
  taskData,
  resolvedProjectId,
  resolvedTaskId,
  canEditTask,
  canViewUserStories,
  currentUser,
  isAssigning,
  handleUpdate,
  handleAssigneeUpdate,
  handleReporterUpdate,
  handleAssignToMe,
  taskTypeOptions,
  estimatedHoursInput,
  setEstimatedHoursInput,
  estimatedMinutesInput,
  setEstimatedMinutesInput,
  actualHoursInput,
  setActualHoursInput,
  actualMinutesInput,
  setActualMinutesInput,
}: TaskDetailsSidebarProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const isDueDateExpired = useMemo(() => {
    if (!taskData.dueDate) return false;

    const dueDate = new Date(taskData.dueDate);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  }, [taskData.dueDate]);

  return (
    <div className="overflow-y-auto bg-gray-50/60 dark:bg-slate-950/50">
      <div className="px-5 py-5 border-b border-gray-200 dark:border-slate-700">
        <p className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-2">Details</p>

        <AssigneeField
          projectId={resolvedProjectId}
          assigneeId={taskData.assigneeId}
          assigneeName={taskData.assigneeName}
          assigneeInitials={taskData.assignee ?? ''}
          assigneeColor={taskData.assigneeColor}
          canEditTask={canEditTask}
          currentUserName={currentUser?.name || currentUser?.username || currentUser?.email}
          isAssigning={isAssigning}
          handleUpdate={handleAssigneeUpdate}
          handleAssignToMe={handleAssignToMe}
        />

        <ReporterField
          projectId={resolvedProjectId}
          reporterId={taskData.reporterId}
          reporterName={taskData.reporterName}
          reporterInitials={taskData.reporterInitials}
          reporterColor={taskData.reporterColor}
          canEditTask={canEditTask}
          handleUpdate={handleReporterUpdate}
        />

        <DetailRow label="Type">
          <div className="relative">
            <button
              type="button"
              disabled={!canEditTask}
              onClick={() => setShowTypeMenu((prev) => !prev)}
              className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg transition-colors w-full text-left"
            >
              <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-slate-300 capitalize">
                {taskData.taskType?.toLowerCase() === 'bug' && (
                  <Bug size={14} className="text-red-500 shrink-0" />
                )}

                {taskTypeOptions.find((option) => option.value === taskData.taskType)?.label ||
                  taskData.taskType ||
                  '—'}
              </span>

              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {showTypeMenu && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-gray-800">
                {taskTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={async () => {
                      setShowTypeMenu(false);
                      await handleUpdate({ taskType: option.value });
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    {option.label}

                    {taskData.taskType === option.value && (
                      <Check size={14} className="ml-auto text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DetailRow>

        <DetailRow label="Priority">
          <EditablePriority
            value={taskData.priority}
            onChange={(priority) => handleUpdate({ priority })}
            disabled={!canEditTask}
          />
        </DetailRow>

        <SprintField
          projectId={taskData.project_id}
          sprintId={taskData.sprint_id}
          sprintName={taskData.sprint}
          canEditTask={canEditTask}
          handleUpdate={handleUpdate}
        />

        <UserStoryField
          projectId={taskData.project_id}
          userStoryId={taskData.user_story_id}
          userStoryTitle={taskData.user_story_title}
          canEditTask={canEditTask}
          canViewUserStories={canViewUserStories}
          handleUpdate={handleUpdate}
        />

        <DetailRow label="Labels">
          <EditableLabels
            projectId={resolvedProjectId}
            taskId={resolvedTaskId}
            value={
              Array.isArray(taskData.labels)
                ? taskData.labels.map((label: string | TaskLabel) =>
                    typeof label === 'string' ? label : label.id
                  )
                : []
            }
            onChange={(labelIds) => handleUpdate({ labels: labelIds as unknown as TaskLabel[] })}
            disabled={!canEditTask}
          />
        </DetailRow>

        <DetailRow label="Due date">
          {isDueDateExpired && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-sm text-red-600 dark:bg-gray-100">
              <AlertTriangle size={14} />
              <EditableDate
                value={taskData.dueDate}
                onChange={(dueDate) => handleUpdate({ dueDate })}
                placeholder="Set due date"
                includeTime={false}
                disabled={!canEditTask}
              />
            </div>
          )}

          {!isDueDateExpired && (
            <EditableDate
              value={taskData.dueDate}
              onChange={(dueDate) => handleUpdate({ dueDate })}
              placeholder="Set due date"
              includeTime={false}
              disabled={!canEditTask}
            />
          )}
        </DetailRow>

        <DetailRow label="Story pts">
          <EditableNumber
            value={taskData.storyPoints}
            onChange={(storyPoints) => handleUpdate({ storyPoints })}
            disabled={!canEditTask}
          />
        </DetailRow>

        <DetailRow label="Estimated Hours">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                min={0}
                value={estimatedHoursInput}
                onChange={(e) => {
                  const hours = Number(e.target.value) || 0;
                  setEstimatedHoursInput(e.target.value);

                  const minutes = Number(estimatedMinutesInput) || 0;
                  void handleUpdate({
                    estimatedHours: hours + minutes / 60,
                  });
                }}
                className="w-16 px-2.5 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:border-blue-500"
                placeholder="0"
                disabled={!canEditTask}
              />
              <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                hr
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={0}
                max={59}
                value={estimatedMinutesInput}
                onChange={(e) => {
                  const minutes = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                  setEstimatedMinutesInput(e.target.value);

                  const hours = Number(estimatedHoursInput) || 0;
                  void handleUpdate({
                    estimatedHours: hours + minutes / 60,
                  });
                }}
                className="w-16 px-2.5 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:border-blue-500"
                placeholder="0"
                disabled={!canEditTask}
              />
              <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                min
              </span>
            </div>
          </div>
        </DetailRow>

        <DetailRow label="Actual Hours">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                min={0}
                value={actualHoursInput}
                onChange={(e) => {
                  const hours = Number(e.target.value) || 0;
                  setActualHoursInput(e.target.value);

                  const minutes = Number(actualMinutesInput) || 0;
                  void handleUpdate({
                    actualHours: hours + minutes / 60,
                  });
                }}
                className="w-16 px-2.5 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:border-blue-500"
                placeholder="0"
                disabled={!canEditTask}
              />
              <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                hr
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={0}
                max={59}
                value={actualMinutesInput}
                onChange={(e) => {
                  const minutes = Math.min(59, Math.max(0, Number(e.target.value) || 0));
                  setActualMinutesInput(e.target.value);

                  const hours = Number(actualHoursInput) || 0;
                  void handleUpdate({
                    actualHours: hours + minutes / 60,
                  });
                }}
                className="w-16 px-2.5 py-1.5 text-sm border rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:outline-none focus:border-blue-500"
                placeholder="0"
                disabled={!canEditTask}
              />
              <span className="absolute -top-2 left-2 px-1 text-[11px] font-medium text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 pointer-events-none leading-none">
                min
              </span>
            </div>
          </div>
        </DetailRow>
      </div>
    </div>
  );
}
