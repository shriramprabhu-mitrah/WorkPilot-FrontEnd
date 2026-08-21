'use client';

import React, { useState, useMemo } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { organizations, Organization } from '../data/mockData';

type FilterType = 'All' | 'Active' | 'Inactive';

interface ConfirmationModalProps {
  isOpen: boolean;
  organization: Organization | null;
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="text-blue-600" size={24} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
            {action === 'activate' ? 'Activate' : 'Deactivate'} Organization?
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to {action} &ldquo{organization.name}&rdquo? This will affect all members
            and projects within this organization.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    organization: Organization | null;
    action: 'activate' | 'deactivate';
  }>({
    isOpen: false,
    organization: null,
    action: 'activate',
  });

  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    // Filter by status
    if (activeFilter === 'Active') {
      filtered = filtered.filter((org) => org.status === 'Active');
    } else if (activeFilter === 'Inactive') {
      filtered = filtered.filter((org) => org.status === 'Inactive');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.industry.toLowerCase().includes(query) ||
          org.location?.toLowerCase().includes(query) ||
          org.slug.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeFilter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewOrg = (orgSlug: string) => {
    router.push(`/super-admin/organizations/${orgSlug}`);
  };

  const handleOpenConfirmation = (org: Organization, action: 'activate' | 'deactivate') => {
    setConfirmModal({
      isOpen: true,
      organization: org,
      action,
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmModal({
      isOpen: false,
      organization: null,
      action: 'activate',
    });
  };

  const handleConfirmToggleStatus = () => {
    if (confirmModal.organization) {
    }
    handleCloseConfirmation();
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        organization={confirmModal.organization}
        action={confirmModal.action}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmToggleStatus}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="text-sm text-gray-500 mt-1">
          {organizations.length} organizations on the platform
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {(['All', 'Active', 'Inactive'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrganizations.map((org) => {
                const statusColor = org.status === 'Active' ? 'text-green-600' : 'text-gray-500';
                const statusBg = org.status === 'Active' ? 'bg-green-50' : 'bg-gray-50';

                return (
                  <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
                          {getInitials(org.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{org.name}</p>
                          <p className="text-xs text-gray-500">/{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{org.industry}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{org.location}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor} ${statusBg}`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{org.projectCount}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{org.memberCount}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{org.created}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrg(org.slug)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                          title="View organization"
                        >
                          View
                        </button>
                        {org.status === 'Active' ? (
                          <button
                            onClick={() => handleOpenConfirmation(org, 'deactivate')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                            title="Deactivate organization"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenConfirmation(org, 'activate')}
                            className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline"
                            title="Activate organization"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrganizations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No organizations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
