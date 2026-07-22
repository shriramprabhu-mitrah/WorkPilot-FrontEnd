import { apiService } from '@/src/services/axios';
import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { UserProfile, UserUpdatePayload } from '@/src/types/user';

class UserService {
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>(ApiEndpoints.User.getUser.url);
    if (!response.data) {
      throw new Error('Failed to fetch user profile');
    }
    return response.data;
  }

  async updateUserProfile(payload: UserUpdatePayload): Promise<UserProfile> {
    const response = await apiService.patch<UserProfile>(ApiEndpoints.Sign.userUpdate.url, payload);
    if (!response.data) {
      throw new Error('Failed to update user profile');
    }
    return response.data;
  }
}

export const userService = new UserService();
