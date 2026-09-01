'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useGetMembers, useGetOrganizations } from '../hooks/useSuperAdmin';
import { Pagination } from '../../../app/components/common/pagination/pagination';
import { AdminMembersParams } from '@/src/types/superadmin';
import MembersSkeleton from '../components/membersSkeleton';

const avatarColors = [
  'bg-blue-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-indigo-500',
];

export const MembersTemplate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('All Organizations');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search query with 1000ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch all organizations without pagination for the dropdown
  const { organizations = [] } = useGetOrganizations({});

  const queryParams = useMemo(() => {
    const params: AdminMembersParams = { page, page_size: pageSize };
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery;
    }
    if (selectedOrg !== 'All Organizations') {
      const org = organizations.find((o) => o.name === selectedOrg);
      if (org) {
        params.organization_id = org.id;
      }
    }
    return params;
  }, [page, pageSize, debouncedSearchQuery, selectedOrg, organizations]);

  const { members = [], meta, isLoadingMembers } = useGetMembers(queryParams);

  const getInitials = (name: string) =>
    name
      ? name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

  const getAvatarColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatarColors.length;
    return avatarColors[index];
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };
  if (isLoadingMembers) {
    return <MembersSkeleton />;
  }
  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">All Members</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {meta?.total_items || members.length} members across all organizations
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Organization Filter Dropdown */}
          <div className="relative w-52">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <span className="text-gray-700 dark:text-slate-300 truncate">{selectedOrg}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 dark:text-slate-500 transition-transform shrink-0 ml-1 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedOrg('All Organizations');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selectedOrg === 'All Organizations'
                        ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Organizations
                  </button>
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedOrg === org.name
                          ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium'
                          : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-320px)]">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
              <tr>
                {['Member', 'Email', 'Organization', 'Role', 'Status', 'Joined'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {members.map((member) => {
                const isActive = member.is_active;

                const statusCls = isActive
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                  : 'text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700';

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                          >
                            {getInitials(member.name)}
                          </div>
                        )}
                        <span className="font-medium text-sm text-gray-900 dark:text-slate-100">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {member.email}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {member.organization_name || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                        Member
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusCls}`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {members.length === 0 && !isLoadingMembers && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                No members found matching your criteria.
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
