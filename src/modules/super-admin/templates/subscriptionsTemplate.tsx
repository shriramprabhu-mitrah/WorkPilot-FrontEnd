'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

type FilterType = 'Active' | 'Trial' | 'Expired / Failed' | 'Pending';

interface Subscription {
  id: string;
  organizationName: string;
  organizationInitials: string;
  currentPlan: string;
  planPrice: string;
  status: FilterType;
  members: number;
  startDate: string;
  nextBilling: string;
}

interface SubscriptionDetailModalProps {
  isOpen: boolean;
  subscription: Subscription | null;
  onClose: () => void;
}

const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  isOpen,
  subscription,
  onClose,
}) => {
  if (!isOpen || !subscription) return null;

  const getStatusClass = (status: FilterType) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'Trial':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
      case 'Expired / Failed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      case 'Pending':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500 dark:text-slate-400" />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">
            {subscription.organizationName}
          </h2>

          {/* Details */}
          <div className="space-y-4">
            {/* Plan */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-500 dark:text-slate-400">Plan</span>
              <span className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {subscription.currentPlan}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-500 dark:text-slate-400">Status</span>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(subscription.status)}`}
              >
                {subscription.status}
              </span>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-500 dark:text-slate-400">Amount</span>
              <span className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {subscription.planPrice}
              </span>
            </div>

            {/* Start Date */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-500 dark:text-slate-400">Start Date</span>
              <span className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {subscription.startDate}
              </span>
            </div>

            {/* Next Billing */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-800">
              <span className="text-sm text-gray-500 dark:text-slate-400">Next Billing</span>
              <span className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {subscription.nextBilling}
              </span>
            </div>

            {/* Members */}
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500 dark:text-slate-400">Members</span>
              <span className="text-base font-semibold text-gray-900 dark:text-slate-100">
                {subscription.members}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Mock data based on the screenshot
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    organizationName: 'Acme Corp',
    organizationInitials: 'AC',
    currentPlan: 'Pro',
    planPrice: '$990/mo',
    status: 'Active',
    members: 5,
    startDate: '2026-06-21',
    nextBilling: '2026-09-21',
  },
  {
    id: '2',
    organizationName: 'TechStart Inc',
    organizationInitials: 'TI',
    currentPlan: 'Business',
    planPrice: '$7,490/mo',
    status: 'Active',
    members: 8,
    startDate: '2026-05-01',
    nextBilling: '2026-09-01',
  },
  {
    id: '3',
    organizationName: 'Global Systems',
    organizationInitials: 'GS',
    currentPlan: 'Business',
    planPrice: '$2,490/mo',
    status: 'Active',
    members: 24,
    startDate: '2025-11-01',
    nextBilling: '2025-10-01',
  },
  {
    id: '4',
    organizationName: 'DataFlow Analytics',
    organizationInitials: 'DA',
    currentPlan: 'Pro',
    planPrice: '$990/mo',
    status: 'Expired / Failed',
    members: 6,
    startDate: '2026-05-10',
    nextBilling: '—',
  },
  {
    id: '5',
    organizationName: 'BuildRight Co',
    organizationInitials: 'BC',
    currentPlan: 'Pro',
    planPrice: '$990/mo',
    status: 'Trial',
    members: 11,
    startDate: '2026-07-01',
    nextBilling: '2026-09-01',
  },
  {
    id: '6',
    organizationName: 'Nimbus Cloud',
    organizationInitials: 'NC',
    currentPlan: 'Business',
    planPrice: '$7,490/mo',
    status: 'Pending',
    members: 18,
    startDate: '2025-08-12',
    nextBilling: '2025-09-12',
  },
];

const statusCounts = {
  Active: 3,
  Trial: 1,
  'Expired / Failed': 1,
  Pending: 1,
};

export const SubscriptionsTemplate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType | 'All'>('All');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubscription(null);
  };

  const filteredSubscriptions = mockSubscriptions.filter((sub) => {
    const matchesSearch = sub.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || sub.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getStatusClass = (status: FilterType) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'Trial':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
      case 'Expired / Failed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      case 'Pending':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  const totalSubscriptions = mockSubscriptions.length;

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Subscription Detail Modal */}
      <SubscriptionDetailModal
        isOpen={isModalOpen}
        subscription={selectedSubscription}
        onClose={handleCloseModal}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Subscriptions</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          All organization subscription plans across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Active
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {statusCounts.Active}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Trial
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {statusCounts.Trial}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Expired / Failed
          </p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {statusCounts['Expired / Failed']}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Pending
          </p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {statusCounts.Pending}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="relative">
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
      </div>

      {/* Subscriptions Table */}
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
              {filteredSubscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm shrink-0">
                        {sub.organizationInitials}
                      </div>
                      <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                        {sub.organizationName}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {sub.currentPlan}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{sub.planPrice}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(sub.status)}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {sub.members}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {sub.nextBilling === '—'
                        ? '—'
                        : new Date(sub.nextBilling).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewSubscription(sub)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              No subscriptions found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
