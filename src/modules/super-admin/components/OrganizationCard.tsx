import React from 'react';
import { AdminOrganization } from '@/src/types/superadmin';

interface OrganizationCardProps {
  organization: AdminOrganization;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm shrink-0">
          {getInitials(organization.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-slate-100 truncate">
            {organization.name}
          </h4>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {organization.country} • {organization.total_members} members
          </p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
          organization.is_active
            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
            : 'text-gray-400 dark:text-slate-400 bg-gray-50 dark:bg-slate-700'
        }`}
      >
        {organization.is_active ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};
