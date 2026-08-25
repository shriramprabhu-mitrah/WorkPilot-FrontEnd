import Skeleton from '@/src/app/components/common/skeleton';

export default function PermissionsSkeleton() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
      {/* Sidebar skeleton */}
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900 lg:flex">
        <div className="flex-1 overflow-y-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[52px] w-full items-center border-b border-slate-200 px-5 dark:border-slate-700"
            >
              <Skeleton className="mr-3 h-[7px] w-[7px] !rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="p-4">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        {/* Header skeleton */}
        <div className="flex h-[65px] items-center justify-between">
          <Skeleton className="h-7 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>

        {/* Role header skeleton */}
        <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Permission sections skeleton */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex min-h-[56px] items-center justify-between px-4 ${
                i !== 3 ? 'border-b border-slate-200 dark:border-slate-700' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-10 !rounded-full" />
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
