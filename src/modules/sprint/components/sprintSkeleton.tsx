import Skeleton from '@/src/app/components/common/skeleton';

export default function SprintSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton className="mx-auto h-8 w-12 mb-3" />
            <Skeleton className="mx-auto h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <Skeleton className="h-6 w-40 mb-5" />
            <Skeleton className="h-3 w-full rounded-full mb-3" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Task Status Board */}
      <div>
        <Skeleton className="h-8 w-48 mb-5" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, column) => (
            <div key={column} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5" />
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Workload */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-7 w-56 mb-6" />

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-6">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>

            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
