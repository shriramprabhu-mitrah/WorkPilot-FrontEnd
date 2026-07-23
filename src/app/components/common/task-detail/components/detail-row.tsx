import type { ReactNode } from 'react';

export const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[96px_1fr] gap-3 py-3 border-b border-gray-200 last:border-0 items-center">
    <span className="text-sm font-medium text-gray-700 leading-5">{label}</span>
    <div className="text-sm text-gray-900 leading-5 min-w-0">{children}</div>
  </div>
);
