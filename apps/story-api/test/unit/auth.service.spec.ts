import { describe, it, expect, beforeAll } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/modules/auth/auth.service';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { RegisterDto } from '../../src/modules/auth/dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(() => {
    const jwtService = new JwtService({ secret: 'test-secret-that-is-long-enough-for-testing' });
    authService = new AuthService(jwtService);
  });

  it('should register a user', async () => {
    const result = await authService.register({ email: 'test@test.com', password: 'password123' } as RegisterDto);
    expect(result.id).toBeDefined();
    expect(result.email).toBe('test@test.com');
  });

  it('should login with valid credentials', async () => {
    await authService.register({ email: 'login@test.com', password: 'password123' } as RegisterDto);
    const result = await authService.login({ email: 'login@test.com', password: 'password123' } as LoginDto);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe('login@test.com');
  });

  it('should reject login with invalid credentials', async () => {
    await expect(
      authService.login({ email: 'nonexistent@test.com', password: 'wrong' } as LoginDto),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should reject duplicate registration', async () => {
    await authService.register({ email: 'duplicate@test.com', password: 'password123' } as RegisterDto);
    await expect(
      authService.register({ email: 'duplicate@test.com', password: 'password123' } as RegisterDto),
    ).rejects.toThrow('Email already registered');
  });

  it('should refresh token', async () => {
    await authService.register({ email: 'refresh@test.com', password: 'password123' } as RegisterDto);
    const login = await authService.login({ email: 'refresh@test.com', password: 'password123' } as LoginDto);
    const result = await authService.refresh(login.refreshToken);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should reject invalid refresh token', async () => {
    await expect(authService.refresh('invalid-token')).rejects.toThrow('Invalid refresh token');
  });
});
