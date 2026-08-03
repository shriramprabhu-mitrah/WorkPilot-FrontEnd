'use client';

import Skeleton from '@/src/app/components/common/skeleton';

export default function TaskSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="mb-3 h-9 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-52 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="mx-6 overflow-hidden rounded-xl bg-white">
        <table className="w-full table-fixed">
          <thead>
            <tr className="">
              <th className="w-10 px-3 py-4">
                <Skeleton className="h-4 w-4 rounded" />
              </th>

              <th className="w-20 px-2 py-4">
                <Skeleton className="h-3 w-10" />
              </th>

              <th className="w-[290px] px-2 py-4 text-left">
                <Skeleton className="h-3 w-16" />
              </th>

              <th className="w-24 px-2 py-4">
                <Skeleton className="h-3 w-14" />
              </th>

              <th className="w-24 px-2 py-4">
                <Skeleton className="h-3 w-14" />
              </th>

              <th className="w-32 px-2 py-4">
                <Skeleton className="h-3 w-16" />
              </th>

              <th className="w-14 px-2 py-4">
                <Skeleton className="h-3 w-8" />
              </th>

              <th className="w-24 px-2 py-4">
                <Skeleton className="h-3 w-14" />
              </th>

              <th className="w-24 px-2 py-4">
                <Skeleton className="h-3 w-14" />
              </th>

              <th className="w-40 px-2 py-4">
                <Skeleton className="h-3 w-16" />
              </th>

              <th className="w-10 px-2 py-4">
                <Skeleton className="h-3 w-3" />
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                <td className="px-3 py-4">
                  <Skeleton className="h-4 w-4 rounded" />
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-4 w-10" />
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-4 w-52" />
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>

                <td className="px-2 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-7 w-7 rounded-full" />
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-4 w-12" />
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="h-4 w-14" />
                </td>

                <td className="px-2 py-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12 rounded-md" />
                    <Skeleton className="h-6 w-12 rounded-md" />
                  </div>
                </td>

                <td className="px-2 py-4">
                  <Skeleton className="ml-auto h-4 w-4 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-4">
          <Skeleton className="h-4 w-40" />

          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
