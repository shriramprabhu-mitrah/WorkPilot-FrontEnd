import { ApiEndpoints } from "@/src/lib/constants/api-endpoints";
import { apiService } from "../axios";
import { ApiResponse } from "@/src/types/core";
import { SignupPayload, SignupResponse } from "@/src/types/signup";

class SignupService {
    async signUp(payload: SignupPayload): Promise<ApiResponse<SignupResponse>> {
        const url=ApiEndpoints.Sign.signUp.url;
        return apiService.post<SignupResponse>(url,payload)
    }
}

export const signupService = new SignupService();