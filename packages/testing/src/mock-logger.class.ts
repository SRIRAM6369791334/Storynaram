import { Injectable } from '@nestjs/common';
import { vi } from 'vitest';

@Injectable()
export class MockLogger {
  log = vi.fn();
  warn = vi.fn();
  error = vi.fn();
  debug = vi.fn();
  verbose = vi.fn();
}
