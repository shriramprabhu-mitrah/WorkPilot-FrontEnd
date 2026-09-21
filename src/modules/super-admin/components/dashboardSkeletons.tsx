import Skeleton from '@/src/app/components/common/skeleton';

const SuperAdminDasSkeleton = () => {
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      <div>
        <Skeleton className="h-6 sm:h-7 w-48 sm:w-64" />
        <Skeleton className="h-3 sm:h-4 w-64 sm:w-80 mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-3 sm:p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-3 w-16 sm:w-20" />
                <Skeleton className="h-6 sm:h-7 w-10 sm:w-12 mt-3" />
                <Skeleton className="h-3 w-20 sm:w-24 mt-2" />
              </div>

              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg ml-2" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
          <Skeleton className="h-5 w-40 mb-4" />

          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />

                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-24 mt-1.5" />
                </div>

                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-4" />

          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 py-2">
                <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0" />

                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-28" />
                  <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24 mt-1.5" />
                </div>

                <Skeleton className="h-5 w-12 sm:w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32 mb-4" />

          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3 py-2">
                <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0" />

                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3 sm:h-3.5 w-28 sm:w-32" />
                  <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16 mt-1.5" />
                </div>

                <Skeleton className="h-5 w-12 sm:w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <Skeleton className="h-4 sm:h-5 w-48 sm:w-56" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-[900px]">
            <div className="grid grid-cols-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-3 sm:px-5 py-3 gap-2 sm:gap-4">
              <Skeleton className="h-3 w-20 sm:w-24" />
              <Skeleton className="h-3 w-14 sm:w-16" />
              <Skeleton className="h-3 w-14 sm:w-16" />
              <Skeleton className="h-3 w-14 sm:w-16" />
              <Skeleton className="h-3 w-14 sm:w-16" />
              <Skeleton className="h-3 w-14 sm:w-16" />
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-6 items-center px-3 sm:px-5 py-4 sm:py-5 gap-2 sm:gap-4 border-b border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0" />

                  <div className="min-w-0">
                    <Skeleton className="h-3 sm:h-3.5 w-24 sm:w-28" />
                    <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-20 mt-1.5" />
                  </div>
                </div>
                <Skeleton className="h-3 sm:h-3.5 w-20 sm:w-28" />
                <Skeleton className="h-5 w-12 sm:w-14 rounded-full" />
                <Skeleton className="h-3 sm:h-3.5 w-6 sm:w-8" />
                <Skeleton className="h-3 sm:h-3.5 w-6 sm:w-8" />
                <Skeleton className="h-3 sm:h-3.5 w-16 sm:w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SuperAdminDasSkeleton;
