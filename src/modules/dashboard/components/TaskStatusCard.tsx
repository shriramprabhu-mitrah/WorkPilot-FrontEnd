'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { colors } from '@/src/styles/colors';
import { useTheme } from 'next-themes';

interface TaskStatusCardProps {
  taskStatus: Record<string, number>;
}

const statusColors: Record<string, string> = {
  Completed: colors.colDone,
  'In Progress': colors.colInProgress,
  Todo: colors.colTodo,
  Backlog: colors.colBacklog,
  'In Review': colors.colInReview,
  Testing: colors.colTesting,
};

export default function TaskStatusCard({ taskStatus }: TaskStatusCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusData = Object.entries(taskStatus).map(([name, value]) => ({
    name,
    value,
    color: statusColors[name] || colors.gray400,
  }));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Task Status</h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">Across all active projects</p>

      <div className="h-72">
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
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e5e7eb',
                color: isDark ? '#f1f5f9' : '#111827',
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={60}
              content={({ payload }) => (
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  {payload?.map((entry) => (
                    <div key={entry.value} className="flex items-center gap-1 justify-start">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-gray-500 dark:text-slate-300">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
