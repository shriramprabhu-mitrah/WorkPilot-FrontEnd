'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../hooks/useUser';
import StatCard from '@/src/app/components/common/statcard/statcard';
import { Briefcase, CheckCircle2, Ban, Pencil, X, Check } from 'lucide-react';
import { colors } from '@/src/styles/colors';
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
import Image from 'next/image';
export default function Profile() {
  const { user, isLoading, error, updateUser, isUpdating, changePassword, isChangingPassword } =
    useUser();
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const searchParams = useSearchParams();

  const { push, replace } = useOrgNavigation();

  const shouldChangePassword = searchParams.get('changePassword') === 'true';
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
        setIsChangingPwd(false);
        setPwdSuccess(false);
        if (shouldChangePassword) {
          replace('/profile');
        }
      }, 2000);
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };
  useEffect(() => {
    if (!shouldChangePassword) return;

    const timer = setTimeout(() => {
      changePasswordRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [shouldChangePassword]);
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
  const STATS = [
    { label: 'Total Assigned', value: 0, color: colors.primary },
    { label: 'In Progress', value: 0, color: colors.orange500 },
    { label: 'Completed', value: 0, color: colors.green500 },
  ];
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
    } catch (error) {}
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
        <div className="w-full md:w-[320px] shrink-0 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
            <div className="relative mb-4 group">
              <WpInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarPreview || user?.avatar_url ? (
                <Image
                  src={avatarPreview || user?.avatar_url || ''}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-2xl object-cover shadow-sm"
                  unoptimized
                />
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-sm"
                  style={{ backgroundColor: user?.color }}
                >
                  {getInitials(displayName)}
                </div>
              )}
              {isEditing && (
                <WpButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -top-1 -right-1 !w-8 !h-8 !min-w-0 !p-0 rounded-full !bg-blue-600 !text-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200"
                >
                  <Pencil size={14} />
                </WpButton>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="mb-1 flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <WpInput
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-52 text-center font-bold"
                    autoFocus
                  />

                  <WpButton
                    type="button"
                    onClick={handleSave}
                    disabled={isUpdating || !isEditing}
                    className="!min-w-0 !w-8 !h-8 !p-0 !bg-transparent !shadow-none !text-green-600 hover:!bg-green-50"
                  >
                    <Check size={18} />
                  </WpButton>

                  <WpButton
                    type="button"
                    onClick={handleCancel}
                    className="!min-w-0 !w-8 !h-8 !p-0 !bg-transparent !shadow-none !text-red-600 hover:!bg-red-50"
                  >
                    <X size={18} />
                  </WpButton>
                </>
              ) : (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
              )}
            </div>

            <div className="mt-2 mb-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium">
              <Briefcase size={14} />
              {user?.role ? ROLE_LABELS[user.role as ROLE_TYPE] : '-'}
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <p className="mb-1">{user?.email || '-'}</p>
              <p>{user?.username}</p>
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
            <WpButton
              type="button"
              disabled={isEditing}
              onClick={() => {
                setFullName(user?.name || '');
                setAvatarPreview(user?.avatar_url || '');
                setSelectedAvatar(null);
                setIsEditing(true);
              }}
              className="mt-2 w-full !bg-white dark:!bg-slate-700 border border-gray-200 dark:border-slate-600 !text-gray-700 dark:!text-slate-100 hover:!bg-gray-50 dark:hover:!bg-slate-600"
            >
              Edit Profile
            </WpButton>
            <WpButton
              type="button"
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
              className="mt-2 w-full !bg-white dark:!bg-slate-700 border border-gray-200 dark:border-slate-600 !text-gray-700 dark:!text-slate-100 hover:!bg-gray-50 dark:hover:!bg-slate-600"
            >
              {isChangingPwd ? 'Cancel' : 'Change password'}
            </WpButton>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* Top Stats */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
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
                Your Role: {user?.role ? ROLE_LABELS[user.role as ROLE_TYPE] : '-'}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {roleDetails?.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Capabilities
                </h4>
                <ul className="space-y-3">
                  {roleDetails?.capabilities.map((item, i) => (
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
                  {roleDetails?.restrictions.map((item, i) => (
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

          {/* Change Password Form */}
          {(isChangingPwd || shouldChangePassword) && (
            <div
              ref={changePasswordRef}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
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
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                    onClick={() => {
                      setIsChangingPwd(false);

                      if (shouldChangePassword) {
                        replace('/profile');
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
          <div className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">My Recent Tasks</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
