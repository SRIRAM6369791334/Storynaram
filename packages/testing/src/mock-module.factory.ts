import { Test, TestingModule } from '@nestjs/testing';
import type { Provider, Type, DynamicModule, ForwardReference } from '@nestjs/common';
import { MockLogger } from './mock-logger.class';
import { MockConfigService } from './mock-config-service.class';
import { MockEventBus } from './mock-event-bus.class';
import type { TestModuleOptions } from './test-module-options.type';

export async function createMockModule(
  options: TestModuleOptions = {},
): Promise<TestingModule> {
  const providers: Provider[] = [];

  if (options.enableLogger !== false) {
    providers.push({
      provide: MockLogger,
      useClass: MockLogger,
    });
  }

  if (options.enableConfig !== false) {
    providers.push({
      provide: MockConfigService,
      useClass: MockConfigService,
    });
  }

  if (options.enableEventBus !== false) {
    providers.push({
      provide: MockEventBus,
      useClass: MockEventBus,
    });
  }

  if (options.providers) {
    providers.push(...(options.providers as Provider[]));
  }

  const module = await Test.createTestingModule({
    imports: (options.imports ?? []) as (Type | DynamicModule | Promise<DynamicModule> | ForwardReference)[],
    providers,
  }).compile();

  return module;
}
