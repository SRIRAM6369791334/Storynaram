import { Factory, FactoryError } from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate';
import { StoryIdentity } from './story-identity';
import { StoryFormat } from './story-profile';
import { PlotStructure, PlotType, PlotStage } from './plot';
import { ArcStage } from './story-arc';
import { ConflictCategory, ConflictSeverity } from './conflict';
import { ThemeCategory } from './theme';
import { ForeshadowStrength } from './foreshadow';

export interface CreatePlotPointInput {
  pointId?: string;
  stage: PlotStage;
  chapterId: string;
  sceneId: string;
  title?: string;
  summary?: string;
  order?: number;
}

export interface CreateArcInput {
  arcId?: string;
  name: string;
  stage?: ArcStage;
  description?: string;
}

export interface CreateCharacterArcInput {
  characterArcId?: string;
  characterId: string;
}

export interface CreateConflictInput {
  conflictId?: string;
  category: ConflictCategory;
  description?: string;
  severity?: ConflictSeverity;
  parties?: string[];
}

export interface CreateThemeInput {
  themeId?: string;
  category: ThemeCategory;
  statement: string;
}

export interface CreateForeshadowInput {
  foreshadowId?: string;
  clue: string;
  strength?: ForeshadowStrength;
  plantedChapter?: string;
  plantedScene?: string;
}

export interface CreatePayoffInput {
  payoffId?: string;
  foreshadowId: string;
  description: string;
  chapterId?: string;
  sceneId?: string;
}

export interface CreateStoryProps {
  identity?: string;
  title: string;
  format?: StoryFormat;
  structure?: PlotStructure;
  plotType?: PlotType;
  initialPlotPoints?: CreatePlotPointInput[];
  initialArcs?: CreateArcInput[];
  initialCharacterArcs?: CreateCharacterArcInput[];
  initialConflicts?: CreateConflictInput[];
  initialThemes?: CreateThemeInput[];
  initialForeshadows?: CreateForeshadowInput[];
  initialPayoffs?: CreatePayoffInput[];
}

export class StoryFactory extends Factory<StoryAggregate, CreateStoryProps> {
  create(props: CreateStoryProps): StoryAggregate {
    this.assertValid(props.title.length > 0, 'Story title is required');

    const identity = props.identity
      ? new StoryIdentity(props.identity)
      : StoryIdentity.create();

    const story = new StoryAggregate(identity);
    story.initialize(props.title, props.format);

    if (props.structure || props.plotType) {
      story.setPlot(props.structure ?? 'threeAct', props.plotType);
    }

    if (props.initialPlotPoints) {
      for (const pp of props.initialPlotPoints) {
        story.addPlotPoint(
          pp.pointId ?? `pp-${crypto.randomUUID()}`,
          pp.stage, pp.chapterId, pp.sceneId, pp.title, pp.summary, pp.order,
        );
      }
    }

    if (props.initialArcs) {
      for (const a of props.initialArcs) {
        story.addArc(a.arcId ?? `arc-${crypto.randomUUID()}`, a.name, a.stage, a.description);
      }
    }

    if (props.initialCharacterArcs) {
      for (const ca of props.initialCharacterArcs) {
        story.addCharacterArc(ca.characterArcId ?? `charArc-${crypto.randomUUID()}`, ca.characterId);
      }
    }

    if (props.initialConflicts) {
      for (const c of props.initialConflicts) {
        story.addConflict(
          c.conflictId ?? `conf-${crypto.randomUUID()}`,
          c.category, c.description, c.severity, c.parties ?? [],
        );
      }
    }

    if (props.initialThemes) {
      for (const t of props.initialThemes) {
        story.addTheme(t.themeId ?? `thm-${crypto.randomUUID()}`, t.category, t.statement);
      }
    }

    if (props.initialForeshadows) {
      for (const f of props.initialForeshadows) {
        story.addForeshadow(
          f.foreshadowId ?? `fs-${crypto.randomUUID()}`,
          f.clue, f.strength, f.plantedChapter, f.plantedScene,
        );
      }
    }

    if (props.initialPayoffs) {
      for (const p of props.initialPayoffs) {
        story.addPayoff(
          p.payoffId ?? `po-${crypto.randomUUID()}`,
          p.foreshadowId, p.description, p.chapterId, p.sceneId,
        );
      }
    }

    return story;
  }

  reconstitute(state: Record<string, unknown>): StoryAggregate {
    const identity = new StoryIdentity(state.identity as string);
    const story = new StoryAggregate(identity);
    story.initialize(
      (state.profile as Record<string, unknown>)?.title as string ?? 'Untitled',
    );
    return story;
  }
}
