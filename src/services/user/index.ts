import { apiService } from '@/src/services/axios';
import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { UserProfile, UserUpdatePayload } from '@/src/types/user';

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
    const response = await apiService.patch<UserProfile>(
      ApiEndpoints.User.userUpdate.url,
      payload,
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
    if (!response.data) {
      throw new Error('Failed to update user profile');
    }
    return response.data;
  }
}

export const userService = new UserService();
