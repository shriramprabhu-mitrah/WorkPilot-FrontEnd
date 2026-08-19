import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { SignupPayload, SignupResponse, VerifyEmailPayload } from '@/src/types/signup';
import {
  ChangePassword,
  ResetPasswordPaylaod,
  SignInPayload,
  SignInResponse,
} from '@/src/types/signin';

class SignupService {
  async signUp(payload: SignupPayload): Promise<ApiResponse<SignupResponse>> {
    const url = ApiEndpoints.Sign.signUp.url;
    const formData = new FormData();
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('full_name', payload.full_name);
    formData.append('username', payload.username);
    formData.append('timezone', payload.timezone ?? '');
    if (payload.avatar) formData.append('avatar', payload.avatar);
    return apiService.post<SignupResponse>(url, formData, {
      showSuccessToast: true,
      showErrorToast: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async signIn(payload: SignInPayload): Promise<ApiResponse<SignInResponse>> {
    const url = ApiEndpoints.Sign.signIn.url;
    return apiService.post<SignInResponse>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<SignInResponse>> {
    const url = ApiEndpoints.Sign.refresh.url;
    return apiService.post<SignInResponse>(
      url,
      { refresh_token: refreshToken },
      {
        showSuccessToast: false,
        showErrorToast: false,
      }
    );
  }

  async logOut(): Promise<ApiResponse<{ message: string }>> {
    const url = ApiEndpoints.Sign.logOut.url;
    return apiService.post<{ message: string }>(
      url,
      {},
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }

  async changePassword(payload: ChangePassword): Promise<ApiResponse<{ message: string }>> {
    const url = ApiEndpoints.Sign.forgotPassword.url;
    return apiService.post<{ message: string }>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async resetPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const url = ApiEndpoints.Sign.passwordReset.url;
    return apiService.post<{ message: string }>(
      url,
      { email },
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }

  async resetPasswordConfirm(
    payload: ResetPasswordPaylaod
  ): Promise<ApiResponse<{ message: string }>> {
    const url = ApiEndpoints.Sign.passwordConfirm.url;
    return apiService.post<{ message: string }>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<{ message: string }>> {
    const url = ApiEndpoints.Sign.verifyPassword.url;
    return apiService.post<{ message: string }>(url, payload, {
      showSuccessToast: true,
      showErrorToast: true,
    });
  }

  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    const url = ApiEndpoints.Sign.resendEmail.url;
    return apiService.post<{ message: string }>(
      url,
      { email },
      {
        showSuccessToast: true,
        showErrorToast: true,
      }
    );
  }

  async validateUserDetail(
    type: 'email' | 'username',
    value: string
  ): Promise<ApiResponse<{ available: boolean; type: string; value: string }>> {
    const url = ApiEndpoints.Sign.validateUser.withQuery({ type, value });
    return apiService.get<{ available: boolean; type: string; value: string }>(url, {
      showSuccessToast: false,
      showErrorToast: false,
    });
  }
}

export const signupService = new SignupService();
