'use client';

import React, { useState, useEffect } from 'react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { useSignup } from '../../hooks/useSignup';
import { formatTime } from '@/src/app/components/common/format';

interface VerifyEmailProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export const VerifyEmailModal = ({ email, onVerified, onBack }: VerifyEmailProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(180);
  const { handleVerifyEmailAsync, handleResendOtpAsync, verifyEmail, resendOtp } = useSignup();
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setError(null);
    setResendMsg(null);
    try {
      await handleVerifyEmailAsync({ email, otp: code });
      onVerified();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setError(null);
    setResendMsg(null);
    try {
      await handleResendOtpAsync(email);
      setTimer(30);
      setResendMsg('OTP sent successfully');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex w-full h-full">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white">
                <TrackrLogoSvg />
              </div>
              <span className="text-xl font-bold text-gray-900">WorkPilot</span>
            </div>

            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Mail size={24} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 mb-6">
              We sent a 6-digit verification code to
              <br />
              <strong className="text-blue-600 font-medium">{email}</strong>
            </p>

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            {resendMsg && <p className="text-green-500 mb-4 text-sm">{resendMsg}</p>}

            <div className="flex gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              ))}
            </div>

            <WpButton
              fullWidth
              size="lg"
              onClick={handleVerify}
              isLoading={verifyEmail.isLoading}
              disabled={otp.join('').length !== 6 || verifyEmail.isLoading}
            >
              Verify Email
            </WpButton>
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 mb-4">
                {timer > 0 ? (
                  <>
                    Resend code in{' '}
                    <span className="font-semibold text-gray-900">{formatTime(timer)}</span>
                  </>
                ) : (
                  <WpButton
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={resendOtp.isLoading}
                    isLoading={resendOtp.isLoading}
                    className="!p-0 !text-blue-600 hover:!text-blue-700 underline"
                  >
                    Resend Code
                  </WpButton>
                )}
              </p>

              <WpButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                leftIcon={<ArrowLeft size={16} />}
                className="!text-gray-600 hover:!text-gray-900"
              >
                Back to Sign Up
              </WpButton>
            </div>
          </div>
        </div>

        {/* Right Side: Graphic */}
        <div className="hidden md:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
          {/* Concentric circles background effect */}
          <div className="absolute w-[800px] h-[800px] border border-white/10 rounded-full" />
          <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full" />
          <div className="absolute w-[400px] h-[400px] border border-white/10 rounded-full" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/20">
              <Lock size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Secure verification</h2>
            <p className="text-blue-100 text-center leading-relaxed">
              We verify your email to keep your account and organization data safe. Codes expire
              after 3 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
