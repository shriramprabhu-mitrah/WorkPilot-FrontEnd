import Skeleton from '@/src/app/components/common/skeleton';

const MembersSkeleton = () => {
    return (
        <div className="space-y-6 w-full max-w-full">
            <div>
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-3">

                    <Skeleton className="h-10 w-72 rounded-lg" />

                    <Skeleton className="h-10 w-44 rounded-lg" />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                {[
                                    'Member',
                                    'Email',
                                    'Organization',
                                    'Role',
                                    'Status',
                                    'Joined',
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
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr key={index}>
                                    {/* Member */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />

                                            <Skeleton className="h-3.5 w-32" />
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-48" />
                                    </td>

                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-36" />
                                    </td>

                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-5 w-16 rounded-md" />
                                    </td>

                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </td>

                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-20" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-slate-700">
                    <Skeleton className="h-4 w-24" />

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>

                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default MembersSkeleton;