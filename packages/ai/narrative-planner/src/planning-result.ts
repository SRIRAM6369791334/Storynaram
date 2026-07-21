import { CharacterPlan, WorldPlan, TimelinePlan, NarrativePlan, CompositionPlan, PromptPackage } from './planning-context';

export interface StructuredStoryPlan {
  title: string;
  genre: string[];
  logline: string;
  premise: string;
  themes: string[];
  characterCount: number;
  worldCount: number;
  timelineEvents: number;
  narrativeChapters: number;
  compositionArcs: number;
}

export class PlanningResult {
  public readonly sessionId: string;
  public readonly storyPlan: StructuredStoryPlan;
  public readonly characterPlan: CharacterPlan;
  public readonly worldPlan: WorldPlan;
  public readonly timelinePlan: TimelinePlan;
  public readonly narrativePlan: NarrativePlan;
  public readonly compositionPlan: CompositionPlan;
  public readonly promptPackage: PromptPackage;
  public readonly completedAt: Date;
  public readonly durationMs: number;
  public readonly stageCount: number;

  constructor(params: {
    sessionId: string;
    storyPlan: StructuredStoryPlan;
    characterPlan: CharacterPlan;
    worldPlan: WorldPlan;
    timelinePlan: TimelinePlan;
    narrativePlan: NarrativePlan;
    compositionPlan: CompositionPlan;
    promptPackage: PromptPackage;
    durationMs: number;
    stageCount: number;
  }) {
    this.sessionId = params.sessionId;
    this.storyPlan = params.storyPlan;
    this.characterPlan = params.characterPlan;
    this.worldPlan = params.worldPlan;
    this.timelinePlan = params.timelinePlan;
    this.narrativePlan = params.narrativePlan;
    this.compositionPlan = params.compositionPlan;
    this.promptPackage = params.promptPackage;
    this.completedAt = new Date();
    this.durationMs = params.durationMs;
    this.stageCount = params.stageCount;
  }

  toJSON(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      storyPlan: this.storyPlan,
      characterPlan: this.characterPlan,
      worldPlan: this.worldPlan,
      timelinePlan: this.timelinePlan,
      narrativePlan: this.narrativePlan,
      compositionPlan: this.compositionPlan,
      promptPackage: this.promptPackage,
      completedAt: this.completedAt.toISOString(),
      durationMs: this.durationMs,
      stageCount: this.stageCount,
    };
  }
}
