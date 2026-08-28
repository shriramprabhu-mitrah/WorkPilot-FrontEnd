import Skeleton from '@/src/app/components/common/skeleton';

const SubscriptionsSkeleton = () => {
  return (
    <div className="space-y-6 w-full max-w-full">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-8 mt-3" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                {[
                  'Organization',
                  'Current Plan',
                  'Status',
                  'Members',
                  'Start Date',
                  'Next Billing',
                  'Actions',
                ].map((column) => (
                  <th
                    key={column}
                    className="px-5 py-3 text-left"
                  >
                    <Skeleton className="h-3 w-20" />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />

                      <Skeleton className="h-3.5 w-32" />
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-8" />
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-20" />
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-20" />
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-8" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsSkeleton;