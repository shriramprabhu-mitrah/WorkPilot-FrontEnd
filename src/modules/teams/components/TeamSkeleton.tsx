'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function TeamMemberRowSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(260px,1.8fr)_minmax(300px,2fr)_80px_80px_80px] items-center gap-4 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-black">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />

        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="pr-6">
        <Skeleton className="mb-2 h-3 w-16" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-4 w-6" />
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-4 w-6" />
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-4 w-6" />
      </div>
    </div>
  );
}

export default function TeamMemberCardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
        <div className="grid grid-cols-[minmax(260px,1.8fr)_minmax(300px,2fr)_80px_80px_80px] items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-black">
          <Skeleton className="h-3 w-16" />

          <Skeleton className="h-3 w-16" />

          <div className="flex justify-center">
            <Skeleton className="h-3 w-12" />
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-3 w-10" />
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        {Array.from({ length: 4 }).map((_, index) => (
          <TeamMemberRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

/* Only table rows skeleton for filter loading */
export function TeamMemberTableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="
            grid
            grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px]
            items-center
            gap-4
            border-b
            border-gray-200
            bg-white
            px-5
            py-4
            last:border-b-0
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          {/* Member */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />

            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Progress */}
          <div className="pr-6">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Tasks */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>

          {/* Done */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>

          {/* Open */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>

          {/* Action */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
      ))}
    </>
  );
}
