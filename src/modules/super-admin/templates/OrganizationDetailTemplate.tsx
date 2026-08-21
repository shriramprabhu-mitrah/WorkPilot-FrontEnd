'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';
import { organizations, projects, members } from '../data/mockData';

interface OrganizationDetailTemplateProps {
  orgSlug: string;
}

type TabType = 'Projects' | 'Members';

export const OrganizationDetailTemplate: React.FC<OrganizationDetailTemplateProps> = ({
  orgSlug,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Projects');

  const organization = organizations.find((org) => org.slug === orgSlug);

  if (!organization) {
    return (
      <div className="space-y-6 w-full max-w-full">
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">Organization not found.</p>
        </div>
      </div>
    );
  }

  const orgProjects = projects.filter((p) => p.organizationId === organization.id);
  const orgMembers = members.filter((m) => m.organizationId === organization.id);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { color: 'text-green-600', bg: 'bg-green-50' };
      case 'Running':
        return { color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'Planning':
        return { color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'Cancelled':
        return { color: 'text-red-600', bg: 'bg-red-50' };
      case 'Inactive':
        return { color: 'text-gray-600', bg: 'bg-gray-50' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const avatarColors = [
    'bg-blue-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-teal-500',
  ];

  const getAvatarColor = (id: string) => {
    const index = parseInt(id, 10) % avatarColors.length;
    return avatarColors[index];
  };

  const orgStatus = getStatusStyle(organization.status);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Back Button */}
      <button
        onClick={() => router.push('/super-admin/organizations')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Organizations</span>
      </button>

      {/* Organization Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-2xl shrink-0">
              {getInitials(organization.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                /{organization.slug} · {organization.industry} · {organization.location}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${orgStatus.color} ${orgStatus.bg}`}
          >
            {organization.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{organization.created}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Size</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">50-100</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projects</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{organization.projectCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Members</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{organization.memberCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['Projects', 'Members'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}{' '}
              <span className="ml-1 text-xs">
                {tab === 'Projects' ? orgProjects.length : orgMembers.length}
              </span>
            </button>
          ))}
        </div>

        {/* Projects Tab Content */}
        {activeTab === 'Projects' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sprints
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
                {orgProjects.map((project) => {
                  const statusStyle = getStatusStyle(project.status);

                  return (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {project.key}
                          </div>
                          <span className="font-medium text-sm text-gray-900">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">{project.key}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{project.manager}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{project.sprints}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{project.members}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{project.created}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orgProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No projects found for this organization.</p>
              </div>
            )}
          </div>
        )}

        {/* Members Tab Content */}
        {activeTab === 'Members' && (
          <div className="p-4">
            <div className="flex justify-end mb-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                <Plus size={16} />
                Invite Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orgMembers.map((member) => {
                    const statusStyle = getStatusStyle(member.status);

                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                            >
                              {getInitials(member.name)}
                            </div>
                            <span className="font-medium text-sm text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{member.email}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{member.joined}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orgMembers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No members found for this organization.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
