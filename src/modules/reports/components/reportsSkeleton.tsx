'use client';

import Skeleton from '@/src/app/components/common/skeleton';

const StatCardSkeleton = () => (
  <div className="rounded-xl bg-white p-6">
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-8 w-14" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

const ChartSkeleton = ({ height = 'h-72' }: { height?: string }) => (
  <div className="rounded-xl bg-white p-5">
    <Skeleton className="h-5 w-36 mb-2" />
    <Skeleton className="h-4 w-48 mb-6" />

    <div className={`${height} flex items-end gap-3`}>
      {[...Array(6)].map((_, i) => (
        <Skeleton
          key={i}
          className={`flex-1 rounded-t ${['h-24', 'h-36', 'h-52', 'h-40', 'h-28', 'h-44'][i]}`}
        />
      ))}
    </div>
  </div>
);

const PieChartSkeleton = () => (
  <div className="rounded-xl bg-white p-5">
    <Skeleton className="h-5 w-36 mb-2" />
    <Skeleton className="h-4 w-52 mb-6" />

    <div className="flex justify-center items-center h-72">
      <Skeleton className="h-52 w-52 rounded-full" />
    </div>
  </div>
);

const TeamPerformanceSkeleton = () => (
  <div className="rounded-xl bg-white p-5">
    <Skeleton className="h-5 w-40 mb-2" />
    <Skeleton className="h-4 w-52 mb-8" />

    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 flex-1 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
    ))}
  </div>
);

const BurndownSkeleton = () => (
  <div className="rounded-xl bg-white p-5">
    <Skeleton className="h-5 w-44 mb-2" />
    <Skeleton className="h-4 w-60 mb-6" />

    <Skeleton className="h-[320px] w-full rounded-lg" />
  </div>
);

export default function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-64 mb-3" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartSkeleton />
        <PieChartSkeleton />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartSkeleton />
        <TeamPerformanceSkeleton />
      </div>

      <BurndownSkeleton />
    </div>
  );
}
