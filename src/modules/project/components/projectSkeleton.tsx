import Skeleton from '@/src/app/components/common/skeleton';

export default function ProjectSkeleton() {
  const card = (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />

          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        <Skeleton className="h-7 w-16 rounded-full" />
      </div>

      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-2 w-full rounded-full mb-4" />

      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>{card}</div>
      ))}
    </div>
  );
}
