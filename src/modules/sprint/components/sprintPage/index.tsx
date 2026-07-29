'use client';

import SprintStatsCard from '../sprintStatsCard';
import ProgressCard from '../ProgressCard';
import TaskColumn from '../taskColumn';
import WorkloadItem from '../workloadItem';
import { WpButton } from '@/src/app/components/common/button';
import { sprintStats, progressCards, taskColumns, workload } from '../../data/sprint';
import { useState } from 'react';
import { sprints } from '../../data/sprint';
const SprintPage = () => {
  const [selectedSprint, setSelectedSprint] = useState('Sprint 1');
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[17px] font-bold shadow-sm hover:bg-gray-50"
            >
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.name} className="text-[16px]">
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Complete authentication refactor and ship onboarding v2.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-green-50 px-3 text-sm font-medium text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Active
          </span>
          <WpButton variant="secondary" size="sm" className="h-10 px-4">
            Complete Sprint
          </WpButton>

          <WpButton size="sm" className="h-10 px-4">
            + Add Task
          </WpButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {sprintStats.map((task) => (
          <SprintStatsCard
            key={task.title}
            value={task.value}
            title={task.title}
            valueColor={task.valueColor}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {progressCards.map((card) => (
          <ProgressCard
            key={card.title}
            title={card.title}
            progress={card.progress}
            progressColor={card.progressColor}
            rightLabel={card.rightLabel}
            subtitle={card.subtitle}
            startDate={card.startDate}
            endDate={card.endDate}
          />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Task Status Board</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          {taskColumns.map((column) => (
            <TaskColumn key={column.status} column={column} />
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Team Workload in Sprint</h2>

        <div className="space-y-1">
          {workload.map((member) => (
            <WorkloadItem key={member.name} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SprintPage;
