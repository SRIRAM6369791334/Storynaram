import { DynamicModule } from '@nestjs/common';
import { RegistryConfig } from './registry-config.js';

export class RegistryModule {
  static forRoot(config?: RegistryConfig): DynamicModule {
    return {
      module: RegistryModule,
      global: true,
      providers: [
        { provide: RegistryConfig, useValue: config ?? new RegistryConfig() },
      ],
      exports: [RegistryConfig],
    };
  }
}
