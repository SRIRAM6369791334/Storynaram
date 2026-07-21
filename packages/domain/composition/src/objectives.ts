import { ValueObject } from '@storynaram/domain-kernel';

export type ObjectiveStatus = 'pending' | 'inProgress' | 'achieved' | 'failed' | 'abandoned';

export type ObjectivePriority = 'low' | 'medium' | 'high' | 'critical';

export class StoryObjective extends ValueObject {
  constructor(
    public readonly objectiveId: string,
    public readonly description: string,
    public readonly status: ObjectiveStatus = 'pending',
    public readonly priority: ObjectivePriority = 'medium',
    public readonly relatedPlotPointIds: readonly string[] = [],
    public readonly relatedArcIds: readonly string[] = [],
    public readonly notes: string = '',
  ) {
    super();
    if (objectiveId.trim().length === 0) throw new Error('StoryObjective ID cannot be empty');
    if (description.trim().length === 0) throw new Error('StoryObjective description cannot be empty');
  }

  withStatus(status: ObjectiveStatus): StoryObjective {
    return new StoryObjective(
      this.objectiveId, this.description, status, this.priority,
      this.relatedPlotPointIds, this.relatedArcIds, this.notes,
    );
  }

  protected getEqualityComponents(): unknown[] {
    return [this.objectiveId, this.status, this.priority];
  }

  toJSON(): Record<string, unknown> {
    return { objectiveId: this.objectiveId, description: this.description, status: this.status, priority: this.priority, relatedPlotPointIds: [...this.relatedPlotPointIds], relatedArcIds: [...this.relatedArcIds], notes: this.notes };
  }
}

export class SceneObjective extends ValueObject {
  constructor(
    public readonly objectiveId: string,
    public readonly sceneId: string,
    public readonly description: string,
    public readonly status: ObjectiveStatus = 'pending',
    public readonly priority: ObjectivePriority = 'medium',
  ) {
    super();
    if (objectiveId.trim().length === 0) throw new Error('SceneObjective ID cannot be empty');
    if (sceneId.trim().length === 0) throw new Error('SceneObjective scene ID cannot be empty');
    if (description.trim().length === 0) throw new Error('SceneObjective description cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.objectiveId, this.sceneId, this.status];
  }

  toJSON(): Record<string, unknown> {
    return { objectiveId: this.objectiveId, sceneId: this.sceneId, description: this.description, status: this.status, priority: this.priority };
  }
}

export class CharacterObjective extends ValueObject {
  constructor(
    public readonly objectiveId: string,
    public readonly characterId: string,
    public readonly description: string,
    public readonly status: ObjectiveStatus = 'pending',
    public readonly priority: ObjectivePriority = 'medium',
    public readonly motivation: string = '',
  ) {
    super();
    if (objectiveId.trim().length === 0) throw new Error('CharacterObjective ID cannot be empty');
    if (characterId.trim().length === 0) throw new Error('CharacterObjective character ID cannot be empty');
    if (description.trim().length === 0) throw new Error('CharacterObjective description cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.objectiveId, this.characterId, this.status];
  }

  toJSON(): Record<string, unknown> {
    return { objectiveId: this.objectiveId, characterId: this.characterId, description: this.description, status: this.status, priority: this.priority, motivation: this.motivation };
  }
}

export class WorldObjective extends ValueObject {
  constructor(
    public readonly objectiveId: string,
    public readonly worldId: string,
    public readonly description: string,
    public readonly status: ObjectiveStatus = 'pending',
    public readonly scope: string = 'local',
  ) {
    super();
    if (objectiveId.trim().length === 0) throw new Error('WorldObjective ID cannot be empty');
    if (worldId.trim().length === 0) throw new Error('WorldObjective world ID cannot be empty');
    if (description.trim().length === 0) throw new Error('WorldObjective description cannot be empty');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.objectiveId, this.worldId, this.status];
  }

  toJSON(): Record<string, unknown> {
    return { objectiveId: this.objectiveId, worldId: this.worldId, description: this.description, status: this.status, scope: this.scope };
  }
}

export class ObjectiveCollection extends ValueObject {
  private readonly story: Map<string, StoryObjective>;
  private readonly scene: Map<string, SceneObjective>;
  private readonly character: Map<string, CharacterObjective>;
  private readonly world: Map<string, WorldObjective>;

  constructor(
    storyObjectives: StoryObjective[] = [],
    sceneObjectives: SceneObjective[] = [],
    characterObjectives: CharacterObjective[] = [],
    worldObjectives: WorldObjective[] = [],
  ) {
    super();
    this.story = new Map(storyObjectives.map(o => [o.objectiveId, o]));
    this.scene = new Map(sceneObjectives.map(o => [o.objectiveId, o]));
    this.character = new Map(characterObjectives.map(o => [o.objectiveId, o]));
    this.world = new Map(worldObjectives.map(o => [o.objectiveId, o]));
  }

  get storyObjectives(): readonly StoryObjective[] { return Array.from(this.story.values()); }
  get sceneObjectives(): readonly SceneObjective[] { return Array.from(this.scene.values()); }
  get characterObjectives(): readonly CharacterObjective[] { return Array.from(this.character.values()); }
  get worldObjectives(): readonly WorldObjective[] { return Array.from(this.world.values()); }
  get totalCount(): number { return this.story.size + this.scene.size + this.character.size + this.world.size; }

  addStoryObjective(o: StoryObjective): ObjectiveCollection {
    const next = new Map(this.story);
    next.set(o.objectiveId, o);
    return new ObjectiveCollection(Array.from(next.values()), Array.from(this.scene.values()), Array.from(this.character.values()), Array.from(this.world.values()));
  }

  addSceneObjective(o: SceneObjective): ObjectiveCollection {
    const next = new Map(this.scene);
    next.set(o.objectiveId, o);
    return new ObjectiveCollection(Array.from(this.story.values()), Array.from(next.values()), Array.from(this.character.values()), Array.from(this.world.values()));
  }

  addCharacterObjective(o: CharacterObjective): ObjectiveCollection {
    const next = new Map(this.character);
    next.set(o.objectiveId, o);
    return new ObjectiveCollection(Array.from(this.story.values()), Array.from(this.scene.values()), Array.from(next.values()), Array.from(this.world.values()));
  }

  addWorldObjective(o: WorldObjective): ObjectiveCollection {
    const next = new Map(this.world);
    next.set(o.objectiveId, o);
    return new ObjectiveCollection(Array.from(this.story.values()), Array.from(this.scene.values()), Array.from(this.character.values()), Array.from(next.values()));
  }

  achieved(): number {
    const all = [...this.story.values(), ...this.scene.values(), ...this.character.values(), ...this.world.values()];
    return all.filter(o => o.status === 'achieved').length;
  }

  protected getEqualityComponents(): unknown[] { return [this.totalCount]; }

  toJSON(): Record<string, unknown> {
    return {
      story: this.storyObjectives.map(o => o.toJSON()),
      scene: this.sceneObjectives.map(o => o.toJSON()),
      character: this.characterObjectives.map(o => o.toJSON()),
      world: this.worldObjectives.map(o => o.toJSON()),
    };
  }
}
