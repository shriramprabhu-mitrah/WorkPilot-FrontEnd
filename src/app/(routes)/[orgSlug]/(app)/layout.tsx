'use client';

import { Sidebar } from '@/src/app/components/common/sidebar';
import { Navbar } from '@/src/app/components/common/navbar';
import { ForceChangePasswordModal } from '@/src/app/components/common/force-change-password';
import { useCallback, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/src/store';
import { useGetOrganization } from '@/src/modules/organization/hooks/useOrganization';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const organization = useAppSelector((state) => state.organization);
  const requirePasswordChange = useAppSelector((state) => state.user.require_password_change);
  const { isOrganizationLoading } = useGetOrganization();

  // Validate organization slug
  useEffect(() => {
    if (!isOrganizationLoading && organization.slug) {
      if (organization.slug !== orgSlug) {
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        pathParts[1] = organization.slug;
        const newPath = pathParts.join('/');
        router.replace(newPath);
      }
    }
  }, [organization.slug, orgSlug, isOrganizationLoading, router]);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Show loading state only while organization is being fetched
  if (isOrganizationLoading || !organization.slug) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5f7] dark:bg-slate-950">
      {/* Mandatory password-change modal — blocks all dashboard interaction */}
      {requirePasswordChange && <ForceChangePasswordModal />}

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
        <main className="flex-1 overflow-y-auto flex flex-col p-3 sm:p-4 md:p-6 bg-[#f4f5f7] dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
