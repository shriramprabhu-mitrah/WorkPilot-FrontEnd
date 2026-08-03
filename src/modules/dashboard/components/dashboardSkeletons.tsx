import Skeleton from '@/src/app/components/common/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton className="mx-auto mb-3 h-10 w-14" />
            <Skeleton className="mx-auto h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-48" />
          <Skeleton className="mx-auto h-48 w-44 rounded-full" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-48" />
          <Skeleton className="mx-auto h-60 w-[92%] rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-48" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="mb-6 h-4 w-48" />

          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4 flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 flex-1 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-6 h-6 w-40" />

          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-5 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Skeleton className="mb-6 h-6 w-44" />

          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-5 flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-56" />
                <Skeleton className="h-3 w-28" />
              </div>

              <Skeleton className="ml-4 h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
