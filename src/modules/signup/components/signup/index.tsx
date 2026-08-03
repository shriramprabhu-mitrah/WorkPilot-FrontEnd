'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ErrorMessage, inputErrorClass } from '@/src/app/components/common/errormessage';
const signupSchema = z
  .object({
    full_name: z.string().trim().min(1, 'Full name is required'),

    username: z.string().trim().min(1, 'Username is required'),

    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),

    confirmPwd: z.string().min(1, 'Please confirm your password'),

    agreedToTerms: z.boolean().refine((value) => value === true, {
      message: 'Please agree to the Terms and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPwd, {
    message: 'Passwords do not match',
    path: ['confirmPwd'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export const SignUp = () => {
  const { handleSignUpAsync, signUp } = useSignup();
  const [sidebarContent, setSidebarContent] = useState<'terms' | 'privacy' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'otp' | 'org' | 'done'>('otp');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit',
  });
  const firstErrorField = Object.keys(errors)[0];
  const email = watch('email');

  const router = useRouter();

  const onSubmit = async (data: SignupFormData) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await handleSignUpAsync({
        full_name: data.full_name,
        username: data.username,
        email: data.email,
        password: data.password,
        timezone,
      });
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

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            <WpInput
              id="name"
              type="text"
              label="Full Name"
              placeholder="Jane Smith"
              icon={<UserIconSvg />}
              {...register('full_name')}
              className={firstErrorField === 'full_name' ? inputErrorClass : ''}
              showRequired
            />
            {firstErrorField === 'full_name' && (
              <ErrorMessage message={errors.full_name?.message} />
            )}
            <WpInput
              id="username"
              type="text"
              label="User Name"
              placeholder="Enter username"
              icon={<UserIconSvg />}
              {...register('username')}
              className={firstErrorField === 'username' ? inputErrorClass : ''}
              showRequired
            />
            {firstErrorField === 'username' && <ErrorMessage message={errors.username?.message} />}
            <WpInput
              id="email"
              type="text"
              label="Work Email"
              placeholder="name@company.com"
              icon={<EmailIconSvg />}
              {...register('email')}
              className={firstErrorField === 'email' ? inputErrorClass : ''}
              showRequired
            />
            {firstErrorField === 'email' && <ErrorMessage message={errors.email?.message} />}

            <WpInput
              id="password"
              type="password"
              label="Password"
              placeholder="8+ characters"
              icon={<LockIconSvg />}
              {...register('password')}
              className={firstErrorField === 'password' ? inputErrorClass : ''}
              showRequired
            />
            {firstErrorField === 'password' && <ErrorMessage message={errors.password?.message} />}

            <WpInput
              id="confirmPwd"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon={<LockIconSvg />}
              {...register('confirmPwd')}
              className={firstErrorField === 'confirmPwd' ? inputErrorClass : ''}
              showRequired
            />
            {firstErrorField === 'confirmPwd' && (
              <ErrorMessage message={errors.confirmPwd?.message} />
            )}

            <div className="mb-6">
              <WpCheckbox
                id="terms"
                {...register('agreedToTerms')}
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
              {firstErrorField === 'agreedToTerms' && (
                <ErrorMessage message={errors.agreedToTerms?.message} />
              )}
            </div>

            <WpButton
              type="submit"
              fullWidth
              isLoading={signUp.isLoading}
              loadingText="Creating account..."
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
