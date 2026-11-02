'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { colors } from '@/src/styles/colors';
import { useTheme } from 'next-themes';
import type { DashboardTaskStatus } from '@/src/types/dashboard';

interface TaskStatusCardProps {
  taskStatus: DashboardTaskStatus;
}

type PercentLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  value?: number;
  percent?: number;
};

const RADIAN = Math.PI / 180;

export default function TaskStatusCard({ taskStatus }: TaskStatusCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Data received from the dashboard API
  const allData = Object.entries(taskStatus).map(([name, item], index) => ({
    id: `${name}-${index}`,
    name,
    value: Number(item.count) || 0,
    color: item.color || colors.gray400,
  }));

  // Exclude hidden statuses from the chart and visible total
  const visibleData = allData.filter((item) => !hidden.has(item.name));

  const hasAnyData = allData.some((item) => item.value > 0);
  const hasVisibleData = visibleData.some((item) => item.value > 0);

  // Total of currently visible statuses
  const totalCount = visibleData.reduce((sum, item) => sum + item.value, 0);

  const toggleStatus = (name: string) => {
    setHidden((previous) => {
      const next = new Set(previous);

      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });
  };

  // Display percentage labels outside the donut
  const renderPercentLabel = (props: PercentLabelProps) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, value = 0, percent = 0 } = props;

    if (value <= 0) return null;

    const cos = Math.cos(-RADIAN * midAngle);
    const sin = Math.sin(-RADIAN * midAngle);

    const startX = cx + (outerRadius + 3) * cos;
    const startY = cy + (outerRadius + 3) * sin;
    const midX = cx + (outerRadius + 12) * cos;
    const midY = cy + (outerRadius + 12) * sin;
    const endX = midX + (cos >= 0 ? 1 : -1) * 8;
    const textX = endX + (cos >= 0 ? 1 : -1) * 3;

    return (
      <g>
        <path
          d={`M${startX},${startY}L${midX},${midY}L${endX},${midY}`}
          stroke={isDark ? '#475569' : '#cbd5e1'}
          fill="none"
          strokeWidth={1}
        />

        <text
          x={textX}
          y={midY}
          textAnchor={cos >= 0 ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={700}
          fill={isDark ? '#cbd5e1' : '#64748b'}
        >
          {`${Math.round(percent * 100)}%`}
        </text>
      </g>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Task Status</h3>

      <p className="mb-2 text-sm text-gray-500 dark:text-slate-100">Across all active projects</p>

      {/* Donut chart */}
      <div
        className="relative flex-1 min-h-0 [&_*:focus]:outline-none [&_*:focus]:ring-0 [&_.recharts-surface]:overflow-visible"
        style={{ height: 220 }}
      >
        {hasAnyData && hasVisibleData ? (
          <>
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
                  label={renderPercentLabel}
                  labelLine={false}
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

            {/* Visible task total in the center */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold leading-none text-gray-900 dark:text-slate-100">
                {totalCount}
              </span>
            </div>
          </>
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

      {/* Clickable legend with counts only */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-9">
        {allData.map((entry) => {
          const isHidden = hidden.has(entry.name);

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => toggleStatus(entry.name)}
              aria-pressed={!isHidden}
              className="flex items-center gap-2 min-w-0 group text-left transition-opacity"
              style={{ opacity: isHidden ? 0.35 : 1 }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 transition-all"
                style={{
                  backgroundColor: isHidden ? (isDark ? '#475569' : colors.gray300) : entry.color,
                }}
              />

              <span className="text-xs text-gray-600 dark:text-slate-300 truncate group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">
                {entry.name}
              </span>

              <span className="ml-auto shrink-0 text-xs font-semibold tabular-nums text-gray-900 dark:text-slate-100">
                {entry.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
