import { useState } from 'react';
import { SignInPayload } from '@/src/types/signin';
import { signupService } from '@/src/services/signup';

export const useSignin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (payload: SignInPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await signupService.signIn(payload);
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

    return {
        handleSignIn,
        handleForgotPassword,
        handleResetPasswordConfirm,
        isLoading,
        error
    };
};
