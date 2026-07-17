import { DynamicModule, Module } from '@nestjs/common';

export interface WorkflowModuleOptions {
  engine?: string;
}

@Module({})
export class WorkflowModule {
  static forRoot(options?: WorkflowModuleOptions): DynamicModule {
    return {
      module: WorkflowModule,
      providers: [
        { provide: 'WORKFLOW_MODULE_OPTIONS', useValue: options ?? {} },
      ],
      exports: [],
    };
  }
}
