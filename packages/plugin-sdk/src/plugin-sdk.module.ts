import { DynamicModule, Module } from '@nestjs/common';

export interface PluginSdkModuleOptions {
  pluginsDir?: string;
  autoLoad?: boolean;
}

@Module({})
export class PluginSdkModule {
  static forRoot(options?: PluginSdkModuleOptions): DynamicModule {
    return {
      module: PluginSdkModule,
      providers: [
        { provide: 'PLUGIN_SDK_OPTIONS', useValue: options ?? {} },
      ],
      exports: [],
    };
  }
}
