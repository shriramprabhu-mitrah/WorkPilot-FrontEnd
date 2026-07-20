import { ApiEndpoints } from "@/src/lib/constants/api-endpoints";
import { apiService } from "../axios";
import { ApiResponse } from "@/src/types/core";
import { SignupPayload, SignupResponse } from "@/src/types/signup";
import { ResetPasswordPaylaod, SignInPayload, SignInResponse } from "@/src/types/signin";

class SignupService {
    async signUp(payload: SignupPayload): Promise<ApiResponse<SignupResponse>> {
        const url = ApiEndpoints.Sign.signUp.url;
        return apiService.post<SignupResponse>(url, payload)
    }
    
    async signIn(payload: SignInPayload): Promise<ApiResponse<SignInResponse>> {
        const url = ApiEndpoints.Sign.signIn.url;
        return apiService.post<SignInResponse>(url, payload);
    }

    async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
        const url = ApiEndpoints.Sign.forgotPassword.url;
        return apiService.post<{ message: string }>(url, { email });
    }

    async resetPassword(email: string):Promise<ApiResponse<{message:string}>>{
        const url = ApiEndpoints.Sign.passwordReset.url;
        return apiService.post<{ message: string }>(url, { email });
    }
    async resetPasswordConfirm(payload: ResetPasswordPaylaod):Promise<ApiResponse<{message:string}>>{
        const url = ApiEndpoints.Sign.passwordConfirm.url;
        return apiService.post<{ message: string }>(url, payload);
    }
}

export const signupService = new SignupService();