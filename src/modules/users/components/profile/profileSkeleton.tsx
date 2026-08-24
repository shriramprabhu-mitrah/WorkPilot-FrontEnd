import Skeleton from '@/src/app/components/common/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto [scrollbar-width:thin]">
      <div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full flex-shrink-0 rounded-xl border border-gray-200 bg-white p-6 lg:w-[320px] dark:border-gray-800 dark:bg-black">
          <Skeleton className="mx-auto mb-5 h-24 w-24 rounded-xl" />

          <Skeleton className="mx-auto mb-3 h-7 w-40" />
          <Skeleton className="mx-auto mb-6 h-6 w-32 rounded-full" />

          <Skeleton className="mx-auto mb-2 h-4 w-48" />
          <Skeleton className="mx-auto mb-6 h-4 w-20" />

          <div className="my-6 border-t border-gray-100 dark:border-gray-800" />

          <div className="mb-8 space-y-5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <Skeleton className="mb-3 h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="w-full space-y-6 lg:max-w-3xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black"
              >
                <Skeleton className="mx-auto mb-3 h-8 w-12" />
                <Skeleton className="mx-auto h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-10" />
            </div>

            <Skeleton className="mb-5 h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
            <Skeleton className="mb-6 h-7 w-72" />

            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-8 h-4 w-4/5" />

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <Skeleton className="mb-5 h-4 w-28" />

                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="mb-4 flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>

              <div>
                <Skeleton className="mb-5 h-4 w-28" />

                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="mb-4 flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
            <Skeleton className="mb-5 h-6 w-40" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
