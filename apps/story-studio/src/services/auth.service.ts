import { apiFetch } from './api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { User, AuthTokens } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const result = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    useAuthStore.getState().setAuth(result.user, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return result;
  },

  async register(data: RegisterRequest): Promise<{ id: string; email: string }> {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const result = await apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    useAuthStore.getState().setTokens(result);
    return result;
  },

  logout(): void {
    useAuthStore.getState().logout();
  },
};
