import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  subtext?: string;
  subtextColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  subtext,
  subtextColor = 'text-gray-500',
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            {label}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</h3>
          {subtext && <p className={`text-xs font-medium mt-1 ${subtextColor}`}>{subtext}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
};
