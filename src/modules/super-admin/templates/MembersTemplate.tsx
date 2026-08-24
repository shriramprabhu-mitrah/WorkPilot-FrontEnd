'use client';

import React, { useState, useMemo } from 'react';
import { Search, Trash2, ChevronDown } from 'lucide-react';
import { members, organizations } from '../data/mockData';

const avatarColors = [
  'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-amber-500',
  'bg-purple-500', 'bg-teal-500', 'bg-rose-500', 'bg-indigo-500',
];

export const MembersTemplate = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('All Organizations');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const getAvatarColor = (id: string) => {
    const index = parseInt(id, 10) % avatarColors.length;
    return avatarColors[index];
  };

  const filteredMembers = useMemo(() => {
    let filtered = members;
    if (selectedOrg !== 'All Organizations') {
      filtered = filtered.filter((m) => m.organization === selectedOrg);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.organization.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [searchQuery, selectedOrg]);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">All Members</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {members.length} members across all organizations
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Organization Filter Dropdown */}
          <div className="relative sm:w-64">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <span className="text-gray-700 dark:text-slate-300">{selectedOrg}</span>
              <ChevronDown
                size={18}
                className={`text-gray-400 dark:text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedOrg('All Organizations'); setIsDropdownOpen(false); }}
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
                      onClick={() => { setSelectedOrg(org.name); setIsDropdownOpen(false); }}
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                {['Member','Email','Organization','Role','Status','Joined','Actions'].map((col) => (
                  <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredMembers.map((member) => {
                const isActive = member.status === 'Active';
                const statusCls = isActive
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                  : 'text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700';

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
                      <span className="text-sm text-gray-700 dark:text-slate-300">{member.organization}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusCls}`}>
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
        </div>
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 text-sm">No members found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
