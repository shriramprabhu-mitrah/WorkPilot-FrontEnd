'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function SprintItemSkeleton() {
  return (
    <div className="mb-3 sm:mb-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 overflow-hidden">
      {/* Sprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Skeleton className="h-5 w-20 sm:w-24" />
          <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-full" />
          <Skeleton className="h-4 w-24 sm:w-32 hidden md:block" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-lg" />
        </div>
      </div>

      {/* Sprint Content Area */}
      <div className="p-3 sm:p-4">
        <div className="space-y-2">
          <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
          <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
          <Skeleton className="h-10 sm:h-12 w-full rounded-lg" />
        </div>
      </div>

      {/* Sprint Footer */}
      <div className="border-t border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 dark:border-gray-800">
        <Skeleton className="h-4 w-24 sm:w-32" />
      </div>
    </div>
  );
}

export default function SprintSkeleton() {
  return (
    <div className="space-y-0">
      {[...Array(3)].map((_, index) => (
        <SprintItemSkeleton key={index} />
      ))}
    </div>
  );
}
