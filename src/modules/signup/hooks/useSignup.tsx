import { signupService } from '@/src/services/signup';
import { SignupPayload } from '@/src/types/signup';
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
            setError( err instanceof Error ? err.message : "Failed to sign in");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleSignUp,
        isLoading,
        error
    };
};
