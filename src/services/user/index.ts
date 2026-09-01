import { apiService } from '@/src/services/axios';
import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { UserInsights, UserProfile, UserUpdatePayload } from '@/src/types/user';

class UserService {
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>(ApiEndpoints.User.getUser.url, {
      showErrorToast: true,
    });
    if (!response.data) {
      throw new Error('Failed to fetch user profile');
    }
    return response.data;
  }

  async updateUserProfile(payload: UserUpdatePayload): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('full_name', payload.full_name);
    if (payload.avatar) {
      formData.append('avatar', payload.avatar);
    }
    const response = await apiService.patch<UserProfile>(
      ApiEndpoints.User.userUpdate.url,
      formData,
      {
        showSuccessToast: true,
        showErrorToast: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (!response.data) {
      throw new Error('Failed to update user profile');
    }
    return response.data;
  }

  async getUserInsights(): Promise<UserInsights> {
    const response = await apiService.get<UserInsights>(ApiEndpoints.User.getUserInsights.url, {
      showErrorToast: true,
    });
    if (!response.data) {
      throw new Error('Failed to fetch user insights');
    }
    return response.data;
  }
}

export const userService = new UserService();
