'use client';
import Panel from '@/src/app/components/common/panel/panel';
import { AssigneeAvatar } from '@/src/app/components/common/task';
import { DashboardActivity, DashboardActivityUser } from '@/src/types/dashboard';

interface RecentActivityCardProps {
  activities: DashboardActivity[];
  user?: DashboardActivityUser;
}

export default function RecentActivityCard({ activities, user }: RecentActivityCardProps) {
  const renderActivityDetails = (details: string) => {
    if (!details) return null;

    const commentMatch = details.match(/ as ([\s\S]*)$/);
    const content = commentMatch ? commentMatch[1] : details;
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

    if (isHtml) {
      return (
        <div
          className="mt-1 text-xs text-gray-500 dark:text-slate-400 prose prose-xs dark:prose-invert max-w-none break-words [&_p]:my-0.5 [&_img]:my-1 [&_img]:max-h-32 [&_img]:rounded-md [&_img]:object-contain"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <p className="mt-1 text-xs text-gray-400 dark:text-slate-500 break-words">{details}</p>
    );
  };

  return (
    <Panel title="Recent Activity">
      <div className="space-y-4 mt-2">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <AssigneeAvatar
              initials={
                user?.name
                  ? user.name
                      .split(' ')
                      .map((name) => name[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'U'
              }
              color={user?.color || ''}
              size="md"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  <span className="font-semibold text-gray-900 dark:text-slate-100">
                    {user?.name || 'User'}
                  </span>{' '}
                  <span>{activity.action}</span>{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {activity.task_key || activity.title}
                  </span>
                </div>

                <span className="shrink-0 text-xs text-gray-400 dark:text-slate-500">
                  {new Date(activity.created_at).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              {activity.details && renderActivityDetails(activity.details)}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

