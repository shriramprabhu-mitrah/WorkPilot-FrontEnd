'use client';

import { useParams,  useSearchParams } from 'next/navigation';
import UserStoryDetail from '@/src/modules/backlog/components/userStoryDetail';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';

export default function UserStoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { push } = useOrgNavigation();

  const storyId = params.storyId as string;
  const projectId = searchParams.get('projectId') ?? '';

  if (!projectId) {
    push('/backlog');
    return null;
  }

  return <UserStoryDetail projectId={projectId} storyId={storyId} />;
}
