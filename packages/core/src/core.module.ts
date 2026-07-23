import { DynamicModule } from '@nestjs/common';
import { CoreConfig } from './core-config.js';

export class CoreModule {
  static forRoot(config?: CoreConfig): DynamicModule {
    return {
      module: CoreModule,
      global: true,
      providers: [
        { provide: CoreConfig, useValue: config ?? new CoreConfig() },
      ],
      exports: [CoreConfig],
    };
  }
}
