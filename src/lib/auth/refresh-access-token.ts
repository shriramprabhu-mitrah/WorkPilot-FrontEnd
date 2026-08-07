import { SignInResponse } from '@/src/types/signin';
import { extractTokensFromResponse } from './token-utils';

const REFRESH_PATH = '/api/v1/auth/refresh';

const buildRefreshUrl = (origin?: string) => {
  if (origin) {
    return new URL(REFRESH_PATH, origin).toString();
  }

  return REFRESH_PATH;
};

export async function refreshAccessToken(
  refreshToken: string,
  origin?: string
): Promise<SignInResponse> {
  const response = await fetch(buildRefreshUrl(origin), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    credentials: origin ? 'omit' : 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const payload = await response.json();
  const tokens = extractTokensFromResponse(payload);

  if (!tokens?.access_token) {
    throw new Error('Refresh response did not include an access token');
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? refreshToken,
    token_type: 'bearer',
    expires_in: tokens.expires_in ?? 0,
    refresh_expires_in: 0,
  };
}
