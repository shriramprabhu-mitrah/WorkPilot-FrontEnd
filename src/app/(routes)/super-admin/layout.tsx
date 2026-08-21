'use client';

import { SuperAdminSidebar } from '@/src/modules/super-admin/components/SuperAdminSidebar';
import { colors } from '@/src/styles/colors';
import { useCallback, useState } from 'react';
import { Menu } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.gray50 }}>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block">
        <SuperAdminSidebar />
      </div>

      {/* Mobile sidebar - toggleable */}
      <div className="lg:hidden">
        <SuperAdminSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Simple navbar for mobile menu */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Super Admin</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <main
          className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: colors.gray50 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
