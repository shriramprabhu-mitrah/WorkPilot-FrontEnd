import { useMutation } from '@tanstack/react-query';
import { signupService } from '@/src/services/signup';
import { SignupPayload, VerifyEmailPayload } from '@/src/types/signup';

export const useSignup = () => {
  const signUpMutation = useMutation({
    mutationFn: (payload: SignupPayload) => signupService.signUp(payload),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (payload: VerifyEmailPayload) => signupService.verifyEmail(payload),
  });

  const resendOtpMutation = useMutation({
    mutationFn: (email: string) => signupService.resendOtp(email),
  });

  return {
    handleSignUp: signUpMutation.mutate,
    handleSignUpAsync: signUpMutation.mutateAsync,
    handleVerifyEmail: verifyEmailMutation.mutate,
    handleVerifyEmailAsync: verifyEmailMutation.mutateAsync,
    handleResendOtp: resendOtpMutation.mutate,
    handleResendOtpAsync: resendOtpMutation.mutateAsync,
    isLoading:
      signUpMutation.isPending || verifyEmailMutation.isPending || resendOtpMutation.isPending,
    error: signUpMutation.error || verifyEmailMutation.error || resendOtpMutation.error,

    signUp: {
      isLoading: signUpMutation.isPending,
      isSuccess: signUpMutation.isSuccess,
      isError: signUpMutation.isError,
      error: signUpMutation.error,
      data: signUpMutation.data,
    },
    verifyEmail: {
      isLoading: verifyEmailMutation.isPending,
      isSuccess: verifyEmailMutation.isSuccess,
      isError: verifyEmailMutation.isError,
      error: verifyEmailMutation.error,
      data: verifyEmailMutation.data,
    },
    resendOtp: {
      isLoading: resendOtpMutation.isPending,
      isSuccess: resendOtpMutation.isSuccess,
      isError: resendOtpMutation.isError,
      error: resendOtpMutation.error,
      data: resendOtpMutation.data,
    },
  };
};
