'use client';

import { useEffect, useRef, useState } from 'react';
import { KeyRound, LogOut, ShieldAlert } from 'lucide-react';
import { useAppDispatch } from '@/src/store';
import { setUser } from '@/src/store/slices/users';
import { useUser } from '@/src/modules/users/hooks/useUser';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
import { WpButton } from '../button';
import { WpInput } from '../input';
import { PasswordStrength } from '../password-strength/password-strength';

export const ForceChangePasswordModal = () => {
  const dispatch = useAppDispatch();
  const { changePassword, isChangingPassword } = useUser();
  const { handleLogOutAsync, logOut } = useSignin();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showStrength, setShowStrength] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Covers the new-password <input> AND the <PasswordStrength> popover.
  // A mousedown anywhere outside this ref closes the popover.
  const newPwdAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        newPwdAreaRef.current &&
        !newPwdAreaRef.current.contains(e.target as Node)
      ) {
        setShowStrength(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oldPassword.trim() || !newPassword.trim()) {
      setError('Both fields are required.');
      return;
    }

    if (newPassword === oldPassword) {
      setError('New password must be different from your temporary password.');
      return;
    }

    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => {
        dispatch(setUser({ require_password_change: false }));
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/*
        overflow-visible — keeps the PasswordStrength popover from being
        clipped by the card boundary.
      */}
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-slate-700 overflow-visible">

        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 rounded-t-2xl px-6 py-5 flex items-start gap-4">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
            <ShieldAlert size={22} />
          </span>
          <div>
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-100">
              Password change required
            </h2>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              You are signed in with a temporary password. You must set a new password before
              continuing.
            </p>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <span>✓</span>
              <span>Password changed successfully. Loading dashboard…</span>
            </div>
          )}

          {!success && (
            <>
              {/* Temporary password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Temporary password
                </label>
                <WpInput
                  type="password"
                  value={oldPassword}
                  onChange={(e) => { setOldPassword(e.target.value); setError(null); }}
                  placeholder="Enter your temporary password"
                  required
                  autoFocus
                />
              </div>

              {/*
                New password — ref wraps BOTH the input and the popover so the
                outside-click handler knows to keep it open when clicking inside either.
              */}
              <div className="relative" ref={newPwdAreaRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  New password
                </label>
                <WpInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                  onFocus={() => setShowStrength(true)}
                  placeholder="Choose a strong password"
                  required
                />
                <PasswordStrength password={newPassword} show={showStrength && !!newPassword} />
              </div>

              {/* Submit */}
              <WpButton
                type="submit"
                variant="primary"
                fullWidth
                disabled={isChangingPassword || !oldPassword || !newPassword}
                isLoading={isChangingPassword}
                loadingText="Changing password…"
                leftIcon={<KeyRound size={16} />}
              >
                Set new password
              </WpButton>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              </div>

              {/* Sign out */}
              <WpButton
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => handleLogOutAsync()}
                disabled={logOut.isLoading}
                isLoading={logOut.isLoading}
                loadingText="Signing out…"
                leftIcon={<LogOut size={16} />}
              >
                Sign out
              </WpButton>

              <p className="text-center text-xs text-gray-400 dark:text-slate-500">
                You cannot access the dashboard until your password is changed.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
