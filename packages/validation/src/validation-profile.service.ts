import { Injectable } from '@nestjs/common';
import type { ValidationProfileConfig } from './types';
import { ValidationProfileError } from './errors';

const DEFAULT_PROFILES: Record<string, ValidationProfileConfig> = {
  default: {
    mode: 'production',
    stopOnFirstError: false,
    includeWarnings: true,
    includeInfo: false,
    verbose: false,
  },
  strict: {
    mode: 'strict',
    stopOnFirstError: true,
    includeWarnings: false,
    includeInfo: false,
    verbose: false,
  },
  development: {
    mode: 'development',
    stopOnFirstError: false,
    includeWarnings: true,
    includeInfo: true,
    verbose: true,
    maxErrors: 50,
  },
  production: {
    mode: 'production',
    stopOnFirstError: false,
    includeWarnings: false,
    includeInfo: false,
    verbose: false,
  },
  fast: {
    mode: 'fast',
    stopOnFirstError: true,
    includeWarnings: false,
    includeInfo: false,
    verbose: false,
    maxErrors: 1,
  },
  deep: {
    mode: 'deep',
    stopOnFirstError: false,
    includeWarnings: true,
    includeInfo: true,
    verbose: true,
    maxErrors: 200,
  },
};

@Injectable()
export class ValidationProfileService {
  private readonly profiles = new Map<string, ValidationProfileConfig>(
    Object.entries(DEFAULT_PROFILES),
  );

  getProfile(name: string): ValidationProfileConfig {
    const profile = this.profiles.get(name);
    if (!profile) {
      throw new ValidationProfileError(name, 'Profile not found');
    }
    return profile;
  }

  registerProfile(name: string, config: ValidationProfileConfig): void {
    this.profiles.set(name, config);
  }

  hasProfile(name: string): boolean {
    return this.profiles.has(name);
  }

  listProfiles(): string[] {
    return Array.from(this.profiles.keys());
  }

  removeProfile(name: string): boolean {
    if (name in DEFAULT_PROFILES) {
      throw new ValidationProfileError(name, 'Cannot remove built-in profile');
    }
    return this.profiles.delete(name);
  }
}
