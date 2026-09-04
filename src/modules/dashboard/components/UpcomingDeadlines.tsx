import Panel from '@/src/app/components/common/panel/panel';
import { upcomingDeadlines } from '../data/recentActivityData';
import { PriorityBadge } from '@/src/app/components/common/task';

export default function UpcomingDeadlines() {
  return (
    <Panel title="Upcoming Deadlines">
      <div className="space-y-4">
        {upcomingDeadlines.map((task) => (
          <div key={task.id} className="flex items-center gap-4">
            <div className="shrink-0">
              <PriorityBadge priority={task.priority} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">
                {task.title}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-100">
                {task.project} - {task.sprint}
              </p>
            </div>

            <span className="shrink-0 text-xs font-medium text-red-500 dark:text-red-400">
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
