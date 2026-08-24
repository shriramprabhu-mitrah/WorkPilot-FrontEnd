'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function TaskRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex w-[65%] items-center gap-4">
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

function SprintSkeleton() {
  return (
    <div className="mb-5 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        {[...Array(5)].map((_, index) => (
          <TaskRowSkeleton key={index} />
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-800">
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export default function BacklogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="mb-3 h-9 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      <SprintSkeleton />
      <SprintSkeleton />
      <SprintSkeleton />
    </div>
  );
}
