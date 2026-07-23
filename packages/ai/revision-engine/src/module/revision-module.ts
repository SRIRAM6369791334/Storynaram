import { Module, Global, type DynamicModule } from '@nestjs/common';
import { RevisionEngine, type RevisionEngineOptions } from '../engine/revision-engine.js';
import { GrammarAgent } from '../agents/grammar-agent.js';
import { CharacterReviewAgent } from '../agents/character-review-agent.js';
import { WorldReviewAgent } from '../agents/world-review-agent.js';
import { TimelineReviewAgent } from '../agents/timeline-review-agent.js';
import { CanonReviewAgent } from '../agents/canon-review-agent.js';
import { NarrativeReviewAgent } from '../agents/narrative-review-agent.js';
import { PlotReviewAgent } from '../agents/plot-review-agent.js';
import { StyleReviewAgent } from '../agents/style-review-agent.js';
import { QualityReviewAgent } from '../agents/quality-review-agent.js';
import { StoryQualityScore } from '../quality/story-quality-score.js';
import { IssueDetector } from '../detection/issue-detector.js';
import { ImprovementApplier } from '../improvement/improvement-applier.js';

export interface RevisionModuleOptions {
  engine?: Partial<RevisionEngineOptions>;
  isGlobal?: boolean;
}

@Global()
@Module({})
export class RevisionModule {
  static forRoot(options?: RevisionModuleOptions): DynamicModule {
    return {
      module: RevisionModule,
      global: options?.isGlobal ?? true,
      providers: [
        {
          provide: RevisionEngine,
          useFactory: () => {
            return new RevisionEngine(options?.engine);
          },
        },
        GrammarAgent,
        CharacterReviewAgent,
        WorldReviewAgent,
        TimelineReviewAgent,
        CanonReviewAgent,
        NarrativeReviewAgent,
        PlotReviewAgent,
        StyleReviewAgent,
        QualityReviewAgent,
        StoryQualityScore,
        IssueDetector,
        ImprovementApplier,
      ],
      exports: [RevisionEngine],
    };
  }

  static forFeature(options?: RevisionModuleOptions): DynamicModule {
    return {
      module: RevisionModule,
      providers: [
        {
          provide: RevisionEngine,
          useFactory: () => {
            return new RevisionEngine(options?.engine);
          },
        },
        GrammarAgent,
        CharacterReviewAgent,
        WorldReviewAgent,
        TimelineReviewAgent,
        CanonReviewAgent,
        NarrativeReviewAgent,
        PlotReviewAgent,
        StyleReviewAgent,
        QualityReviewAgent,
        StoryQualityScore,
        IssueDetector,
        ImprovementApplier,
      ],
      exports: [RevisionEngine],
    };
  }
}
