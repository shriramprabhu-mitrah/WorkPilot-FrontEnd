'use client';
import { colors } from '@/src/styles/colors';
import Panel from '@/src/app/components/common/panel/panel';
import { AssigneeAvatar } from '@/src/app/components/common/task';
import { DashboardActivity, DashboardActivityUser } from '@/src/types/dashboard';

interface RecentActivityCardProps {
  activities: DashboardActivity[];
  user?: DashboardActivityUser;
}

export default function RecentActivityCard({ activities, user }: RecentActivityCardProps) {
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

              {activity.details && (
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{activity.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
