import { Module, Global, type DynamicModule } from '@nestjs/common';
import { RevisionEngine, type RevisionEngineOptions } from '../engine/revision-engine';
import { GrammarAgent } from '../agents/grammar-agent';
import { CharacterReviewAgent } from '../agents/character-review-agent';
import { WorldReviewAgent } from '../agents/world-review-agent';
import { TimelineReviewAgent } from '../agents/timeline-review-agent';
import { CanonReviewAgent } from '../agents/canon-review-agent';
import { NarrativeReviewAgent } from '../agents/narrative-review-agent';
import { PlotReviewAgent } from '../agents/plot-review-agent';
import { StyleReviewAgent } from '../agents/style-review-agent';
import { QualityReviewAgent } from '../agents/quality-review-agent';
import { StoryQualityScore } from '../quality/story-quality-score';
import { IssueDetector } from '../detection/issue-detector';
import { ImprovementApplier } from '../improvement/improvement-applier';

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
