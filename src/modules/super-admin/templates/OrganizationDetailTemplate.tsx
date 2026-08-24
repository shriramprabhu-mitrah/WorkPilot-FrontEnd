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
          <p className="text-gray-500 dark:text-slate-400 text-sm">Organization not found.</p>
        </div>
      </div>
    );
  }

  const orgProjects = projects.filter((p) => p.organizationId === organization.id);
  const orgMembers = members.filter((m) => m.organizationId === organization.id);

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' };
      case 'Running':
      case 'Planning':
        return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' };
      case 'Cancelled':
        return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' };
      case 'Inactive':
      default:
        return { color: 'text-gray-600 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-700' };
    }
  };

  const avatarColors = [
    'bg-blue-500', 'bg-pink-500', 'bg-green-500',
    'bg-amber-500', 'bg-purple-500', 'bg-teal-500',
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
        className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Organizations</span>
      </button>

      {/* Organization Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-2xl shrink-0">
              {getInitials(organization.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{organization.name}</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                /{organization.slug} · {organization.industry} · {organization.location}
              </p>
            </div>
          </div>
          <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${orgStatus.color} ${orgStatus.bg}`}>
            {organization.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Created</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mt-1">{organization.created}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Size</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mt-1">50-100</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Projects</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mt-1">{organization.projectCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Members</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 mt-1">{organization.memberCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          {(['Projects', 'Members'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab}{' '}
              <span className="ml-1 text-xs">
                {tab === 'Projects' ? orgProjects.length : orgMembers.length}
              </span>
            </button>
          ))}
        </div>

        {/* Projects Tab */}
        {activeTab === 'Projects' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  {['Project','Key','Manager','Status','Sprints','Members','Created','Actions'].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {orgProjects.map((project) => {
                  const statusStyle = getStatusStyle(project.status);
                  return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                            {project.key}
                          </div>
                          <span className="font-medium text-sm text-gray-900 dark:text-slate-100">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600 dark:text-slate-400">{project.key}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">{project.manager}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">{project.sprints}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-slate-300">{project.members}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-slate-400">{project.created}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors"
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
                <p className="text-gray-500 dark:text-slate-400 text-sm">No projects found for this organization.</p>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
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
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    {['Member','Email','Role','Status','Joined','Actions'].map((col) => (
                      <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {orgMembers.map((member) => {
                    const statusStyle = getStatusStyle(member.status);
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                              {getInitials(member.name)}
                            </div>
                            <span className="font-medium text-sm text-gray-900 dark:text-slate-100">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700 dark:text-slate-300">{member.email}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-slate-400">{member.joined}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <button
                            className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors"
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
                  <p className="text-gray-500 dark:text-slate-400 text-sm">No members found for this organization.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
