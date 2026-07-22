import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, UserUpdatePayload } from '@/src/types/user';
import { userService } from '@/src/services/user';
import { useAppDispatch } from '@/src/store';
import { setUser as setUserRedux } from '@/src/store/slices/users';
import { signupService } from '@/src/services/signup';
import { ChangePassword } from '@/src/types/signin';

export const useUser = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    const { 
        data: user, 
        isLoading, 
        error, 
        refetch: fetchUser 
    } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const data = await userService.getUserProfile();
            dispatch(setUserRedux({
                name: data.name || data.full_name,
                email: data.email,
                role: data.role,
                avatar_url: data.avatar_url,
            }));
            return data;
        }
    });

    const { 
        mutateAsync: updateUser, 
        isPending: isUpdating 
    } = useMutation({
        mutationFn: async (payload: UserUpdatePayload) => {
            return await userService.updateUserProfile(payload);
        },
        onSuccess: () => {
            // Automatically triggers a background refetch and syncs with Redux
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });

    const {
        mutateAsync: changePassword,
        isPending: isChangingPassword
    } = useMutation({
        mutationFn: async (payload: ChangePassword) => {
            return await signupService.changePassword(payload);
        }
    });

    return {
        user: user as UserProfile | null | undefined,
        isLoading,
        isUpdating,
        isChangingPassword,
        error: error ? error.message : null,
        fetchUser,
        updateUser,
        changePassword
    };
};
