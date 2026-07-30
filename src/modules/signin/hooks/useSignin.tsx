import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signupService } from '../../../services/signup';
import { useAppDispatch } from '../../../store';
import { clearUser, setUser } from '../../../store/slices/users';
import { userService } from '../../../services/user';
import { SignInPayload } from '../../../types/signin';
export const useSignin = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const signInMutation = useMutation({
    mutationFn: async (payload: SignInPayload) => {
      const response = await signupService.signIn(payload);

      // Cookies are now handled by the backend
      const userProfile = await userService.getUserProfile();

      dispatch(
        setUser({
          name: userProfile.name || userProfile.full_name,
          username: userProfile.username,
          email: userProfile.email,
          role: userProfile.role,
          avatar_url: userProfile.avatar_url,
          is_active: userProfile.is_active,
        })
      );

      return response;
    },
    onSuccess: () => {
      router.refresh();
      router.push('/dashboard');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => signupService.resetPassword(email),
  });

  const resetPasswordConfirmMutation = useMutation({
    mutationFn: (payload: { email: string; otp: string; new_password: string }) =>
      signupService.resetPasswordConfirm(payload),
  });

  const logOutMutation = useMutation({
    mutationFn: () => signupService.logOut(),
    onSuccess: () => {
      // Clear user data on successful logout
      dispatch(clearUser());
      // Navigate to signin page
      router.push('/signin');
    },
    onError: () => {
      dispatch(clearUser());
      router.push('/signin');
    },
  });

  return {
    handleSignIn: signInMutation.mutate,
    handleSignInAsync: signInMutation.mutateAsync,
    handleForgotPassword: forgotPasswordMutation.mutate,
    handleForgotPasswordAsync: forgotPasswordMutation.mutateAsync,
    handleResetPasswordConfirm: resetPasswordConfirmMutation.mutate,
    handleResetPasswordConfirmAsync: resetPasswordConfirmMutation.mutateAsync,
    handleLogOut: logOutMutation.mutate,
    handleLogOutAsync: logOutMutation.mutateAsync,
    isLoading:
      signInMutation.isPending ||
      forgotPasswordMutation.isPending ||
      resetPasswordConfirmMutation.isPending ||
      logOutMutation.isPending,
    error:
      signInMutation.error ||
      forgotPasswordMutation.error ||
      resetPasswordConfirmMutation.error ||
      logOutMutation.error,

    signIn: {
      isLoading: signInMutation.isPending,
      isSuccess: signInMutation.isSuccess,
      isError: signInMutation.isError,
      error: signInMutation.error,
    },
    forgotPassword: {
      isLoading: forgotPasswordMutation.isPending,
      isSuccess: forgotPasswordMutation.isSuccess,
      isError: forgotPasswordMutation.isError,
      error: forgotPasswordMutation.error,
    },
    resetPasswordConfirm: {
      isLoading: resetPasswordConfirmMutation.isPending,
      isSuccess: resetPasswordConfirmMutation.isSuccess,
      isError: resetPasswordConfirmMutation.isError,
      error: resetPasswordConfirmMutation.error,
    },
    logOut: {
      isLoading: logOutMutation.isPending,
      isSuccess: logOutMutation.isSuccess,
      isError: logOutMutation.isError,
      error: logOutMutation.error,
    },
  };
};
