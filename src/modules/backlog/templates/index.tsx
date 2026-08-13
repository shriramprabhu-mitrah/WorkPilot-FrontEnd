'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
import { BacklogRow } from '../components/BacklogRow';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import BacklogSkeleton from '../components/backlogSkeleton';
import Image from 'next/image';
import { useGetTasks } from '@/src/modules/tasks/hooks/useTask';
import AddTaskModal from '@/src/modules/project/components/addTaskModel';
import { useAppSelector } from '@/src/store';
import { TaskDetailDrawer } from '@/src/app/components/common/task-detail';
import { ColumnId, KanbanTask } from '@/src/types/board';
import { TaskResponse } from '@/src/types/task';
import { ProjectDetailMember } from '@/src/types/project';

export const BacklogTemplate = () => {
  const [backlogOpen, setBacklogOpen] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [search, setSearch] = useState('');

  const selectedApiProject = useAppSelector((state) => state.project.selectedProject);
  const selectedSprintStore = useAppSelector((state) => state.project.selectedSprint);
  const selectedProject = selectedApiProject?.id ?? '';
  const selectedSprint = selectedSprintStore?.id ?? '';

  const assigneeOptions =
    selectedApiProject?.members?.map((member: ProjectDetailMember) => ({
      label: member.full_name || member.username,
      value: member.user_id,
    })) ?? [];

  const { tasksList, isLoadingTasks } = useGetTasks(
    selectedProject,
    { sprint_id: selectedSprint || undefined },
    !!selectedProject
  );

  const mapTaskToDrawerTask = (task: TaskResponse): KanbanTask => ({
    id: task.key ?? '',
    taskId: task.id ?? '',
    projectId: task.project_id ?? '',
    title: task.title ?? '',
    columnId:
      ((task.status?.toLowerCase().replace(/\s+/g, '') === 'inprogress'
        ? 'in_progress'
        : task.status?.toLowerCase().replace(/\s+/g, '')) as ColumnId) || 'todo',
    description: task.description ?? '',
    priority: task.priority
      ? ((task.priority.charAt(0).toUpperCase() +
          task.priority.slice(1).toLowerCase()) as KanbanTask['priority'])
      : 'Medium',
    labels: [],
    dueDate: task.due_date ?? '',
    startDate: task.start_date ?? '',
    storyPoints: task.story_points ?? task.estimated_hours ?? 0,
    sprint: task.sprint_name ?? '',
    parent: '',
    subtasks: [],
    assigneeInitials: task.assignee_name ? task.assignee_name.substring(0, 2).toUpperCase() : 'UN',
    assigneeColor: '#3B82F6',
    reporter: '',
    reporterInitials: '',
    reporterColor: undefined,
    activity: [],
  });

  const q = search.toLowerCase();
  const activeTasks = selectedProject ? tasksList || [] : [];
  const filteredBacklog = activeTasks.filter(
    (t: TaskResponse) => t.title?.toLowerCase().includes(q) || t.id?.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 flex-shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: colors.gray900 }}>
            Backlog
          </h1>
          {selectedApiProject && (
            <p className="text-sm mt-0.5 truncate" style={{ color: colors.gray500 }}>
              {selectedApiProject.name}
              {selectedSprintStore ? ` · ${selectedSprintStore.name}` : ' · All Sprints'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <WpInput
            type="text"
            placeholder="Search tasks..."
            icon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="w-full sm:w-40"
            className="!py-1.5"
          />
          <WpButton
            size="sm"
            leftIcon={<Plus size={14} />}
            disabled={!selectedProject}
            onClick={() => setShowAddTaskModal(true)}
          >
            <span className="hidden sm:inline">Create User Story</span>
            <span className="sm:hidden">Sprint</span>
          </WpButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1">
        {isLoadingTasks && selectedProject ? (
          <div className="mt-4">
            <BacklogSkeleton />
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-3">
            <div
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
              onClick={() => setBacklogOpen((v) => !v)}
            >
              <span className="text-gray-400 shrink-0">
                {backlogOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <span className="font-semibold text-sm" style={{ color: colors.gray900 }}>
                Backlog
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                style={{ color: colors.gray500, backgroundColor: colors.gray100 }}
              >
                {filteredBacklog.length} issues
              </span>
            </div>

            {backlogOpen && (
              <div>
                {filteredBacklog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Image
                      src="/images/Multitasking-rafiki.svg"
                      alt="No Tasks"
                      width={300}
                      height={200}
                      className="h-90 w-90"
                    />
                    <h2 className="mt-4 text-lg font-bold text-gray-900">
                      {!selectedProject ? 'Please select a project' : 'No backlogs found'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {!selectedProject
                        ? 'Select a project to view its backlogs.'
                        : 'Create your first backlog task and track progress.'}
                    </p>
                  </div>
                ) : (
                  filteredBacklog.map((task: TaskResponse) => (
                    <BacklogRow
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(mapTaskToDrawerTask(task))}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddTaskModal && (
        <AddTaskModal
          projectId={selectedProject}
          sprintId={selectedSprint}
          assigneeOptions={assigneeOptions}
          onClose={() => setShowAddTaskModal(false)}
          onCreate={() => setShowAddTaskModal(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};
