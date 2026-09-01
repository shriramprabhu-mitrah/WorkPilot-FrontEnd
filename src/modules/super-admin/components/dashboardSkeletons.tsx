import Skeleton from '@/src/app/components/common/skeleton';

const SuperAdminDasSkeleton = () => {
  return (
    <div className="space-y-6 w-full max-w-full">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-12 mt-3" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>

              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
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

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <Skeleton className="h-5 w-32 mb-4" />

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

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <Skeleton className="h-5 w-32 mb-4" />

          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />

                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-16 mt-1.5" />
                </div>

                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <Skeleton className="h-5 w-56" />
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-5 py-3 gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-6 items-center px-5 py-5 gap-4 border-b border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />

                  <div>
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20 mt-1.5" />
                  </div>
                </div>
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-3.5 w-8" />
                <Skeleton className="h-3.5 w-8" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SuperAdminDasSkeleton;
