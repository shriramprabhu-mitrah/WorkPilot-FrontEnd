'use client';

import { Sidebar } from '@/src/app/components/common/sidebar';
import { Navbar } from '@/src/app/components/common/navbar';
import { colors } from '@/src/styles/colors';
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
  const { isOrganizationLoading } = useGetOrganization();

  // Validate organization slug
  useEffect(() => {
    if (!isOrganizationLoading && organization.slug) {
      if (organization.slug !== orgSlug) {
        // Redirect to correct organization slug
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/');
        // Replace the org slug (second element) with the correct one
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
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: colors.gray50 }}
      >
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

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
          className="flex-1 overflow-y-auto flex flex-col p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: colors.gray50 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
