'use client';

import { ThemeToggle } from '@/src/app/components/common/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-950">
      <div className="fixed right-4 top-4 z-50 rounded-full border border-gray-300 bg-white p-1.5 shadow-lg transition-all hover:border-blue-400 hover:shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-400">
        <ThemeToggle />
      </div>

      {children}
    </div>
  );
}