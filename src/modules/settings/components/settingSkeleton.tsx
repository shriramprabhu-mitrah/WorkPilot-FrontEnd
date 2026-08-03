import Skeleton from '@/src/app/components/common/skeleton';

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto [scrollbar-width:thin]">
      <div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-32 rounded-lg" />
        ))}
      </div>

      <div className="max-w-[760px] rounded-xl border border-gray-200 bg-white p-6">
        <Skeleton className="h-8 w-56 mb-8" />

        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="mb-6">
            <Skeleton className="h-4 w-36 mb-2" />
            <Skeleton className="h-11 w-full rounded-lg" />

            {index === 1 && <Skeleton className="mt-2 h-3 w-40" />}
          </div>
        ))}

        <div className="flex justify-end mt-8">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
