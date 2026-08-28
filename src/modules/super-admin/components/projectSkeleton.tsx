import Skeleton from '@/src/app/components/common/skeleton';

const ProjectSkeleton = () => {
    return (
        <div className="space-y-6 w-full max-w-full">
            {/* Page Header */}
            <div>
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                <Skeleton className="h-10 w-72 rounded-lg" />
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Header */}
                        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                {[
                                    'Project',
                                    'Organization',
                                    'Key',
                                    'Status',
                                    'Sprints',
                                    'Members',
                                    'Created',
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

                        {/* Rows */}
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr key={index}>
                                    {/* Project */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-8 h-8 rounded bg-blue-100 dark:bg-slate-700 shrink-0" />

                                            <Skeleton className="h-3.5 w-32" />
                                        </div>
                                    </td>

                                    {/* Organization */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-28" />
                                    </td>

                                    {/* Key */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-10" />
                                    </td>

                                    {/* Status */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </td>

                                    {/* Sprints */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-8" />
                                    </td>

                                    {/* Members */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-8" />
                                    </td>

                                    {/* Created */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <Skeleton className="h-3.5 w-20" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-slate-700">
                    <Skeleton className="h-4 w-24" />

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
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

export default ProjectSkeleton;