'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useGetAllProjects } from '../hooks/useSuperAdmin';
import { Pagination } from '../../../app/components/common/pagination/pagination';
import { AdminProjectsParams } from '@/src/types/superadmin';
import ProjectSkeleton from '../components/projectSkeleton';
export const ProjectsTemplate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search query with 1000ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const params: AdminProjectsParams = { page, page_size: pageSize };
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery;
    }
    return params;
  }, [page, pageSize, debouncedSearchQuery]);

  const { projects = [], meta, isLoadingProjects } = useGetAllProjects(queryParams);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/30',
        };
      case 'Running':
      case 'Planning':
        return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' };
      case 'Cancelled':
        return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' };
      default:
        return { color: 'text-gray-600 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-700' };
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };
  if (isLoadingProjects) {
    return <ProjectSkeleton />;
  }
  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">All Projects</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {meta?.total_items || projects.length} projects across all organizations
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="relative max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-320px)]">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                {['Project', 'Organization', 'Key', 'Status', 'Sprints', 'Members', 'Created'].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {isLoadingProjects ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading projects...
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const statusStyle = getStatusStyle(project.status);

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                            {(project.project_key ?? '').slice(0, 3).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm text-gray-900 dark:text-slate-100">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {project.organization_name || '-'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                          {project.project_key}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {project.sprint_count}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {project.total_members}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      {/* <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td> */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {projects.length === 0 && !isLoadingProjects && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                No projects found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {meta && Number(meta.total_items) > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-700">
            <Pagination
              meta={{
                page: meta.page,
                page_size: meta.page_size ?? meta.pageSize ?? pageSize,
                total_items: meta.total_items ?? meta.totalItems,
                total_pages: meta.total_pages ?? meta.totalPages ?? 0,
                has_next: meta.has_next ?? meta.hasNextPage ?? meta.has_next_page ?? false,
                has_previous: meta.has_previous ?? meta.hasPrevPage ?? meta.has_prev_page ?? false,
              }}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
