import { ApiEndpoints } from "@/src/lib/constants/api-endpoints";
import { apiService } from "../axios";
import { ApiResponse } from "@/src/types/core";
import { SignInPayload, SignInResponse } from "@/src/types/signin";

class SigninService {
    async signIn(payload: SignInPayload): Promise<ApiResponse<SignInResponse>> {
        const url = ApiEndpoints.Sign.signIn.url;
        return apiService.post<SignInResponse>(url, payload);
    }
}

export const signinService = new SigninService();
