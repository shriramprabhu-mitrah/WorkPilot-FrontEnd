'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSignin } from '../../hooks/useSignin';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/src/lib/utils/cookies';
import { TrackrLogoSvg, EmailIconSvg, CloseIconSvg } from '@/src/assets/svgs';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { WpCheckbox } from '@/src/app/components/common/checkbox';
import { LockIcon } from 'lucide-react';

export const SignIn = () => {
  const { handleSignIn, handleForgotPassword, handleResetPasswordConfirm, isLoading, error } =
    useSignin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const [showForgotSidebar, setShowForgotSidebar] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await handleSignIn({ email, password, rememberMe });
      if (response.data) {
        setTokens(response.data.access_token, response.data.refresh_token);
      }
      router.push('/dashboard');
    } catch {
      // Error is handled by the hook and exposed via error state
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    try {
      const response = await handleForgotPassword(forgotEmail);
      setForgotSuccessMessage(response?.message || 'Reset link sent successfully to your email.');
      setForgotStep(2);
    } catch (err: unknown) {
      setForgotErrorMsg(err instanceof Error ? err.message : 'Failed to send reset link');
      throw err;
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !resetOtp || !resetNewPassword) return;
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    try {
      const response = await handleResetPasswordConfirm({
        email: forgotEmail,
        otp: resetOtp,
        new_password: resetNewPassword,
      });
      setForgotSuccessMessage(response?.message || 'Password reset successfully.');
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: unknown) {
      setForgotErrorMsg(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  return (
    <div className="signinContainer">
      <div className="logo">
        <div className="logoIcon">
          <TrackrLogoSvg />
        </div>
        WorkPilot
      </div>

      <h1 className="signinTitle">Welcome back</h1>
      <h2 className="subtitle">Sign in to your workspace to continue.</h2>

      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <WpInput
          id="email"
          type="email"
          label="Email Address"
          placeholder="name@company.com"
          icon={<EmailIconSvg />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <WpInput
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          icon={<LockIcon size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <div className="optionsRow">
          <WpCheckbox
            id="rememberMe"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <WpButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setForgotSuccessMessage(null);
              setForgotErrorMsg(null);
              setForgotStep(1);
              setShowForgotSidebar(true);
            }}
          >
            Forgot Password?
          </WpButton>
        </div>

        {error && (
          <div style={{ color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <WpButton type="submit" fullWidth isLoading={isLoading} loadingText="Signing in...">
          Sign in
        </WpButton>
      </form>

      <div className="signupPrompt">
        Don&apos;t have an account?
        <Link href="/signup" className="signupLink">
          Create account
        </Link>
      </div>

      {showForgotSidebar && (
        <div
          className="fixed inset-0 z-[999] flex justify-end bg-black/50"
          onClick={() => setShowForgotSidebar(false)}
        >
          <div
            className="flex h-screen w-full max-w-[600px] animate-[slideIn_0.3s_ease-out] flex-col bg-white p-10 shadow-[-4px_0_15px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <WpButton
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-6 top-6 !p-2 hover:bg-gray-100"
              onClick={() => setShowForgotSidebar(false)}
            >
              <CloseIconSvg />
            </WpButton>

            <div className="mt-5 mb-10 flex items-center text-2xl font-bold">
              <div className="mr-3 h-8 w-8 rounded-lg bg-[#0d6efd]">
                <TrackrLogoSvg />
              </div>
              WorkPilot
            </div>

            <h1 className="mb-2 text-[28px] font-bold text-gray-900">Forgot Password?</h1>
            <p className="mb-8 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form
              onSubmit={forgotStep === 1 ? handleForgotSubmit : handleResetSubmit}
              className="w-full"
            >
              <WpInput
                id="forgotEmail"
                type="email"
                label="Email Address"
                placeholder="name@company.com"
                icon={<EmailIconSvg />}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={forgotStep === 2}
              />

              {forgotStep === 2 && (
                <>
                  <WpInput
                    id="resetOtp"
                    type="text"
                    label="OTP"
                    placeholder="Enter OTP"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                  />

                  <WpInput
                    id="resetNewPassword"
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    icon={<LockIcon size={16} />}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    required
                  />
                </>
              )}

              {forgotErrorMsg && <div className="mb-4 text-sm text-red-500">{forgotErrorMsg}</div>}
              {forgotSuccessMessage && (
                <div className="mb-4 text-sm text-green-600">{forgotSuccessMessage}</div>
              )}

              <WpButton
                type="submit"
                fullWidth
                isLoading={isLoading}
                loadingText={forgotStep === 1 ? 'Sending link...' : 'Resetting Password...'}
                disabled={!forgotEmail || (forgotStep === 2 && (!resetOtp || !resetNewPassword))}
                className="mb-4"
              >
                {forgotStep === 1 ? 'Send Reset Link' : 'Reset Password'}
              </WpButton>
            </form>

            <WpButton
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowForgotSidebar(false)}
            >
              Back to Login
            </WpButton>
          </div>
        </div>
      )}
    </div>
  );
};
