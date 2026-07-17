import { DynamicModule, Module } from '@nestjs/common';

export interface AiModuleOptions {
  defaultModel?: string;
  apiKey?: string;
}

@Module({})
export class AiModule {
  static forRoot(options?: AiModuleOptions): DynamicModule {
    return {
      module: AiModule,
      providers: [
        { provide: 'AI_MODULE_OPTIONS', useValue: options ?? {} },
      ],
      exports: [],
    };
  }
}
