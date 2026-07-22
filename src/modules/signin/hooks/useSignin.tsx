import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPayload } from '@/src/types/signin';
import { signupService } from '@/src/services/signup';
import { userService } from '@/src/services/user';
import { useAppDispatch } from '@/src/store';
import { setUser, clearUser } from '@/src/store/slices/users';
import { setTokens } from '@/src/lib/utils/cookies';

export const useSignin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleSignIn = async (payload: SignInPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await signupService.signIn(payload);
            
            // 3. Save accessToken & refreshToken
            if (response.data) {
                setTokens(response.data.access_token, response.data.refresh_token);
            }
            
            // 4. getUserProfile()
            const userProfile = await userService.getUserProfile();
            
            // 5. Store user data in Redux
            dispatch(setUser({
                name: userProfile.name || userProfile.full_name,
                username: userProfile.username,
                email: userProfile.email,
                role: userProfile.role,
                avatar_url: userProfile.avatar_url,
                is_active: userProfile.is_active
            }));
            
            // 6. Navigate to Dashboard
            router.push('/dashboard');
            
            return response;
        } catch (err: unknown) {
            setError( err instanceof Error ? err.message : "Failed to sign in");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (email: string) => {
        setIsLoading(true);
        try {
            const response = await signupService.resetPassword(email);
            return response;
        } catch (err: unknown) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPasswordConfirm = async (payload: { email: string; otp: string; new_password: string }) => {
        setIsLoading(true);
        try {
            const response = await signupService.resetPasswordConfirm(payload);
            return response;
        } catch (err: unknown) {
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogOut = async () => {
        setIsLoading(true);
        try {
            await signupService.logOut();
        } catch (err) {
        } finally {
            dispatch(clearUser());
            setIsLoading(false);
        }
    };

    return {
        handleSignIn,
        handleForgotPassword,
        handleResetPasswordConfirm,
        handleLogOut,
        isLoading,
        error
    };
};
