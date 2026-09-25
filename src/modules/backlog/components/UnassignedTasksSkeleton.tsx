'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-gray-100 dark:border-slate-700 last:border-0">
      <Skeleton className="h-4 w-4 rounded shrink-0" />

      <Skeleton className="h-4 w-10 sm:w-12 md:w-14 rounded shrink-0" />

      <div className="ml-1 sm:ml-2 min-w-0 flex-1">
        <Skeleton className="h-4 sm:h-5 w-full max-w-[180px] sm:max-w-md" />
      </div>

      <div className="flex w-10 sm:w-20 shrink-0 items-center justify-center">
        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
      </div>

      <div className="hidden md:flex w-16 shrink-0 items-center justify-center">
        <Skeleton className="h-6 w-14 sm:w-16 rounded-full" />
      </div>

      <div className="hidden lg:flex w-20 sm:w-24 shrink-0 items-center justify-center">
        <Skeleton className="h-6 w-16 sm:w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function UnassignedTasksSkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, index) => (
        <TaskRowSkeleton key={index} />
      ))}
    </div>
  );
}
