'use client';
import Panel from '@/src/app/components/common/panel/panel';
import { AssigneeAvatar } from '@/src/app/components/common/task';
import { DashboardActivity, DashboardActivityUser } from '@/src/types/dashboard';

interface RecentActivityCardProps {
  activities: DashboardActivity[];
  user?: DashboardActivityUser;
}

export default function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const renderActivityDetails = (details: string) => {
    if (!details) return null;

    const commentMatch = details.match(/ as ([\s\S]*)$/);
    const content = commentMatch ? commentMatch[1] : details;
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
      return (
        <div
          className="mt-1 rounded-lg bg-gray-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-gray-500 dark:text-slate-400 prose prose-xs dark:prose-invert max-w-none break-words [&_p]:my-0.5 [&_img]:my-1 [&_img]:max-h-32 [&_img]:rounded-md [&_img]:object-contain"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <p className="mt-1 rounded-lg bg-gray-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-gray-500 dark:text-slate-300 break-words">
        {details}
      </p>
    );
  };

  const formatTimestamp = (date: string) =>
    new Date(date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

  return (
    <Panel title="Recent Activity">
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">No recent activity yet</p>
        </div>
      ) : (
        <ul className="relative mt-2">
          {activities.map((activity, idx) => (
            <li key={activity.id} className="relative flex items-start gap-3 pb-3 last:pb-0">
              {idx !== activities.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px bg-gray-200 dark:bg-slate-700"
                />
              )}

              <div className="relative z-10 shrink-0">
                <AssigneeAvatar
                  initials={
                    activity?.user?.name
                      ? activity.user.name
                          .split(' ')
                          .map((name) => name[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U'
                  }
                  color={activity?.user?.color || ''}
                  size="md"
                />
              </div>

              <div className="min-w-0 flex-1 rounded-lg px-2 py-1 -mx-2 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm leading-snug text-gray-700 dark:text-slate-300">
                    <span className="font-semibold text-gray-900 dark:text-slate-100">
                      {activity?.user?.name || 'User'}
                    </span>{' '}
                    <span>{activity.action}</span>{' '}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {activity.task_key || activity.title}
                    </span>
                  </div>

                  <span className="shrink-0 whitespace-nowrap text-xs text-gray-400 dark:text-slate-200">
                    {formatTimestamp(activity.created_at)}
                  </span>
                </div>

                {activity.details && renderActivityDetails(activity.details)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
