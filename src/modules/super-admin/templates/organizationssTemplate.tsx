'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetOrganizations, useUpdateOrganization } from '../hooks/useSuperAdmin';
import { AdminOrganization } from '@/src/types/superadmin';
import { AdminOrganizationsParams } from '@/src/services/superadmin';
import { Pagination } from '../../../app/components/common/pagination/pagination';

type FilterType = 'All' | 'Active' | 'Inactive';

interface ConfirmationModalProps {
  isOpen: boolean;
  organization: AdminOrganization | null;
  action: 'activate' | 'deactivate';
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  organization,
  action,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !organization) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <AlertCircle className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 text-center mb-2">
            {action === 'activate' ? 'Activate' : 'Deactivate'} Organization?
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-6">
            Are you sure you want to {action} &ldquo;{organization.name}&rdquo;? This will affect
            all members and projects within this organization.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const OrganizationsTemplate = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    organization: AdminOrganization | null;
    action: 'activate' | 'deactivate';
  }>({
    isOpen: false,
    organization: null,
    action: 'activate',
  });

  // Debounce search query with 1000ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = useMemo(() => {
    const params: AdminOrganizationsParams = { page, page_size: pageSize };
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery;
    }
    if (activeFilter === 'Active') params.is_active = true;
    if (activeFilter === 'Inactive') params.is_active = false;
    return params;
  }, [page, pageSize, debouncedSearchQuery, activeFilter]);

  const { organizations = [], meta, isLoadingOrganizations } = useGetOrganizations(queryParams);
  const { mutate: updateOrganization } = useUpdateOrganization();

  const getInitials = (name: string) =>
    name
      ? name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '';

  // const handleViewOrg = (orgSlug: string) => {
  //   router.push(`/super-admin/organizations/${orgSlug}`);
  // };

  const handleOpenConfirmation = (org: AdminOrganization, action: 'activate' | 'deactivate') => {
    setConfirmModal({ isOpen: true, organization: org, action });
  };

  const handleCloseConfirmation = () => {
    setConfirmModal({ isOpen: false, organization: null, action: 'activate' });
  };

  const handleConfirmToggleStatus = () => {
    if (!confirmModal.organization) return;
    
    updateOrganization(
      {
        organizationId: confirmModal.organization.id,
        is_active: confirmModal.action === 'activate',
      },
      {
        onSuccess: () => {
          handleCloseConfirmation();
        },
      }
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        organization={confirmModal.organization}
        action={confirmModal.action}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmToggleStatus}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Organizations</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {meta?.total_items || organizations.length} organizations on the platform
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Active', 'Inactive'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                {[
                  'Organization',
                  'Industry',
                  'Country',
                  'Status',
                  'Projects',
                  'Members',
                  'Created',
                  'Actions',
                ].map((col) => (
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
              {isLoadingOrganizations ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Loading organizations...
                  </td>
                </tr>
              ) : (
                organizations.map((org) => {
                  const isActive = org.is_active;
                  const statusCls = isActive
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                    : 'text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700';

                  return (
                    <tr
                      key={org.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm shrink-0">
                            {getInitials(org.name)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                              {org.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">/{org.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {org.industry}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {org.country}
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
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {org.total_projects}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {org.total_members}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          {new Date(org.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* <button
                          onClick={() => handleViewOrg(org.slug)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium hover:underline"
                        >
                          View
                        </button> */}
                          {isActive ? (
                            <button
                              onClick={() => handleOpenConfirmation(org, 'deactivate')}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium hover:underline"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenConfirmation(org, 'activate')}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium hover:underline"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {organizations.length === 0 && !isLoadingOrganizations && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              No organizations found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {meta && Number(meta.total_items) > 0 && (
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
        )}
      </div>
    </div>
  );
};
