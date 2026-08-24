import Skeleton from '@/src/app/components/common/skeleton';

export default function ProjectSkeleton() {
  const card = (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />

          <div>
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        <Skeleton className="h-7 w-16 rounded-full" />
      </div>

      <Skeleton className="mb-2 h-4 w-20" />
      <Skeleton className="mb-4 h-2 w-full rounded-full" />

      <div className="flex items-center justify-between">
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
