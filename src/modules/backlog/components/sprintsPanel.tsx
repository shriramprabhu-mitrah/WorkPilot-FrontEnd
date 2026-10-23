import { Plus, Search, Zap } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';

import { SprintDetail } from '@/src/types/project';
import { TaskResponse } from '@/src/types/task';
import { UserStoryResponse } from '@/src/types/userstories';
import { SPRINT_TABS } from '../utils/backlogUtils';
import type { SprintsSection } from '../hooks/useBacklogLists';
import SprintSkeleton from './SprintSkeleton';
import { SprintDropZone } from './SprintDropZone';

interface Props {
  projectId: string;
  sprints: SprintsSection;
  canCreate: boolean;
  activeDragType: 'task' | 'story' | null;
  completingSprintId: string | null;
  onNewSprint: () => void;
  onStoryClick: (story: UserStoryResponse) => void;
  onTaskClick: (task: TaskResponse) => void;
  onStartSprint: (sprint: SprintDetail) => void;
  onCompleteSprint: (sprint: SprintDetail) => void;
}

export const SprintsPanel = ({
  projectId,
  sprints,
  canCreate,
  activeDragType,
  completingSprintId,
  onNewSprint,
  onStoryClick,
  onTaskClick,
  onStartSprint,
  onCompleteSprint,
}: Props) => {
  const { items, isLoading, status, setStatus, search, setSearch } = sprints;

  return (
    <div
      className="w-full lg:w-[clamp(400px,40vw,800px)] flex-none min-w-0 overflow-y-auto [scrollbar-width:thin] pr-0 sm:pr-1 border-t lg:border-t-0 lg:border-l dark:border-slate-700 pt-4 lg:pt-0 lg:pl-4"
      style={{ minHeight: '400px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Zap size={18} />
          </span>
          <h2 className="font-semibold text-lg text-gray-900 dark:text-slate-100">Sprints</h2>
          <span className="text-xs text-gray-400 dark:text-slate-300">
            {items.length} {items.length === 1 ? 'sprint' : 'sprints'}
          </span>
        </div>
        {canCreate && projectId && (
          <WpButton
            size="sm"
            variant="primary"
            leftIcon={<Plus size={14} />}
            onClick={onNewSprint}
            className="!py-1 !px-2 text-xs"
          >
            New
          </WpButton>
        )}
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-gray-200 bg-gray-200 dark:border-slate-700 dark:bg-slate-700/50 shrink-0">
          {SPRINT_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                status === tab.key
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <WpInput
          type="text"
          placeholder="Search sprints..."
          icon={<Search size={14} className="dark:text-slate-100" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="flex-1 min-w-0"
        />
      </div>

      {isLoading ? (
        <SprintSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-gray-500 dark:text-slate-200 text-center">
            {!projectId
              ? 'Select a project to view sprints.'
              : 'No sprints found. Create a sprint to organize user stories.'}
          </p>
        </div>
      ) : (
        items.map((sprint) => (
          <SprintDropZone
            key={sprint.id}
            sprint={sprint}
            projectId={projectId}
            activeDragType={activeDragType}
            onStoryClick={onStoryClick}
            onTaskClick={onTaskClick}
            onStartSprint={onStartSprint}
            onCompleteSprint={onCompleteSprint}
            isCompletingSprint={completingSprintId === sprint.id}
          />
        ))
      )}
    </div>
  );
};
