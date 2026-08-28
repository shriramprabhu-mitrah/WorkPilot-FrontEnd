'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { colors } from '@/src/styles/colors';
import { useTheme } from 'next-themes';
import type { DashboardTaskStatus } from '@/src/types/dashboard';

interface TaskStatusCardProps {
  taskStatus: DashboardTaskStatus;
}

export default function TaskStatusCard({ taskStatus }: TaskStatusCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Track which statuses are hidden
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const allData = Object.entries(taskStatus).map(([name, item], index) => ({
    id: `${name}-${index}`,
    name,
    value: item.count,
    color: item.color || colors.gray400,
  }));

  // Only pass visible slices to the pie
  const visibleData = allData.filter((d) => !hidden.has(d.name));

  const hasAnyData = allData.some((d) => d.value > 0);
  const hasVisibleData = visibleData.some((d) => d.value > 0);

  const toggleStatus = (name: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Task Status</h3>
      <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">Across all active projects</p>

      {/* Pie */}
      <div
        className="flex-1 min-h-0 [&_*:focus]:outline-none [&_*:focus]:ring-0"
        style={{ height: 220 }}
      >
        {hasAnyData && hasVisibleData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                animationBegin={0}
                animationDuration={500}
              >
                {visibleData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e5e7eb',
                  color: isDark ? '#f1f5f9' : '#111827',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full flex justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[{ name: 'empty', value: 1 }]}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    <Cell fill={isDark ? '#334155' : colors.gray200} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <span
              className="text-xs mt-1"
              style={{
                color: isDark ? '#64748b' : colors.gray400,
              }}
            >
              No data
            </span>
          </div>
        )}
      </div>

      {/* Custom clickable legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
        {allData.map((entry) => {
          const isHidden = hidden.has(entry.name);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => toggleStatus(entry.name)}
              className="flex items-center gap-2 min-w-0 group text-left transition-opacity"
              style={{ opacity: isHidden ? 0.35 : 1 }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 transition-all"
                style={{
                  backgroundColor: isHidden
                    ? isDark ? '#475569' : colors.gray300
                    : entry.color,
                }}
              />
              <span className="text-xs text-gray-600 dark:text-slate-300 truncate group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">
                {entry.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
