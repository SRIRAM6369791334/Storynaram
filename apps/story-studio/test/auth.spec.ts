import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../src/stores/auth-store';

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, tokens: null, isAuthenticated: false });
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('sets auth on login', () => {
    useAuthStore.getState().setAuth(
      { id: '1', email: 'test@test.com', roles: ['author'] },
      { accessToken: 'abc', refreshToken: 'def' },
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@test.com');
    expect(state.tokens?.accessToken).toBe('abc');
  });

  it('clears auth on logout', () => {
    useAuthStore.getState().setAuth(
      { id: '1', email: 'test@test.com', roles: ['author'] },
      { accessToken: 'abc', refreshToken: 'def' },
    );
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
