import { DynamicModule } from '@nestjs/common';
import { StorageConfig } from './storage-config.js';

export class StorageModule {
  static forRoot(config?: StorageConfig): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        { provide: StorageConfig, useValue: config ?? new StorageConfig() },
      ],
      exports: [StorageConfig],
    };
  }
}
