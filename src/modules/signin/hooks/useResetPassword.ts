import { useMutation } from '@tanstack/react-query';
import { signupService } from '@/src/services/signup';

interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => signupService.resetPasswordConfirm(payload),
  });
};
