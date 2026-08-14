'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignin } from '../../hooks/useSignin';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrackrLogoSvg, EmailIconSvg, CloseIconSvg } from '@/src/assets/svgs';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { WpCheckbox } from '@/src/app/components/common/checkbox';
import { LockIcon } from 'lucide-react';
import { ErrorMessage, inputErrorClass } from '@/src/app/components/common/errormessage';

const signinSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type SigninFormData = z.infer<typeof signinSchema>;

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const resetPasswordSchema = z.object({
  otp: z.string().trim().min(1, 'OTP is required'),

  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const SignIn = () => {
  const {
    handleSignInAsync,
    handleForgotPasswordAsync,
    handleResetPasswordConfirmAsync,
    isLoading,
    forgotPassword,
    resetPasswordConfirm,
    isMobile
  } = useSignin();
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const [showForgotSidebar, setShowForgotSidebar] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetResetForm,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    mode: 'onSubmit',
  });
  const firstErrorField = Object.keys(errors)[0];
  // const email = watch('email');

  // // Debounced Email Validation
  // useEffect(() => {
  //   if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

  //   const timeoutId = setTimeout(async () => {
  //     try {
  //       const res = await signupService.validateUserDetail('email', email);
  //       if (res.data?.available === false) {
  //         setError('email', {
  //           type: 'manual',
  //           message: res.message || 'Invalid email',
  //         });
  //       } else if (errors.email?.type === 'manual') {
  //         clearErrors('email');
  //       }
  //     } catch (err: unknown) {
  //       setError('email', {
  //         type: 'manual',
  //         message: err instanceof Error ? err.message : 'Invalid email',
  //       });
  //     }
  //   }, 500);

  //   return () => clearTimeout(timeoutId);
  // }, [email, setError, clearErrors, errors.email?.type]);

  const {
    register: registerForgot,
    handleSubmit: handleForgotFormSubmit,
    reset: resetForgotForm,
    formState: { errors: forgotErrors },
    setValue,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
  });

  const {
    register: registerReset,
    handleSubmit: handleResetFormSubmit,
    formState: { errors: resetErrors },
    reset: resetValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      await handleSignInAsync({
        email: data.email,
        password: data.password,
        rememberMe,
      });
    } catch {
      // Error is handled by React Query and toast
    }
  };

  const resetForgotPasswordFlow = () => {
    setForgotStep(1);
    setForgotEmail('');
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    resetForgotForm();
    resetResetForm();
    resetValues();
  };

  const handleForgotSubmit = async (data: ForgotPasswordFormData) => {
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    try {
      const response = await handleForgotPasswordAsync(data.email);
      setForgotEmail(data.email);
      setForgotSuccessMessage(response?.message || 'Reset link sent successfully to your email.');
      setForgotStep(2);
    } catch (err: unknown) {
      setForgotErrorMsg(err instanceof Error ? err.message : 'Failed to send reset link');
    }
  };

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    setForgotSuccessMessage(null);
    setForgotErrorMsg(null);
    try {
      const response = await handleResetPasswordConfirmAsync({
        email: forgotEmail,
        otp: data.otp,
        new_password: data.newPassword,
      });
      setForgotSuccessMessage(response?.message || 'Password reset successfully.');
      setForgotEmail('');
      resetForgotPasswordFlow();
      setShowForgotSidebar(false);
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

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <WpInput
          id="email"
          type="text"
          label="Email Address "
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
          placeholder="••••••••"
          icon={<LockIcon size={16} />}
          {...register('password')}
          className={firstErrorField === 'password' ? inputErrorClass : ''}
          minLength={8}
          showRequired
        />
        {firstErrorField === 'password' && <ErrorMessage message={errors.password?.message} />}
        <div className="optionsRow">
          {/* future purpose
          <WpCheckbox
            id="rememberMe"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          /> */}
          <WpButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForgotPasswordFlow();
              setShowForgotSidebar(true);
            }}
          >
            Forgot Password?
          </WpButton>
        </div>

        <WpButton type="submit" fullWidth isLoading={isLoading} loadingText="Signing in...">
          Sign in
        </WpButton>
      </form>

      <div className="signupPrompt">
        Don&apos;t have an account?
        <Link
          href={`/signup?source=${isMobile ? 'mobile' : 'web'}`}
          className="signupLink"
        >
          Create account
        </Link>
      </div>


      {showForgotSidebar && (
        <div
          className="fixed inset-0 z-[999] flex justify-end bg-black/50"
          onClick={() => {
            resetForgotPasswordFlow();
            setShowForgotSidebar(false);
            resetValues();
          }}
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
              onSubmit={
                forgotStep === 1
                  ? handleForgotFormSubmit(handleForgotSubmit)
                  : handleResetFormSubmit(handleResetSubmit)
              }
              className="w-full"
            >
              {forgotStep === 1 ? (
                <>
                  <WpInput
                    id="forgotEmail"
                    type="email"
                    label="Email Address"
                    placeholder="name@company.com"
                    icon={<EmailIconSvg />}
                    {...registerForgot('email')}
                    className={forgotErrors.email ? inputErrorClass : ''}
                    showRequired
                  />
                  <ErrorMessage message={forgotErrors.email?.message} />
                </>
              ) : (
                <>
                  <WpInput
                    id="forgotEmail"
                    type="email"
                    label="Email Address"
                    value={forgotEmail}
                    disabled
                  />

                  <WpInput
                    id="resetOtp"
                    type="text"
                    label="OTP"
                    placeholder="Enter OTP"
                    {...registerReset('otp')}
                    className={resetErrors.otp ? inputErrorClass : ''}
                    showRequired
                  />

                  <ErrorMessage message={resetErrors.otp?.message} />

                  <WpInput
                    id="resetNewPassword"
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    icon={<LockIcon size={16} />}
                    {...registerReset('newPassword')}
                    className={resetErrors.newPassword ? inputErrorClass : ''}
                    showRequired
                  />

                  <ErrorMessage message={resetErrors.newPassword?.message} />
                </>
              )}

              {forgotErrorMsg && <div className="mb-4 text-sm text-red-500">{forgotErrorMsg}</div>}

              {forgotSuccessMessage && (
                <div className="mb-4 text-sm text-green-600">{forgotSuccessMessage}</div>
              )}

              <WpButton
                type="submit"
                className="mt-5"
                fullWidth
                isLoading={
                  forgotStep === 1 ? forgotPassword.isLoading : resetPasswordConfirm.isLoading
                }
                loadingText={forgotStep === 1 ? 'Sending link...' : 'Resetting Password...'}
              >
                {forgotStep === 1 ? 'Send Reset Link' : 'Reset Password'}
              </WpButton>
            </form>

            <WpButton
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                resetForgotPasswordFlow();
                setShowForgotSidebar(true);
              }}
            >
              Back to Login
            </WpButton>
          </div>
        </div>
      )}
    </div>
  );
};
