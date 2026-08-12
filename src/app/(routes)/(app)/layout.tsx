'use client';

import { Sidebar } from '@/src/app/components/common/sidebar';
import { Navbar } from '@/src/app/components/common/navbar';
import { colors } from '@/src/styles/colors';
import { useCallback, useState } from 'react';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: colors.gray50 }}>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar - toggleable */}
      <div className="lg:hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: colors.gray50 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
