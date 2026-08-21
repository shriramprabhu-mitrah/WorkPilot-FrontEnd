import React from 'react';
import { Organization } from '../data/mockData';

interface OrganizationCardProps {
  organization: Organization;
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

  const statusColor = organization.status === 'Active' ? 'text-green-600' : 'text-gray-400';
  const statusBg = organization.status === 'Active' ? 'bg-green-50' : 'bg-gray-50';

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm shrink-0">
          {getInitials(organization.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 truncate">{organization.name}</h4>
          <p className="text-xs text-gray-500">
            {organization.location} • {organization.memberCount} members
          </p>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor} ${statusBg} shrink-0`}
      >
        {organization.status}
      </span>
    </div>
  );
};
