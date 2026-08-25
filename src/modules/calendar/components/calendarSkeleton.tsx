'use client';

import Skeleton from '@/src/app/components/common/skeleton';

const CalendarCell = () => (
  <div className="relative h-22 border border-gray-100 bg-white p-2 dark:border-gray-800 dark:bg-black">
    <Skeleton className="mb-3 h-4 w-6" />

    <Skeleton className="mb-2 h-4 w-20 rounded-full" />
    <Skeleton className="h-4 w-16 rounded-full" />
  </div>
);

export default function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="mb-3 h-10 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 rounded-xl border border-gray-200 bg-white p-5 xl:col-span-9 dark:border-gray-800 dark:bg-black">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-11 w-40 rounded-lg" />

            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-16 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          </div>

          <Skeleton className="mb-6 h-4 w-56" />

          <div className="grid grid-cols-7 border border-gray-100 border-b-0 dark:border-gray-800">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex h-10 items-center justify-center border-r border-gray-100 last:border-r-0 dark:border-gray-800"
              >
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border border-gray-100 border-t-0 dark:border-gray-800">
            {Array.from({ length: 42 }).map((_, i) => (
              <CalendarCell key={i} />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-6 px-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-5 xl:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black">
            <Skeleton className="mb-5 h-7 w-40" />

            <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
              <Skeleton className="mb-3 h-4 w-20" />

              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />

                <div className="flex-1">
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black">
            <Skeleton className="mb-3 h-6 w-20" />
            <Skeleton className="mb-5 h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
