'use client';

import Skeleton from '@/src/app/components/common/skeleton';

function TaskRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-3">
      <div className="flex flex-1 min-w-0 items-center gap-2 sm:gap-4">
        <Skeleton className="h-4 w-10 sm:w-14 rounded shrink-0" />
        <Skeleton className="h-5 w-12 sm:w-16 rounded-full shrink-0 hidden sm:block" />
        <Skeleton className="h-4 w-full max-w-[200px] sm:max-w-md" />
      </div>

      <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 ml-2">
        <Skeleton className="h-6 w-14 xl:w-16 rounded-full" />
        <Skeleton className="h-6 w-16 xl:w-20 rounded-full" />
        <Skeleton className="h-6 w-20 xl:w-24 rounded-full" />
        <Skeleton className="h-4 w-6 xl:w-8" />
        <Skeleton className="h-4 w-10 xl:w-12" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      
      <div className="flex lg:hidden items-center gap-2 shrink-0 ml-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

function SprintSkeleton() {
  return (
    <div className="mb-4 sm:mb-5 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-5 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Skeleton className="h-5 w-20 sm:w-24" />
          <Skeleton className="h-6 w-12 sm:w-16 rounded-full" />
          <Skeleton className="h-4 w-16 sm:w-24 hidden sm:block" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-4 w-20 sm:w-24 hidden md:block" />
          <Skeleton className="h-9 sm:h-10 w-28 sm:w-36 rounded-lg" />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800">
        {[...Array(5)].map((_, index) => (
          <TaskRowSkeleton key={index} />
        ))}
      </div>

      <div className="border-t border-gray-100 px-3 sm:px-5 py-3 sm:py-4 dark:border-gray-800">
        <Skeleton className="h-5 w-20 sm:w-24" />
      </div>
    </div>
  );
}

export default function BacklogSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
        <div>
          <Skeleton className="mb-2 sm:mb-3 h-7 sm:h-9 w-32 sm:w-40" />
          <Skeleton className="h-4 w-48 sm:w-72" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-10 w-full sm:w-48 md:w-64 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg hidden sm:block" />
          <Skeleton className="h-10 w-full sm:w-32 md:w-40 rounded-lg" />
        </div>
      </div>

      <SprintSkeleton />
      <SprintSkeleton />
      <SprintSkeleton />
    </div>
  );
}
