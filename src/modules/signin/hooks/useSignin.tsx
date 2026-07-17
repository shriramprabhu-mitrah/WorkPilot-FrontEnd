import { useState } from 'react';
import { signinService } from '@/src/services/signin';
import { SignInPayload } from '@/src/types/signin';

export const useSignin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (payload: SignInPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await signinService.signIn(payload);
            return response;
        } catch (err: unknown) {
            setError( err instanceof Error ? err.message : "Failed to sign in");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleSignIn,
        isLoading,
        error
    };
};
