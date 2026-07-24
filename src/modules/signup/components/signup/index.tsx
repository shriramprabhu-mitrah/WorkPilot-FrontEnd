'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSignup } from '../../hooks/useSignup';
import { useRouter } from 'next/navigation';
import { TermsConditions } from '../../../../app/components/common/terms-coditions';
import { PrivacyPolicy } from '../../../../app/components/common/privacy';
import {
  TrackrLogoSvg,
  EmailIconSvg,
  UserIconSvg,
  LockIconSvg,
  CloseIconSvg,
} from '@/src/assets/svgs';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { WpCheckbox } from '@/src/app/components/common/checkbox';
import { VerifyEmailModal } from '../verify-email';
import { OrganizationSetupModal } from '../../../organization/components/organization-setup';

export const SignUp = () => {
  const { handleSignUpAsync, signUp } = useSignup();
  const [full_name, setName] = useState('');
  const [username, setuserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<'terms' | 'privacy' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'otp' | 'org' | 'done'>('otp');

  const passwordsMatch = password === confirmPwd;
  const isFormValid =
    full_name.trim() !== '' &&
    username.trim() !== '' &&
    email.trim() !== '' &&
    password !== '' &&
    confirmPwd !== '' &&
    passwordsMatch &&
    agreedToTerms;

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await handleSignUpAsync({ full_name, username, email, password, timezone });
      setIsSuccess(true);
    } catch {
      // Error handled by React Query and toast
    }
  };

  return (
    <div className="signinContainer">
      {isSuccess && onboardingStep === 'otp' && (
        <VerifyEmailModal
          email={email}
          onBack={() => setIsSuccess(false)}
          onVerified={() => setOnboardingStep('org')}
        />
      )}

      {isSuccess && onboardingStep === 'org' && (
        <OrganizationSetupModal
          onComplete={() => {
            setOnboardingStep('done');
            router.push('/dashboard'); // or wherever makes sense after setup
          }}
        />
      )}

      {isSuccess && onboardingStep === 'done' ? (
        <div className="flex w-full flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50" />
          <h1 className="signinTitle mb-4">Account created!</h1>
          <p className="mb-8 text-sm leading-[1.6] text-gray-500">
            Setup complete. Welcome to WorkPilot.
          </p>

          <WpButton type="button" variant="primary" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </WpButton>
        </div>
      ) : (
        <>
          <div className="logo">
            <div className="logoIcon">
              <TrackrLogoSvg />
            </div>
            WorkPilot
          </div>

          <h1 className="signinTitle">Create your account</h1>
          <h2 className="subtitle">Get started free — no credit card required.</h2>

          <form onSubmit={onSubmit} style={{ width: '100%' }}>
            <WpInput
              id="name"
              type="text"
              label="Full Name"
              placeholder="Jane Smith"
              icon={<UserIconSvg />}
              value={full_name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <WpInput
              id="username"
              type="text"
              label="User Name"
              placeholder="Enter username"
              icon={<UserIconSvg />}
              value={username}
              onChange={(e) => setuserName(e.target.value)}
              required
            />

            <WpInput
              id="email"
              type="email"
              label="Work Email"
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
              placeholder="8+ characters"
              icon={<LockIconSvg />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <WpInput
              id="confirmPwd"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon={<LockIconSvg />}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              minLength={8}
              error={
                password && confirmPwd && !passwordsMatch ? 'Passwords do not match' : undefined
              }
            />

            <div className="mb-6">
              <WpCheckbox
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                label={
                  <span className="text-xs text-gray-500">
                    By continuing you agree to our{' '}
                    <WpButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!p-0 !text-xs text-blue-600"
                      onClick={() => setSidebarContent('terms')}
                    >
                      Terms
                    </WpButton>{' '}
                    and{' '}
                    <WpButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="!p-0 !text-xs text-blue-600"
                      onClick={() => setSidebarContent('privacy')}
                    >
                      Privacy Policy
                    </WpButton>
                  </span>
                }
              />
            </div>

            <WpButton
              type="submit"
              fullWidth
              isLoading={signUp.isLoading}
              loadingText="Creating account..."
              disabled={!isFormValid}
            >
              Create Account
            </WpButton>
          </form>

          <div className="signupPrompt" style={{ marginTop: '24px' }}>
            Already have an account?
            <Link href="/signin" className="signupLink">
              Sign in
            </Link>
          </div>

          {sidebarContent && (
            <div className="sidebarOverlay" onClick={() => setSidebarContent(null)}>
              <div className="sidebarContainer" onClick={(e) => e.stopPropagation()}>
                <WpButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="sidebarCloseBtn"
                  onClick={() => setSidebarContent(null)}
                >
                  <CloseIconSvg />
                </WpButton>
                {sidebarContent === 'terms' ? <TermsConditions /> : <PrivacyPolicy />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
