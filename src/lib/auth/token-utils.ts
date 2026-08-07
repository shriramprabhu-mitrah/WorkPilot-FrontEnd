export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export interface TokenPair {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export const extractTokensFromResponse = (payload: unknown): TokenPair | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.access_token === 'string') {
    return {
      access_token: record.access_token,
      refresh_token: typeof record.refresh_token === 'string' ? record.refresh_token : undefined,
      expires_in: typeof record.expires_in === 'number' ? record.expires_in : undefined,
    };
  }

  if (record.data && typeof record.data === 'object') {
    return extractTokensFromResponse(record.data);
  }

  if (record.result && typeof record.result === 'object') {
    return extractTokensFromResponse(record.result);
  }

  return null;
};
