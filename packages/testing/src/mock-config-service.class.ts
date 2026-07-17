import { Injectable } from '@nestjs/common';

@Injectable()
export class MockConfigService {
  private config = new Map<string, unknown>();

  get<T>(key: string): T | undefined {
    return this.config.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  has(key: string): boolean {
    return this.config.has(key);
  }

  all(): Record<string, unknown> {
    return Object.fromEntries(this.config);
  }
}
