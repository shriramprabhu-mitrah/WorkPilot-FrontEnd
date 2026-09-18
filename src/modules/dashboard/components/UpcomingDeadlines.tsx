import Panel from '@/src/app/components/common/panel/panel';
import { upcomingDeadlines } from '../data/recentActivityData';
import { PriorityBadge } from '@/src/app/components/common/task';

export default function UpcomingDeadlines() {
  return (
    <Panel title="Upcoming Deadlines">
      <div className="space-y-4">
        {upcomingDeadlines.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-[70px_minmax(0,1fr)_90px] items-center gap-4"
          >
            <div className="w-[70px] shrink-0 flex justify-start">
              <PriorityBadge priority={task.priority} />
            </div>

            <div className="min-w-0">
              <p
                title={task.title}
                className="truncate text-sm font-medium text-gray-900 dark:text-slate-100"
              >
                {task.title}
              </p>

              <p className="mt-1 truncate text-xs text-gray-400 dark:text-slate-100">
                {task.project} - {task.sprint}
              </p>
            </div>

            <div className="w-[90px] shrink-0 flex justify-end">
              <span className="truncate text-xs font-medium text-red-500 dark:text-red-400">
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
