import { AggregateRoot, DomainSnapshot } from '@storynaram/domain-kernel';
import { StoryIdentity } from './story-identity.js';
import { StoryProfile, StoryFormat, StoryStatus } from './story-profile.js';
import { StoryMetadata } from './story-metadata.js';
import { StoryStatistics } from './story-statistics.js';
import { StoryState, StoryPhase } from './story-state.js';
import { Plot, PlotStructure, PlotType, PlotPoint, PlotPointCollection, PlotStage } from './plot.js';
import { StoryArc, ArcCollection, ArcStage, ArcGoal, ArcResolution, ArcTransition } from './story-arc.js';
import { CharacterArc, CharacterArcCollection, CharacterGoal, CharacterGrowth, CharacterTransformation, CharacterResolution } from './character-arc.js';
import { Conflict, ConflictCollection, ConflictCategory, ConflictSeverity, ConflictState, ConflictResolution } from './conflict.js';
import { Theme, ThemeCollection, ThemeCategory, ThemeProgress, ThemeEvidence, ThemeResolution } from './theme.js';
import { Foreshadow, ForeshadowCollection, ForeshadowStrength, ForeshadowReference, ForeshadowPayoff } from './foreshadow.js';
import { Payoff, PayoffCollection, Resolution, Reward, Consequence } from './payoff.js';
import { ObjectiveCollection, StoryObjective, SceneObjective, CharacterObjective, WorldObjective, ObjectiveStatus, ObjectivePriority } from './objectives.js';
import {
  StoryCreatedEvent, PlotCreatedEvent, PlotPointAddedEvent,
  ArcCreatedEvent, CharacterArcCreatedEvent,
  ConflictAddedEvent, ConflictResolvedEvent,
  ThemeAddedEvent, ForeshadowAddedEvent, PayoffResolvedEvent,
  StoryCompletedEvent, StoryPublishedEvent,
} from './story-events.js';

export class StoryAggregate extends AggregateRoot<StoryIdentity> {
  private _profile: StoryProfile;
  private _metadata: StoryMetadata;
  private _statistics: StoryStatistics;
  private _state: StoryState;
  private _plot: Plot;
  private _arcs: ArcCollection;
  private _characterArcs: CharacterArcCollection;
  private _conflicts: ConflictCollection;
  private _themes: ThemeCollection;
  private _foreshadows: ForeshadowCollection;
  private _payoffs: PayoffCollection;
  private _objectives: ObjectiveCollection;

  constructor(identity: StoryIdentity) {
    super(identity);
    this._profile = new StoryProfile('Untitled Story');
    this._metadata = new StoryMetadata();
    this._statistics = new StoryStatistics();
    this._state = new StoryState();
    this._plot = new Plot();
    this._arcs = new ArcCollection();
    this._characterArcs = new CharacterArcCollection();
    this._conflicts = new ConflictCollection();
    this._themes = new ThemeCollection();
    this._foreshadows = new ForeshadowCollection();
    this._payoffs = new PayoffCollection();
    this._objectives = new ObjectiveCollection();
  }

  get profile(): StoryProfile { return this._profile; }
  get metadata(): StoryMetadata { return this._metadata; }
  get statistics(): StoryStatistics { return this._statistics; }
  get state(): StoryState { return this._state; }
  get plot(): Plot { return this._plot; }
  get arcs(): ArcCollection { return this._arcs; }
  get characterArcs(): CharacterArcCollection { return this._characterArcs; }
  get conflicts(): ConflictCollection { return this._conflicts; }
  get themes(): ThemeCollection { return this._themes; }
  get foreshadows(): ForeshadowCollection { return this._foreshadows; }
  get payoffs(): PayoffCollection { return this._payoffs; }
  get objectives(): ObjectiveCollection { return this._objectives; }

  initialize(title: string, format: StoryFormat = 'novel'): void {
    this._profile = new StoryProfile(title, format);
    this._state = new StoryState('concept');
    this.addDomainEvent(new StoryCreatedEvent(this.identity.value, { title, format }));
    this.markUpdated();
  }

  updateProfile(profile: StoryProfile): void {
    this._profile = profile;
    this.markUpdated();
  }

  setPhase(phase: StoryPhase): void {
    this._state = this._state.withPhase(phase);
    this.markUpdated();
  }

  setPlot(structure: PlotStructure, plotType: PlotType = 'linear', description: string = ''): void {
    const plotId = `plot-${crypto.randomUUID()}`;
    this._plot = new Plot(structure, plotType, new PlotPointCollection(), description, plotId);
    this.addDomainEvent(new PlotCreatedEvent(this.identity.value, { plotId, structure, plotType }));
    this.markUpdated();
  }

  addPlotPoint(
    pointId: string, stage: PlotStage, chapterId: string, sceneId: string,
    title: string = '', summary: string = '', order: number = 0,
  ): void {
    const point = new PlotPoint(pointId, stage, chapterId, sceneId, title, summary, [], [], [], order);
    this._plot = new Plot(
      this._plot.structure, this._plot.plotType,
      this._plot.points.add(point), this._plot.description, this._plot.plotId,
    );
    this.addDomainEvent(new PlotPointAddedEvent(this.identity.value, { pointId, stage, order, title }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addArc(arcId: string, name: string, stage: ArcStage = 'introduction', description: string = ''): void {
    const arc = new StoryArc(arcId, name, stage, new ArcGoal('Complete arc'), new ArcResolution(), [], [], [], description);
    this._arcs = this._arcs.add(arc);
    this.addDomainEvent(new ArcCreatedEvent(this.identity.value, { arcId, name, stage }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addCharacterArc(characterArcId: string, characterId: string): void {
    const arc = new CharacterArc(characterArcId, characterId);
    this._characterArcs = this._characterArcs.add(arc);
    this.addDomainEvent(new CharacterArcCreatedEvent(this.identity.value, { characterArcId, characterId }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addConflict(
    conflictId: string, category: ConflictCategory, description: string = '',
    severity: ConflictSeverity = 'moderate', parties: readonly string[] = [],
  ): void {
    const conflict = new Conflict(conflictId, category, severity, 'active', parties, description);
    this._conflicts = this._conflicts.add(conflict);
    this.addDomainEvent(new ConflictAddedEvent(this.identity.value, { conflictId, category, severity, description }));
    this.markUpdated();
    this.refreshStatistics();
  }

  resolveConflict(conflictId: string, resolution: string, victor: string = '', outcome: string = ''): void {
    const existing = this._conflicts.get(conflictId);
    if (!existing) throw new Error(`Conflict not found: ${conflictId}`);
    const resolved = new Conflict(
      existing.conflictId, existing.category, existing.severity, 'resolved',
      existing.parties, existing.description, existing.rootCause, existing.stakes,
      new ConflictResolution(true, resolution, victor, '', outcome),
      existing.relatedPlotPointIds, existing.relatedArcIds,
    );
    this._conflicts = this._conflicts.remove(conflictId).add(resolved);
    this.addDomainEvent(new ConflictResolvedEvent(this.identity.value, { conflictId, resolution }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addTheme(themeId: string, category: ThemeCategory, statement: string): void {
    const theme = new Theme(themeId, category, statement);
    this._themes = this._themes.add(theme);
    this.addDomainEvent(new ThemeAddedEvent(this.identity.value, { themeId, category, statement }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addForeshadow(
    foreshadowId: string, clue: string, strength: ForeshadowStrength = 'moderate',
    plantedChapter: string = '', plantedScene: string = '',
  ): void {
    const foreshadow = new Foreshadow(foreshadowId, clue, strength, '', plantedChapter, plantedScene);
    this._foreshadows = this._foreshadows.add(foreshadow);
    this.addDomainEvent(new ForeshadowAddedEvent(this.identity.value, { foreshadowId, clue, strength }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addPayoff(
    payoffId: string, foreshadowId: string, description: string,
    chapterId: string = '', sceneId: string = '',
  ): void {
    if (!this._foreshadows.has(foreshadowId)) throw new Error(`Foreshadow not found: ${foreshadowId}`);
    const payoff = new Payoff(payoffId, foreshadowId, description, new Resolution(true, description, chapterId, sceneId));
    this._payoffs = this._payoffs.add(payoff);
    const foreshadow = this._foreshadows.get(foreshadowId)!;
    const updatedForeshadow = new Foreshadow(
      foreshadow.foreshadowId, foreshadow.clue, foreshadow.strength,
      foreshadow.plantedIn, foreshadow.plantedChapter, foreshadow.plantedScene,
      foreshadow.hints, foreshadow.references,
      new ForeshadowPayoff(true, payoffId, chapterId, sceneId),
      foreshadow.notes,
    );
    this._foreshadows = this._foreshadows.remove(foreshadowId).add(updatedForeshadow);
    this.addDomainEvent(new PayoffResolvedEvent(this.identity.value, { payoffId, foreshadowId }));
    this.markUpdated();
    this.refreshStatistics();
  }

  addStoryObjective(objectiveId: string, description: string, priority: ObjectivePriority = 'medium'): void {
    const obj = new StoryObjective(objectiveId, description, 'pending', priority);
    this._objectives = this._objectives.addStoryObjective(obj);
    this.markUpdated();
    this.refreshStatistics();
  }

  addSceneObjective(objectiveId: string, sceneId: string, description: string): void {
    const obj = new SceneObjective(objectiveId, sceneId, description);
    this._objectives = this._objectives.addSceneObjective(obj);
    this.markUpdated();
    this.refreshStatistics();
  }

  addCharacterObjective(objectiveId: string, characterId: string, description: string, motivation: string = ''): void {
    const obj = new CharacterObjective(objectiveId, characterId, description, 'pending', 'medium', motivation);
    this._objectives = this._objectives.addCharacterObjective(obj);
    this.markUpdated();
    this.refreshStatistics();
  }

  addWorldObjective(objectiveId: string, worldId: string, description: string, scope: string = 'local'): void {
    const obj = new WorldObjective(objectiveId, worldId, description, 'pending', scope);
    this._objectives = this._objectives.addWorldObjective(obj);
    this.markUpdated();
    this.refreshStatistics();
  }

  complete(): void {
    this._state = this._state.markComplete();
    this.version = this.version.next();
    this.addDomainEvent(new StoryCompletedEvent(this.identity.value, { title: this._profile.title }));
    this.markUpdated();
  }

  publish(): void {
    this._state = this._state.markPublished();
    this.version = this.version.next();
    this.addDomainEvent(new StoryPublishedEvent(this.identity.value, { title: this._profile.title }));
    this.markUpdated();
  }

  archive(): void {
    this._state = this._state.markArchived();
    this.markUpdated();
  }

  private refreshStatistics(): void {
    const resolvedConflicts = this._conflicts.resolved().length;
    const completedArcs = this._arcs.completed().length;
    const paidOffForeshadows = this._foreshadows.paid().length;
    const achievedObjectives = this._objectives.achieved();

    this._statistics = new StoryStatistics({
      totalPlotPoints: this._plot.points.count,
      totalArcs: this._arcs.count,
      totalCharacterArcs: this._characterArcs.count,
      totalConflicts: this._conflicts.count,
      totalThemes: this._themes.count,
      totalForeshadows: this._foreshadows.count,
      totalPayoffs: this._payoffs.count,
      totalObjectives: this._objectives.totalCount,
      resolvedConflicts,
      completedArcs,
      paidOffForeshadows,
      completedObjectives: achievedObjectives,
    });
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      profile: this._profile.toJSON(),
      metadata: this._metadata.toJSON(),
      statistics: this._statistics.toJSON(),
      state: this._state.toJSON(),
      plot: this._plot.toJSON(),
      arcs: this._arcs.toJSON(),
      characterArcs: this._characterArcs.toJSON(),
      conflicts: this._conflicts.toJSON(),
      themes: this._themes.toJSON(),
      foreshadows: this._foreshadows.toJSON(),
      payoffs: this._payoffs.toJSON(),
      objectives: this._objectives.toJSON(),
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    const data = snapshot.data;
    this._profile = data.profile as StoryProfile;
    this._metadata = data.metadata as StoryMetadata;
    this._statistics = data.statistics as StoryStatistics;
    this._state = data.state as StoryState;
    this._plot = data.plot as Plot;
    this._arcs = data.arcs as ArcCollection;
    this._characterArcs = data.characterArcs as CharacterArcCollection;
    this._conflicts = data.conflicts as ConflictCollection;
    this._themes = data.themes as ThemeCollection;
    this._foreshadows = data.foreshadows as ForeshadowCollection;
    this._payoffs = data.payoffs as PayoffCollection;
    this._objectives = data.objectives as ObjectiveCollection;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      profile: this._profile.toJSON(),
      metadata: this._metadata.toJSON(),
      statistics: this._statistics.toJSON(),
      state: this._state.toJSON(),
      plot: this._plot.toJSON(),
      arcs: this._arcs.toJSON(),
      characterArcs: this._characterArcs.toJSON(),
      conflicts: this._conflicts.toJSON(),
      themes: this._themes.toJSON(),
      foreshadows: this._foreshadows.toJSON(),
      payoffs: this._payoffs.toJSON(),
      objectives: this._objectives.toJSON(),
    };
  }
}
