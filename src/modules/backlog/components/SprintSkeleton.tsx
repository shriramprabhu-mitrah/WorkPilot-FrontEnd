'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function SprintItemSkeleton() {
  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900 overflow-hidden">
      {/* Sprint Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Sprint Content Area */}
      <div className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>

      {/* Sprint Footer */}
      <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        <Skeleton className="h-4 w-32" />
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
