'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function TaskRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-4 w-[65%]">
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
    <div className="rounded-xl  bg-white mb-5">
      {/* Sprint Header */}
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

      {[...Array(5)].map((_, index) => (
        <TaskRowSkeleton key={index} />
      ))}

      <div className="px-5 py-4">
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export default function BacklogSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-9 w-40 mb-3" />
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
