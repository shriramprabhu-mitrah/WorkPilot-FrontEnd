import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signupService } from '../../../services/signup';
import { persistor, useAppDispatch } from '../../../store';
import { clearUser, setUser } from '../../../store/slices/users';
import { userService } from '../../../services/user';
import { SignInPayload } from '../../../types/signin';
import { removeTokens, setTokens } from '../../../lib/utils/cookies';
import { getAuthSource } from '@/src/lib/utils/auth';
import { clearSelectedProject } from '@/src/store/slices/project';
import { organizationService } from '@/src/services/organization';
import { clearOrganization, setOrganization } from '@/src/store/slices/organization';
import { setIsLoggingOut } from '@/src/lib/config/axios-client';
import Cookies from 'js-cookie';

export const useSignin = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const authSource = getAuthSource();

  const isMobile = authSource === 'mobile';

  const performLogoutCleanup = async () => {
    setIsLoggingOut(true);
    dispatch(clearUser());
    dispatch(clearSelectedProject());
    dispatch(clearOrganization());
    removeTokens();
    Cookies.remove('org_slug', { path: '/' });

    try {
      await persistor.purge();
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore
      }
    }

    queryClient.cancelQueries();
    queryClient.clear();

    window.location.href = '/signin';
  };

  const signInMutation = useMutation({
    mutationFn: async (payload: SignInPayload) => {
      // Clear any leftover project state before signing in
      dispatch(clearSelectedProject());

      const response = await signupService.signIn(payload);

      if (response.data?.access_token) {
        setTokens(
          response.data.access_token,
          response.data.refresh_token,
          response.data.expires_in
        );
      }

      const userProfile = await userService.getUserProfile();

      dispatch(
        setUser({
          name: userProfile.name || userProfile.full_name,
          username: userProfile.username,
          userid: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          avatar_url: userProfile.avatar_url,
          is_active: userProfile.is_active,
          color: userProfile.color,
          require_password_change: userProfile.require_password_change ?? false,
        })
      );

      // Fetch organization to get the slug
      let organizationData = null;
      if (userProfile.role !== 'super_admin') {
        try {
          const organizationResponse = await organizationService.getOrganization();
          if (organizationResponse.data) {
            organizationData = organizationResponse.data;
            dispatch(setOrganization(organizationResponse.data));

            // Store org slug in cookie for middleware access
            if (organizationData.slug) {
              Cookies.set('org_slug', organizationData.slug, {
                expires: 365, // 1 year
                path: '/',
                sameSite: 'lax',
              });
            }
          }
        } catch (error) {}
      }

      return { ...response, organization: organizationData, userProfile };
    },
    onSuccess: async (data) => {
      const token = data?.data?.access_token;
      const orgSlug = data?.organization?.slug;
      const userRole = data?.userProfile?.role;

      if (isMobile && token) {
        const mobileToken = token;
        await signupService.logOut();
        window.location.href = `workpilot://auth?token=${encodeURIComponent(mobileToken)}`;
      } else {
        // Check if user is super_admin
        if (userRole === 'super_admin') {
          router.push('/super-admin/dashboard');
        } else if (orgSlug) {
          router.push(`/${orgSlug}/dashboard`);
        } else {
          router.push('/setup');
        }
      }
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
    onSuccess: async () => {
      await performLogoutCleanup();
    },
    onError: async () => {
      await performLogoutCleanup();
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

    isLoading: signInMutation.isPending,
    // isLoading:
    //   signInMutation.isPending ||
    //   forgotPasswordMutation.isPending ||
    //   resetPasswordConfirmMutation.isPending ||
    //   logOutMutation.isPending,
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
    authSource,
    isMobile,
  };
};
