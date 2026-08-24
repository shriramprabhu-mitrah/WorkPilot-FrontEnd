import Skeleton from '@/src/app/components/common/skeleton';

export default function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Project Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />

            <div>
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        <div className="my-5 border-t border-gray-100 dark:border-gray-800" />

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}

          <div>
            <Skeleton className="mb-2 h-3 w-24" />

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-black"
                  />
                ))}
              </div>

              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Sprints Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20" />

        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Sprint Cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-black"
          >
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="mb-2 h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
