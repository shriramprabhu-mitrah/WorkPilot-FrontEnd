'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser, useUserInsights } from '../../hooks/useUser';
import StatCard from '@/src/app/components/common/statcard/statcard';
import { Briefcase, CheckCircle2, Ban, X, Check } from 'lucide-react';
import { formatMonthYear } from '@/src/app/components/common/format';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { ROLE_LABELS } from '@/src/app/components/common/enum/index';
import { ROLE_TYPE } from '@/src/app/components/common/enum';
import { rolesData } from '@/src/modules/settings/data/rolesJson';
import ProfileSkeleton from './profileSkeleton';
import { PasswordStrength } from '@/src/app/components/common/password-strength/password-strength';
import { useSearchParams } from 'next/navigation';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
export default function Profile() {
  const { user, isLoading, error, updateUser, isUpdating, changePassword, isChangingPassword } =
    useUser();
  const { handleLogOutAsync } = useSignin();
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const passwordSectionRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { insights } = useUserInsights();
  const { push, replace } = useOrgNavigation();

  const shouldChangePassword = searchParams.get('changePassword') === 'true';
  const requirePasswordChange = user?.require_password_change || false;
  const [pwdData, setPwdData] = useState({
    old_password: '',
    new_password: '',
  });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const changePasswordRef = useRef<HTMLDivElement>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [fullName, setFullName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);
    try {
      await changePassword(pwdData);
      setPwdSuccess(true);
      setPwdData({ old_password: '', new_password: '' });
      setTimeout(() => {
        setPwdSuccess(false);

        // Only redirect if this was a required password change
        if (requirePasswordChange) {
          if (user?.role === 'super_admin') {
            push('/super-admin/dashboard');
          } else if (user?.organization_name) {
            // Get org slug from URL or user data
            const orgSlug = window.location.pathname.split('/')[1];
            push(`/${orgSlug}/dashboard`);
          } else {
            replace('/profile');
          }
        } else {
          // Normal password change - just close the form
          setIsChangingPwd(false);
        }
      }, 2000);
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };
  useEffect(() => {
    if (!shouldChangePassword && !requirePasswordChange) return;

    const timer = setTimeout(() => {
      if (shouldChangePassword) {
        // From navbar - just open the form and scroll
        setIsChangingPwd(true);
      }

      changePasswordRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [shouldChangePassword, requirePasswordChange]);

  // Auto-open password change form when required
  useEffect(() => {
    if (requirePasswordChange) {
      // Use setTimeout to avoid cascading renders
      const timer = setTimeout(() => {
        setIsChangingPwd(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [requirePasswordChange]);

  // Close password strength indicator when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        passwordSectionRef.current &&
        !passwordSectionRef.current.contains(event.target as Node)
      ) {
        setShowPasswordStrength(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  const displayName = user?.name || 'User';

  const createdAt = formatMonthYear(user?.created_at || '-');
  const roleDetails = rolesData.find((role) => role.role === user?.role);

  const handleSave = async () => {
    try {
      await updateUser({
        full_name: fullName,
        avatar: selectedAvatar ?? undefined,
      });

      setSelectedAvatar(null);
      setAvatarPreview('');
      setIsEditing(false);
    } catch {}
  };

  const handleCancel = () => {
    setFullName(user?.name || '');
    setAvatarPreview(user?.avatar_url || '');
    setSelectedAvatar(null);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <div className="w-full px-3 sm:px-0">
      <h1 className="mb-4 sm:mb-6 text-2xl font-bold text-gray-900 dark:text-slate-100">
        My Profile
      </h1>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="w-full md:w-[320px] shrink-0">
          {/* Profile Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Profile Header */}
            <div className="px-5 pt-6 pb-5">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-3 group">
                  <WpInput
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  <div
                    className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: user?.color || '#3B82F6' }}
                  >
                    {getInitials(displayName)}
                  </div>
                  {/* Online Status */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Name */}
                <div className="flex w-full items-center justify-center">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <WpInput
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-48 text-center font-bold"
                        autoFocus
                      />

                      <WpButton
                        type="button"
                        onClick={handleSave}
                        disabled={isUpdating || !isEditing}
                        className="!min-w-0 !h-8 !w-8 !p-0 !bg-transparent !shadow-none !text-green-600 hover:!bg-green-50 dark:hover:!bg-green-900/20"
                      >
                        <Check size={18} />
                      </WpButton>

                      <WpButton
                        type="button"
                        onClick={handleCancel}
                        className="!min-w-0 !h-8 !w-8 !p-0 !bg-transparent !shadow-none !text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                      >
                        <X size={18} />
                      </WpButton>
                    </div>
                  ) : (
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {displayName}
                    </h2>
                  )}
                </div>

                {/* Role */}
                <div className="mt-2 flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <Briefcase size={13} />
                  <span>{user?.role ? ROLE_LABELS[user.role as ROLE_TYPE] : '-'}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 dark:text-slate-400">Email</span>
                  <span className="truncate text-right text-sm font-medium text-gray-700 dark:text-slate-100">
                    {user?.email || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 dark:text-slate-400">Username</span>
                  <span className="truncate text-right text-sm font-medium text-gray-700 dark:text-slate-100">
                    {user?.username || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 dark:text-slate-400">Timezone</span>
                  <span className="text-right text-sm font-medium text-gray-700 dark:text-slate-100">
                    {user?.timezone || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 dark:text-slate-400">Member since</span>
                  <span className="text-right text-sm font-medium text-gray-700 dark:text-slate-100">
                    {createdAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              <div className="space-y-2">
                <WpButton
                  type="button"
                  disabled={isEditing || requirePasswordChange}
                  onClick={() => {
                    setFullName(user?.name || '');
                    setAvatarPreview(user?.avatar_url || '');
                    setSelectedAvatar(null);
                    setIsEditing(true);
                  }}
                  className="!mt-0 w-full !bg-white dark:!bg-slate-700 border border-gray-200 dark:border-slate-600 !text-gray-700 dark:!text-slate-100 hover:!bg-gray-50 dark:hover:!bg-slate-600"
                >
                  Edit Profile
                </WpButton>

                <WpButton
                  type="button"
                  disabled={requirePasswordChange}
                  onClick={() => {
                    const nextState = !isChangingPwd;

                    setIsChangingPwd(nextState);

                    if (nextState) {
                      setTimeout(() => {
                        changePasswordRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                      }, 100);
                    }
                  }}
                  className="!mt-0 w-full !bg-white dark:!bg-slate-700 border border-gray-200 dark:border-slate-600 !text-gray-700 dark:!text-slate-100 hover:!bg-gray-50 dark:hover:!bg-slate-600"
                >
                  {isChangingPwd ? 'Cancel' : 'Change password'}
                </WpButton>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* Top Stats */}
          <div className="w-full min-w-0 flex-1 space-y-6">
            {/* Top Stats */}
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard label="Assigned" value={insights?.total_assigned ?? 0} color="blue" />

              <StatCard label="In Progress" value={insights?.in_progress ?? 0} color="orange" />

              <StatCard label="Completed" value={insights?.completed ?? 0} color="green" />
            </div>

            {/* Overall Completion */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Overall Completion
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Progress across assigned tasks
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {insights?.completion_percentage ?? 0}%
                  </span>
                </div>
              </div>

              <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out dark:bg-blue-500"
                  style={{
                    width: `${Math.min(insights?.completion_percentage ?? 0, 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-slate-200">
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    {insights?.completed ?? 0}
                  </span>{' '}
                  of {insights?.total_assigned ?? 0} tasks completed
                </p>

                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {insights?.total_assigned
                    ? `${Math.round(((insights?.completed ?? 0) / insights.total_assigned) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-orange-500">
                <Briefcase size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Your Role: {user?.role ? ROLE_LABELS[user.role as ROLE_TYPE] : '-'}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-100 mb-6 leading-relaxed">
              {roleDetails?.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-slate-100">
                  Capabilities
                </h4>
                <ul className="space-y-3">
                  {roleDetails?.capabilities.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-100"
                    >
                      <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 dark:text-slate-100">
                  Restrictions
                </h4>
                <ul className="space-y-3">
                  {roleDetails?.restrictions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-100"
                    >
                      <Ban size={16} className="text-red-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          {isChangingPwd && (
            <div
              ref={changePasswordRef}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              {requirePasswordChange && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ Password change required
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You must change your password before you can access the dashboard. Click
                    &quot;Cancel&quot; to logout.
                  </p>
                </div>
              )}

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
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1.5">
                      Old Password
                    </label>

                    <WpInput
                      type="password"
                      value={pwdData.old_password}
                      onChange={(e) => setPwdData({ ...pwdData, old_password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative" ref={passwordSectionRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-100 mb-1.5">
                      New Password
                    </label>
                    <WpInput
                      type="password"
                      value={pwdData.new_password}
                      onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                      onFocus={() => setShowPasswordStrength(true)}
                      required
                    />
                    <PasswordStrength password={pwdData.new_password} show={showPasswordStrength} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <WpButton
                    type="button"
                    onClick={async () => {
                      // If password change is required by the system, logout on cancel
                      if (requirePasswordChange) {
                        await handleLogOutAsync();
                      } else {
                        // Normal case: just close the form and clear data
                        setIsChangingPwd(false);
                        setPwdData({ old_password: '', new_password: '' });
                        setPwdError(null);
                        setPwdSuccess(false);
                      }
                    }}
                    variant="warning"
                  >
                    Cancel
                  </WpButton>
                  <WpButton type="submit" disabled={isChangingPassword} variant="danger">
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </WpButton>
                </div>
              </form>
            </div>
          )}
          {/* <div className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">My Recent Tasks</h3>
          </div> */}
        </div>
      </div>
    </div>
  );
}
