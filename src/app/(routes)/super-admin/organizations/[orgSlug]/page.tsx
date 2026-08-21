import { OrganizationDetailTemplate } from '@/src/modules/super-admin/templates/OrganizationDetailTemplate';

export const metadata = {
  title: 'Organization Details - Super Admin',
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { orgSlug } = await params;
  return <OrganizationDetailTemplate orgSlug={orgSlug} />;
}
