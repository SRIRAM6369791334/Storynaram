import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { NarrativePlanner } from './narrative-planner';
import { PlanningMemory } from './planning-memory';
import { PlanningStatistics } from './planning-statistics';
import { PlanningGraph } from './planning-graph';
import { IdeaAgent } from './agents/idea-agent';
import { CharacterAgent } from './agents/character-agent';
import { WorldAgent } from './agents/world-agent';
import { TimelineAgent } from './agents/timeline-agent';
import { CanonAgent } from './agents/canon-agent';
import { NarrativeAgent } from './agents/narrative-agent';
import { CompositionAgent } from './agents/composition-agent';
import { ValidationAgent } from './agents/validation-agent';

export interface NarrativePlannerModuleOptions {
  maxRetries?: number;
  enableCheckpoints?: boolean;
  pipelineMode?: 'sequential' | 'parallel';
}

@Global()
@Module({})
export class NarrativePlannerModule {
  static forRoot(options?: NarrativePlannerModuleOptions): DynamicModule {
    const planner = new NarrativePlanner(options);

    const providers: Provider[] = [
      { provide: NarrativePlanner, useValue: planner },
      { provide: PlanningMemory, useValue: planner.getMemory() },
      { provide: PlanningStatistics, useValue: planner.getStatistics() as unknown as PlanningStatistics },
      { provide: PlanningGraph, useValue: planner.getGraph() },
      { provide: IdeaAgent, useValue: new IdeaAgent() },
      { provide: CharacterAgent, useValue: new CharacterAgent() },
      { provide: WorldAgent, useValue: new WorldAgent() },
      { provide: TimelineAgent, useValue: new TimelineAgent() },
      { provide: CanonAgent, useValue: new CanonAgent() },
      { provide: NarrativeAgent, useValue: new NarrativeAgent() },
      { provide: CompositionAgent, useValue: new CompositionAgent() },
      { provide: ValidationAgent, useValue: new ValidationAgent() },
    ];

    return {
      module: NarrativePlannerModule,
      providers,
      exports: providers.map(p => {
        const provider = p as { provide: unknown } | undefined;
        return provider?.provide ?? p;
      }) as any,
    };
  }

  static forFeature(): DynamicModule {
    return { module: NarrativePlannerModule };
  }
}
