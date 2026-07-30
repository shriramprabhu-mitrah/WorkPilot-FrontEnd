import { useState } from 'react';
import { Send } from 'lucide-react';
import type { ActivityItem } from '@/src/types/board';
import { colors } from '@/src/styles/colors';
import { AssigneeAvatar } from '../../task';

type ActivityTab = 'all' | 'comments' | 'history';

export const ActivitySection = ({ items }: { items: ActivityItem[] }) => {
  const [tab, setTab] = useState<ActivityTab>('all');
  const [comment, setComment] = useState('');
  const [localItems, setLocalItems] = useState<ActivityItem[]>(items);

  const tabs: Array<{ key: ActivityTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'comments', label: 'Comments' },
    { key: 'history', label: 'History' },
  ];

  const filtered = localItems.filter((item) => {
    if (tab === 'all') return true;
    if (tab === 'comments') return item.type === 'comment';
    return item.type === 'history';
  });

  const submitComment = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;

    const newItem: ActivityItem = {
      id: `c-${Date.now()}`,
      user: 'You',
      userInitials: 'Y',
      userColor: colors.avatarIndigo,
      action: 'commented',
      timestamp: 'Just now',
      type: 'comment',
      comment: trimmed,
    };

    setLocalItems((previous) => [...previous, newItem]);
    setComment('');
  };

  return (
    <section>
      <p className="text-base font-semibold text-gray-800 mb-3">Activity</p>

      <div className="flex items-center gap-1 mb-4 border-b border-gray-300 pb-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
            style={{
              backgroundColor: tab === tabItem.key ? colors.primaryLight : 'transparent',
              color: tab === tabItem.key ? colors.primary : colors.gray500,
              border: `1px solid ${tab === tabItem.key ? colors.primary : 'transparent'}`,
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-5">
        {filtered.length === 0 && <p className="text-sm text-gray-400">No activity yet.</p>}
        {filtered.map((item) => (
          <div key={item.id} className="flex gap-3">
            <AssigneeAvatar initials={item.userInitials} color={item.userColor} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-800">{item.user}</span>
                <span className="text-xs text-gray-500">{item.action}</span>
                {item.target && (
                  <span className="text-xs font-semibold text-gray-700">{item.target}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{item.timestamp}</p>
              {item.comment && (
                <p className="mt-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 leading-relaxed">
                  {item.comment}
                </p>
              )}
              {item.type === 'history' && (
                <span
                  className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.gray100, color: colors.gray500 }}
                >
                  HISTORY
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-end">
        <AssigneeAvatar initials="Y" color={colors.avatarIndigo} size="md" />
        <div className="flex-1 relative">
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitComment();
              }
            }}
            placeholder="Add a comment…"
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-10 resize-none focus:outline-none focus:ring-2 focus:border-blue-500"
          />
          <button
            onClick={submitComment}
            disabled={!comment.trim()}
            className="absolute right-2 bottom-2 p-1 rounded-lg transition-colors disabled:opacity-30"
            style={{ color: colors.primary }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
