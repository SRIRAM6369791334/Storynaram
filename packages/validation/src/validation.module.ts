import { DynamicModule } from '@nestjs/common';

export class ValidationModule {
  static forRoot(): DynamicModule {
    return {
      module: ValidationModule,
      global: true,
      providers: [],
      exports: [],
    };
  }
}
