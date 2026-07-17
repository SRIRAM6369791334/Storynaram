import { Injectable } from '@nestjs/common';
import { vi } from 'vitest';

@Injectable()
export class MockEventBus {
  emit = vi.fn();
  on = vi.fn();
  off = vi.fn();
  once = vi.fn();
}
