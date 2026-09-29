import Panel from '@/src/app/components/common/panel/panel';
import { PriorityBadge } from '@/src/app/components/common/task';
import { useGetUpcomingDeadlines } from '../hooks/useDashboard';

interface UpcomingDeadlinesProps {
  projectId: string;
  sprintId?: string;
}

const getDeadlineStatus = (status: string) => {
  switch (status) {
    case 'due_today':
      return {
        icon: '⚠️',
        label: 'Due Today',
        className: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
      };

    case 'overdue':
      return {
        icon: '⚠️',
        label: 'Overdue',
        className: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
      };

    case 'upcoming':
      return {
        icon: '📅',
        label: 'Upcoming',
        className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      };

    default:
      return {
        icon: '📅',
        label: status,
        className: 'bg-gray-50 text-gray-600 dark:bg-slate-700/50 dark:text-slate-300',
      };
  }
};

export default function UpcomingDeadlines({
  projectId,
  sprintId,
}: UpcomingDeadlinesProps) {
  const {
    upcomingDeadlines,
    isLoadingUpcomingDeadlines,
  } = useGetUpcomingDeadlines(projectId, sprintId);

  return (
    <Panel title="Upcoming Deadlines">
      <div className="space-y-3">
        {isLoadingUpcomingDeadlines ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-2"
              >
                <div className="h-5 w-14 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />

                <div className="min-w-0 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                </div>

                <div className="flex justify-end">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingDeadlines.length > 0 ? (
          upcomingDeadlines.map((task) => {
            const deadline = getDeadlineStatus(task.deadline_status);

            return (
              <div
                key={task.id}
                className="grid grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-2"
              >
                {/* Priority */}
                <div className="flex w-[70px] shrink-0 justify-start">
                  <PriorityBadge priority={task.priority} />
                </div>

                {/* Task Details */}
                <div className="min-w-0">
                  <p
                    title={task.title}
                    className="truncate text-sm font-medium text-gray-900 dark:text-slate-100"
                  >
                    {task.title}
                  </p>

                  <div
                    title={`${task.key} - ${task.sprint_name || 'No Sprint'}`}
                    className="mt-0.5 flex min-w-0 items-center gap-1 text-xs"
                  >
                    {/* Task Key */}
                    <span className="shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                      {task.key}
                    </span>

                    {/* Sprint */}
                    {task.sprint_name && (
                      <>
                        <span className="text-gray-300 dark:text-slate-600">
                          •
                        </span>

                        <span className="truncate text-gray-400 dark:text-slate-400">
                          {task.sprint_name}
                        </span>
                      </>
                    )}

                    {!task.sprint_name && (
                      <>
                        <span className="text-gray-300 dark:text-slate-600">
                          •
                        </span>

                        <span className="text-gray-400 dark:text-slate-400">
                          No Sprint
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex justify-end">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${deadline.className}`}
                  >
                    <span className="text-xs">
                      {deadline.icon}
                    </span>

                    {deadline.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-sm text-gray-500 dark:text-slate-400">
            No upcoming deadlines
          </div>
        )}
      </div>
    </Panel>
  );
}
