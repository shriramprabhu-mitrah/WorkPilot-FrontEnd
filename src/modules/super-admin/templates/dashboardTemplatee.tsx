'use client';

import React from 'react';
import {
  Building2,
  FolderKanban,
  Users,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useGetOrganizations, useGetAllProjects, useGetMembers } from '../hooks/useSuperAdmin';
import { MetricCard } from '../components/metricsCard';
import { OrganizationCard } from '../components/organizationsCard';
import { ProjectCard } from '../components/projecttCard';
import { MemberCard } from '../components/membersCard';

// Mock metrics for dashboard
const dashboardMetrics = {
  activeOrgGrowth: '+12% from last month',
  activeMemberPercentage: 85,
};

export const DashboardTemplate = () => {
  const { organizations = [] } = useGetOrganizations();
  const { projects = [] } = useGetAllProjects();
  const { members = [] } = useGetMembers();

  const activeOrganizations = organizations.filter((o) => o.is_active).length;
  const inactiveOrganizations = organizations.length - activeOrganizations;
  const activeMembers = members.filter((m) => m.is_active).length;

  const recentOrganizations = organizations.slice(0, 5);
  const recentProjects = projects.slice(0, 5);
  const recentMembers = members.slice(0, 5);
  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Super Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Platform-wide overview across all organizations
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Total Orgs"
          value={organizations.length}
          icon={Building2}
          iconColor="#8b5cf6"
          iconBgColor="#f3e8ff"
        />
        <MetricCard 
          label="Active Orgs"
          value={activeOrganizations}
          icon={TrendingUp}
          iconColor="#10b981"
          iconBgColor="#d1fae5"
          subtext={dashboardMetrics.activeOrgGrowth}
          subtextColor="text-green-600"
        />
        <MetricCard
          label="Inactive Orgs"
          value={inactiveOrganizations}
          icon={AlertTriangle}
          iconColor="#f59e0b"
          iconBgColor="#fef3c7"
        />
        <MetricCard
          label="Total Projects"
          value={projects.length}
          icon={FolderKanban}
          iconColor="#3b82f6"
          iconBgColor="#dbeafe"
        />
        <MetricCard
          label="Total Members"
          value={members.length}
          icon={Users}
          iconColor="#ec4899"
          iconBgColor="#fce7f3"
        />
        <MetricCard
          label="Active Members"
          value={activeMembers}
          icon={UserCheck}
          iconColor="#06b6d4"
          iconBgColor="#cffafe"
          subtext={`${dashboardMetrics.activeMemberPercentage}% active`}
          subtextColor="text-cyan-600"
        />
      </div>

      {/* Recent Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Organizations */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Recent Organizations
          </h3>
          <div className="space-y-2">
            {recentOrganizations.map((org) => (
              <OrganizationCard  key={org.id} organization={org} />
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Recent Projects
          </h3>
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <ProjectCard  key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Recent Members
          </h3>
          <div className="space-y-2">
            {recentMembers.map((member) => (
              <MemberCard  key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>

      {/* Organization Activity Overview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Organization Activity Overview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {organizations.map((org) => {
                const getInitials = (name: string) => {
                  return name
                    ? name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : '';
                };

                const statusColor = org.is_active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-slate-400';
                const statusBg = org.is_active
                  ? 'bg-green-50 dark:bg-green-900/30'
                  : 'bg-gray-50 dark:bg-slate-700';

                return (
                  <tr
                    key={org.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0">
                          {getInitials(org.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-slate-100">
                            {org.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{org.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {org.industry}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor} ${statusBg}`}
                      >
                        {org.is_active ? 'Active' : 'Inactive'}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
