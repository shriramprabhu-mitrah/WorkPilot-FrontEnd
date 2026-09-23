import Panel from '@/src/app/components/common/panel/panel';
import { PriorityBadge } from '@/src/app/components/common/task';
import { useGetUpcomingDeadlines } from '../hooks/useDashboard';

interface UpcomingDeadlinesProps {
  projectId: string;
}

export default function UpcomingDeadlines({ projectId }: UpcomingDeadlinesProps) {
  const { upcomingDeadlines, isLoadingUpcomingDeadlines } = useGetUpcomingDeadlines(projectId);
    
  
  return (
    <Panel title="Upcoming Deadlines">
      <div className="space-y-4">
        {isLoadingUpcomingDeadlines ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[70px_minmax(0,1fr)_90px] items-center gap-4"
              >
                <div className="h-5 w-14 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />

                <div className="min-w-0 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                </div>

                <div className="flex justify-end">
                  <div className="h-3 w-14 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingDeadlines.length > 0 ? (
          upcomingDeadlines.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-[70px_minmax(0,1fr)_90px] items-center gap-4"
            >
              <div className="flex w-[70px] shrink-0 justify-start">
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
                  {task.key} - {task.sprint_name}
                </p>
              </div>

              <div className="flex w-[90px] shrink-0 justify-end">
                <span className="truncate text-xs font-medium text-red-500 dark:text-red-400">
                  {task.deadline_status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
            No upcoming deadlines
          </div>
        )}
      </div>
    </Panel>
  );
}
