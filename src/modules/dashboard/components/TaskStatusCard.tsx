'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { colors } from '@/src/styles/colors';
import { useTheme } from 'next-themes';
import type { DashboardTaskStatus } from '@/src/types/dashboard';

interface TaskStatusCardProps {
  taskStatus: DashboardTaskStatus;
}

const statusColors: Record<string, string> = {
  Completed: colors.colDone,
  completed: colors.colDone,
  'In Progress': colors.colInProgress,
  Todo: colors.colTodo,
  Backlog: colors.colBacklog,
  'In Review': colors.colInReview,
  Testing: colors.colTesting,
  Blocked: colors.colBlocked,
};

export default function TaskStatusCard({
  taskStatus,
}: TaskStatusCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const statusData = Object.entries(taskStatus).map(
    ([name, item], index) => ({
      id: `${name}-${index}`,
      name,
      value: item.count,
      // Prefer backend color, fallback to frontend color
      color: item.color || statusColors[name] || colors.gray400,
    })
  );

  const hasData = Object.values(taskStatus).some(
    (item) => item.count > 0
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
        Task Status
      </h3>

      <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
        Across all active projects
      </p>

      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: isDark
                    ? '#1e293b'
                    : '#ffffff',
                  borderColor: isDark
                    ? '#334155'
                    : '#e5e7eb',
                  color: isDark
                    ? '#f1f5f9'
                    : '#111827',
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={60}
                content={({ payload }) => (
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 pb-3 text-xs">
                    {payload?.map((entry, index) => (
                      <div
                        key={`${String(entry.value)}-${index}`}
                        className="flex items-center gap-1 min-w-0"
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: entry.color,
                          }}
                        />

                        <span className="text-gray-500 dark:text-slate-300 truncate">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          /* Empty state */
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ name: 'empty', value: 1 }]}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={0}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                <Cell
                  fill={
                    isDark
                      ? '#334155'
                      : colors.gray200
                  }
                />
              </Pie>

              {/* Centre label */}
              <Pie
                data={[{ name: 'label', value: 1 }]}
                dataKey="value"
                innerRadius={0}
                outerRadius={0}
                cx="50%"
                cy="42%"
                label={({ cx, cy }) => (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-400 dark:fill-slate-500"
                    style={{
                      fontSize: 13,
                      fill: isDark
                        ? '#64748b'
                        : colors.gray400,
                      fontWeight: 500,
                    }}
                  >
                    No data
                  </text>
                )}
                labelLine={false}
                isAnimationActive={false}
              >
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}