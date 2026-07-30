'use client';

import Panel from '@/src/app/components/common/panel/panel';
import { AssigneeAvatar } from '@/src/app/components/common/task';
import { recentActivities } from '../data/recentActivityData';

export default function RecentActivityCard() {
  return (
    <Panel title="Recent Activity">
      <div className="space-y-4 mt-2">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <AssigneeAvatar initials={activity.initials} color={activity.avatarColor} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                  <span>{activity.action}</span>{' '}
                  <span className="font-semibold text-blue-600">{activity.taskId}</span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{activity.time}</span>
              </div>
              {activity.fromStatus && activity.toStatus && (
                <p className="mt-1 text-xs text-gray-400">
                  {activity.fromStatus} → {activity.toStatus}
                </p>
              )}
              {activity.comment && <p className="mt-1 text-xs text-gray-400">{activity.comment}</p>}
              {activity.description && (
                <p className="mt-1 text-xs text-gray-400">{activity.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
