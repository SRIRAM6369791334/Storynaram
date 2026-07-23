import { Module, Global, type DynamicModule } from '@nestjs/common';
import type { AIRuntimeService } from '@storynaram/runtime';
import { NarrativeExecutionEngine, type EngineOptions } from './narrative-execution-engine.js';
import { ExecutionScheduler } from './execution-scheduler.js';

export interface NarrativeExecutionModuleOptions {
  engine?: Partial<EngineOptions>;
  isGlobal?: boolean;
}

@Global()
@Module({})
export class NarrativeExecutionModule {
  static forRoot(options?: NarrativeExecutionModuleOptions): DynamicModule {
    return {
      module: NarrativeExecutionModule,
      global: options?.isGlobal ?? true,
      providers: [
        {
          provide: NarrativeExecutionEngine,
          useFactory: (aiRuntime: AIRuntimeService) => {
            return new NarrativeExecutionEngine(aiRuntime, options?.engine);
          },
          inject: ['AIRuntimeService'],
        },
        ExecutionScheduler,
      ],
      exports: [NarrativeExecutionEngine, ExecutionScheduler],
    };
  }

  static forFeature(options?: NarrativeExecutionModuleOptions): DynamicModule {
    return {
      module: NarrativeExecutionModule,
      providers: [
        {
          provide: NarrativeExecutionEngine,
          useFactory: (aiRuntime: AIRuntimeService) => {
            return new NarrativeExecutionEngine(aiRuntime, options?.engine);
          },
          inject: ['AIRuntimeService'],
        },
        ExecutionScheduler,
      ],
      exports: [NarrativeExecutionEngine, ExecutionScheduler],
    };
  }
}
