'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function UserStoryRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0 bg-white dark:bg-slate-800">
      <Skeleton className="h-5 w-5 rounded shrink-0" />

      <div className="flex-1 min-w-0">
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      <Skeleton className="h-5 w-16 rounded-full shrink-0" />

      <Skeleton className="h-6 w-20 rounded-full shrink-0" />

      <Skeleton className="h-6 w-24 rounded-full shrink-0" />
    </div>
  );
}

export default function UnassignedUserStoriesSkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, index) => (
        <UserStoryRowSkeleton key={index} />
      ))}
    </div>
  );
}
