import type React from 'react';

interface PanelProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Panel({ title, subtitle, className = '', children }: PanelProps) {
  return (
    <div
      className={`w-full min-w-0 overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col gap-1 ${className}`}
    >
      <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs mb-2 text-gray-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
