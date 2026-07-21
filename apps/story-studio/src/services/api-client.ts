import { apiUrl } from '@/utils/api-url';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthTokens } from '@/types';

interface ErrorBody {
  message?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<AuthTokens | null> | null = null;

async function refreshTokens(): Promise<AuthTokens | null> {
  const { tokens } = useAuthStore.getState();
  if (!tokens?.refreshToken) return null;

  try {
    const res = await fetch(apiUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    if (!res.ok) return null;
    const data: TokenResponse = await res.json() as TokenResponse;
    const newTokens: AuthTokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
    useAuthStore.getState().setTokens(newTokens);
    return newTokens;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | undefined> },
): Promise<T> {
  const { tokens } = useAuthStore.getState();

  let url = apiUrl(path);
  if (options?.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) searchParams.set(key, value);
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && tokens?.refreshToken) {
    refreshPromise ??= refreshTokens();
    const newTokens = await refreshPromise;
    refreshPromise = null;

    if (newTokens) {
      headers.Authorization = `Bearer ${newTokens.accessToken}`;
      const retryRes = await fetch(url, { ...options, headers });
      if (!retryRes.ok) {
        const errBody: ErrorBody = await retryRes.json().catch(() => ({ message: retryRes.statusText })) as ErrorBody;
        throw new ApiFetchError(retryRes.status, errBody.message ?? 'Request failed');
      }
      return retryRes.json() as Promise<T>;
    }
  }

  if (!res.ok) {
    const errBody: ErrorBody = await res.json().catch(() => ({ message: res.statusText })) as ErrorBody;
    throw new ApiFetchError(res.status, errBody.message ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

export class ApiFetchError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiFetchError';
  }
}
