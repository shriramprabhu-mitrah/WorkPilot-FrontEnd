'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import UserStoryDetail from '@/src/modules/backlog/components/userStoryDetail';

export default function UserStoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const storyId = params.storyId as string;
  const projectId = searchParams.get('projectId') ?? '';

  if (!projectId) {
    router.push('/backlog');
    return null;
  }

  return <UserStoryDetail projectId={projectId} storyId={storyId} />;
}
