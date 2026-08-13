'use client';

import { useRouter } from 'next/navigation';
import { OrganizationSetupModal } from '@/src/modules/organization/components/organization-setup';

export default function Page() {
  const router = useRouter();

  return (
    <OrganizationSetupModal
      onBack={() => {
        router.push('/signup?from=setup');
      }}
      onComplete={() => {
        router.push('/dashboard');
      }}
    />
  );
}
