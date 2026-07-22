'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import StatCard from '@/src/app/components/common/statcard/statcard';
import { Briefcase, CheckCircle2, Ban, Mail } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { formatMonthYear } from '@/src/app/components/common/format';
import { UserUpdatePayload } from '@/src/types/user';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';

export default function Profile() {
  const { user, isLoading, error, updateUser, isUpdating, changePassword, isChangingPassword } =
    useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [formData, setFormData] = useState<UserUpdatePayload>({
    full_name: '',
    department: '',
    location: '',
    timezone: '',
  });
  const [pwdData, setPwdData] = useState({
    old_password: '',
    new_password: '',
  });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleEditToggle = () => {
    if (!isEditing && user) {
      setFormData({
        full_name: user.name || user.full_name || '',
        department: user.department || '',
        location: user.location || '',
        timezone: user.timezone || 'UTC-8 (PST)',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);
    try {
      await changePassword(pwdData);
      setPwdSuccess(true);
      setPwdData({ old_password: '', new_password: '' });
      setTimeout(() => {
        setIsChangingPwd(false);
        setPwdSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center p-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  const displayName = user?.name || user?.full_name || '-';
  const STATS = [
    { label: 'Total Assigned', value: 0, color: colors.primary },
    { label: 'In Progress', value: 0, color: colors.orange500 },
    { label: 'Completed', value: 0, color: colors.green500 },
  ];
  const createdAt = formatMonthYear(user?.created_at || '-');

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Left Column */}
      <div className="w-full md:w-[320px] shrink-0 space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-sm">
              {getInitials(displayName)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>

          <div className="mt-2 mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium">
            <Briefcase size={14} />
            {user?.role || '-'}
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <p className="mb-1">{user?.email || '-'}</p>
            <p>
              {user?.department || '-'} • {user?.location || '-'}
            </p>
          </div>

          <div className="w-full space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6 border-t border-gray-100 dark:border-gray-700 pt-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Timezone</span>
              <span className="font-medium">{user?.timezone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member since</span>
              <span className="font-medium">{createdAt}</span>
            </div>
          </div>

          <WpButton variant="primary" onClick={handleEditToggle}>
            {isEditing ? 'Cancel editing' : 'Edit profile'}
          </WpButton>

          <WpButton variant="danger" onClick={() => setIsChangingPwd(!isChangingPwd)}>
            {isChangingPwd ? 'Cancel' : 'Change password'}
          </WpButton>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>

        {/* Overall Completion */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Overall Completion</h3>
            <span className="text-blue-600 font-bold">0%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">0 of 0 tasks completed</p>
        </div>

        {/* Role Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-orange-500">
              <Briefcase size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Your Role: {user?.role || '-'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Leads one or more projects within the organization. Responsible for delivery, sprint
            planning, and team coordination.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Capabilities
              </h4>
              <ul className="space-y-3">
                {[
                  'Create projects (if org policy allows)',
                  'Create / Edit / Delete parent & child tasks',
                  'Assign and reassign tasks to members',
                  'Manage sprint lifecycle & backlog',
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Restrictions
              </h4>
              <ul className="space-y-3">
                {[
                  'Cannot invite new users into the organization',
                  'Cannot access projects they are not assigned to',
                  'Cannot manage organization settings',
                  'Cannot change organization-wide user roles',
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <Ban size={16} className="text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <WpInput
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <WpInput type="email" disabled value={user?.email} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Department
                  </label>
                  <WpInput
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Location
                  </label>
                  <WpInput
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                  >
                    <option value="UTC-8 (PST)">UTC-8 (PST)</option>
                    <option value="UTC-5 (EST)">UTC-5 (EST)</option>
                    <option value="UTC+0 (GMT)">UTC+0 (GMT)</option>
                    <option value="UTC+5:30 (IST)">UTC+5:30 (IST)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <WpButton type="button" variant="danger" onClick={() => setIsEditing(false)}>
                  Cancel
                </WpButton>

                <WpButton type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </WpButton>
              </div>
            </form>
          </div>
        )}

        {/* Change Password Form */}
        {isChangingPwd && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Change Password
            </h3>

            {pwdError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">
                Password changed successfully!
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Old Password
                  </label>
                  <WpInput
                    type="password"
                    value={pwdData.old_password}
                    onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <WpInput
                    type="password"
                    value={pwdData.new_password}
                    onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <WpButton type="button" onClick={() => setIsChangingPwd(false)} variant="warning">
                  Cancel
                </WpButton>
                <WpButton type="submit" disabled={isChangingPassword} variant="danger">
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </WpButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
