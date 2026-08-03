import Skeleton from '@/src/app/components/common/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto [scrollbar-width:thin]">
      <div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[320px] rounded-xl border border-gray-200 bg-white p-6 flex-shrink-0">
          <Skeleton className="h-24 w-24 rounded-xl mx-auto mb-5" />

          <Skeleton className="h-7 w-40 mx-auto mb-3" />
          <Skeleton className="h-6 w-32 rounded-full mx-auto mb-6" />

          <Skeleton className="h-4 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto mb-6" />

          <div className="border-t border-gray-100 my-6" />

          <div className="space-y-5 mb-8">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <Skeleton className="h-11 w-full rounded-lg mb-3" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="w-full lg:max-w-3xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-6">
                <Skeleton className="h-8 w-12 mx-auto mb-3" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-10" />
            </div>

            <Skeleton className="h-2 w-full rounded-full mb-5" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton className="h-7 w-72 mb-6" />

            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <Skeleton className="h-4 w-28 mb-5" />

                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>

              <div>
                <Skeleton className="h-4 w-28 mb-5" />

                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <Skeleton className="h-6 w-40 mb-5" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
