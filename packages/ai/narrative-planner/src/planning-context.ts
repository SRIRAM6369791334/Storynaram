export interface StoryIdea {
  title: string;
  genre: string[];
  logline: string;
  premise: string;
  themes: string[];
  tone: string;
  targetAudience: string;
  wordCountGoal: number;
}

export interface CharacterPlan {
  characterId: string;
  name: string;
  role: string;
  arc: string;
  traits: string[];
  goals: string[];
  conflicts: string[];
  relationships: Array<{ targetId: string; type: string; description: string }>;
  validated: boolean;
}

export interface WorldPlan {
  worldId: string;
  name: string;
  regions: string[];
  factions: string[];
  magicSystem: string;
  technologyLevel: string;
  cultures: string[];
  history: string[];
  validated: boolean;
}

export interface TimelinePlan {
  timelineId: string;
  name: string;
  events: Array<{ date: string; title: string; description: string; type: string }>;
  branches: string[];
  validated: boolean;
}

export interface CanonEntry {
  factId: string;
  category: string;
  statement: string;
  source: string;
  conflicts: string[];
}

export interface NarrativePlan {
  narrativeId: string;
  title: string;
  synopsis: string;
  chapters: Array<{ number: number; title: string; summary: string; scenes: string[] }>;
  wordCount: number;
  status: string;
  validated: boolean;
}

export interface CompositionPlan {
  storyId: string;
  plotStructure: string;
  arcs: Array<{ name: string; description: string; beats: string[] }>;
  themes: string[];
  conflicts: Array<{ type: string; description: string; parties: string[] }>;
  foreshadowing: Array<{ hint: string; payoff: string }>;
  objectives: Array<{ characterId: string; goal: string }>;
  validated: boolean;
}

export interface PromptPackage {
  storyPlan: string;
  characterProfiles: string;
  worldBible: string;
  timelineReference: string;
  compositionGuide: string;
  styleGuide: string;
  assembledPrompt: string;
}

export class PlanningContext {
  public readonly idea: StoryIdea;
  public characterPlan: CharacterPlan | null = null;
  public worldPlan: WorldPlan | null = null;
  public timelinePlan: TimelinePlan | null = null;
  public canon: CanonEntry[] = [];
  public narrativePlan: NarrativePlan | null = null;
  public compositionPlan: CompositionPlan | null = null;
  public promptPackage: PromptPackage | null = null;
  public validationErrors: string[] = [];
  public metadata: Record<string, unknown> = {};

  constructor(idea: StoryIdea) {
    this.idea = idea;
  }

  isComplete(): boolean {
    return (
      this.characterPlan !== null &&
      this.worldPlan !== null &&
      this.timelinePlan !== null &&
      this.narrativePlan !== null &&
      this.compositionPlan !== null &&
      this.validationErrors.length === 0
    );
  }

  getCompletedStages(): string[] {
    const stages: string[] = [];
    if (this.characterPlan) stages.push('character');
    if (this.worldPlan) stages.push('world');
    if (this.timelinePlan) stages.push('timeline');
    if (this.narrativePlan) stages.push('narrative');
    if (this.compositionPlan) stages.push('composition');
    if (this.validationErrors.length === 0 && stages.length >= 5) stages.push('validation');
    return stages;
  }
}
