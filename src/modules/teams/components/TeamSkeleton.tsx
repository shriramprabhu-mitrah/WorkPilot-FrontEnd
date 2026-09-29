import Skeleton from '@/src/app/components/common/skeleton';

function TeamMemberRowSkeleton({ index = 0 }: { index?: number }) {
  const nameWidths = ['w-32', 'w-40', 'w-28', 'w-36'];
  const roleWidths = ['w-16', 'w-20', 'w-14', 'w-18'];

  return (
    <div className="grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px] items-center gap-4 border-b border-gray-100 bg-white px-5 py-4 last:border-b-0 dark:border-slate-700 dark:bg-slate-800">
      {/* Member */}
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className={`h-4 ${nameWidths[index % nameWidths.length]}`} />
          <Skeleton className={`h-3 ${roleWidths[index % roleWidths.length]}`} />
        </div>
      </div>

      {/* Progress */}
      <div className="pr-4">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>

        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>

      {/* Tasks */}
      <div className="flex justify-center">
        <Skeleton className="h-7 w-9 rounded-md" />
      </div>

      {/* Done */}
      <div className="flex justify-center">
        <Skeleton className="h-7 w-9 rounded-md" />
      </div>

      {/* Open */}
      <div className="flex justify-center">
        <Skeleton className="h-7 w-9 rounded-md" />
      </div>

      {/* Action */}
      <div className="flex justify-center">
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

export default function TeamMemberCardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px] items-center gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-3.5 dark:border-slate-700 dark:bg-slate-800">
          <Skeleton className="h-3 w-16" />

          <Skeleton className="h-3 w-20" />

          <div className="flex justify-center">
            <Skeleton className="h-3 w-12" />
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-3 w-10" />
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-3 w-10" />
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-3 w-8" />
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <TeamMemberRowSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
}

/* Only table rows skeleton for filter loading */
export function TeamMemberTableSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="
            grid
            grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_80px_80px_80px_50px]
            items-center
            gap-4
            border-b
            border-gray-200
            bg-white
            px-5
            py-4
            last:border-b-0
            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          {/* Member */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />

            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Progress */}
          <div className="pr-6">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Tasks */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>

          {/* Done */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>

          {/* Open */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>

          {/* Action */}
          <div className="flex justify-center">
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
      ))}
    </>
  );
}
