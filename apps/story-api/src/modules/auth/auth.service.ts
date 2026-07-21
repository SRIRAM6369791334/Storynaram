import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { loadAppConfig } from '../../config/app.config';
import type { JwtPayload } from './strategies/jwt.strategy';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, StoredUser>();
  private readonly refreshTokens = new Map<string, string>();

  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    const existing = Array.from(this.users.values()).find(u => u.email === dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const id = randomUUID();
    const user: StoredUser = {
      id,
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: ['author'],
    };

    this.users.set(id, user);

    return { id, email: user.email };
  }

  async login(dto: LoginDto): Promise<TokenPair & { user: { id: string; email: string; roles: string[] } }> {
    const user = Array.from(this.users.values()).find(u => u.email === dto.email);

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return { ...tokens, user: { id: user.id, email: user.email, roles: user.roles } };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const userId = this.refreshTokens.get(refreshToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = this.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.refreshTokens.delete(refreshToken);
    return this.generateTokens(user);
  }

  async validateUser(payload: JwtPayload): Promise<StoredUser | null> {
    const user = this.users.get(payload.sub);
    return user ?? null;
  }

  private async generateTokens(user: StoredUser): Promise<TokenPair> {
    const config = loadAppConfig();
    const payload: JwtPayload = { sub: user.id, email: user.email, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      secret: config.jwtSecret,
      expiresIn: config.jwtExpiresIn as unknown as number,
    });

    const refreshToken = randomUUID();
    this.refreshTokens.set(refreshToken, user.id);

    return { accessToken, refreshToken };
  }

  constructor(private readonly jwtService: JwtService) {}
}
