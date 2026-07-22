import type React from 'react';
import { colors } from '@/src/styles/colors';

interface PanelProps {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export default function Panel({ title, subtitle, className = '', children }: PanelProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 sm:p-5 flex flex-col gap-1 ${className}`}
      style={{ borderColor: colors.gray200 }}
    >
      <p className="font-semibold text-sm" style={{ color: colors.gray900 }}>
        {title}
      </p>
      {subtitle && (
        <p className="text-xs mb-2" style={{ color: colors.gray400 }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
