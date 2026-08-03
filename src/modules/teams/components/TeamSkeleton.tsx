import Skeleton from '@/src/app/components/common/skeleton';

interface TeamMemberCardSkeletonProps {
  page?: boolean;
}

export default function TeamMemberCardSkeleton({ page = false }: TeamMemberCardSkeletonProps) {
  const card = (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />

          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-5 w-1 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-[2px] w-full rounded-full mt-4 mb-4" />

      <div className="flex items-center gap-5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );

  if (!page) return card;

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>{card}</div>
        ))}
      </div>

      <div className="mt-10">
        <Skeleton className="h-7 w-64 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl p-5 animate-pulse bg-white">
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-4 w-52 mb-5" />

              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
