import { signupService } from '@/src/services/signup';
import { SignupPayload, VerifyEmailPayload } from '@/src/types/signup';
import { useState } from 'react';

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (payload: SignupPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await signupService.signUp(payload);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (payload: VerifyEmailPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await signupService.verifyEmail(payload);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await signupService.resendOtp(email);
      return response;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSignUp,
    handleVerifyEmail,
    handleResendOtp,
    isLoading,
    error,
  };
};
