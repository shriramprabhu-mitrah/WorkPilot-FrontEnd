'use client';

import { SuperAdminSidebar } from '@/src/modules/super-admin/components/superAdminSidebar';
import { ThemeToggle } from '@/src/app/components/common/theme-toggle';
import { useCallback, useState } from 'react';
import { Menu } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block">
        <SuperAdminSidebar />
      </div>

      {/* Mobile sidebar - toggleable */}
      <div className="lg:hidden">
        <SuperAdminSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header with menu + theme toggle */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-700 dark:text-slate-200" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Super Admin</h1>
          <ThemeToggle />
        </header>

        {/* Desktop header with theme toggle */}
        <header className="hidden lg:flex items-center justify-end px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
