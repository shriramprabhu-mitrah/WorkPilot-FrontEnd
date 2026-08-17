'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/src/store';
import { useGetOrganization } from '@/src/modules/organization/hooks/useOrganization';

export default function RootRedirect() {
  const router = useRouter();
  const organization = useAppSelector((state) => state.organization);
  const { isOrganizationLoading } = useGetOrganization();

  useEffect(() => {
    if (!isOrganizationLoading) {
      if (organization.slug) {
        router.replace(`/${organization.slug}/dashboard`);
      } else {
        // If no organization, redirect to setup or signin
        router.replace('/signin');
      }
    }
  }, [organization.slug, isOrganizationLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
