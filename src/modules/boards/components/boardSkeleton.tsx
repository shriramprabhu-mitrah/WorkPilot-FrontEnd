import Skeleton from '@/src/app/components/common/skeleton';

export default function BoardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-5">
        {Array.from({ length: 6 }).map((_, column) => (
          <div key={column}>
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-5" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, card) => (
                <div
                  key={card}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black"
                >
                  <Skeleton className="mb-3 h-5 w-40" />
                  <Skeleton className="mb-3 h-4 w-20" />

                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
