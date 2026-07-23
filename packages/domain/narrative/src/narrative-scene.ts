import { ValueObject } from '@storynaram/domain-kernel';
import { SceneNumber } from './narrative-numbers.js';
import { WordCount } from './narrative-metrics.js';

export type SceneType = 'opening' | 'rising' | 'climax' | 'falling' | 'resolution' | 'transition' | 'prologue' | 'epilogue' | 'interlude' | 'flashback' | 'montage';

export class Scene {
  constructor(
    public readonly sceneId: string,
    public readonly chapterId: string,
    public readonly sceneNumber: SceneNumber,
    public readonly title: string = '',
    public readonly summary: string = '',
    public readonly characters: readonly string[] = [],
    public readonly locations: readonly string[] = [],
    public readonly timelineRefs: readonly string[] = [],
    public readonly canonRefs: readonly string[] = [],
    public readonly objectives: readonly string[] = [],
    public readonly conflict: string = '',
    public readonly outcome: string = '',
    public readonly mood: string = '',
    public readonly povCharacter: string = '',
    public readonly sceneType: SceneType = 'rising',
    public readonly wordCount: WordCount = WordCount.zero(),
    public readonly notes: readonly string[] = [],
  ) {
    if (sceneId.trim().length === 0) throw new Error('Scene ID cannot be empty');
    if (chapterId.trim().length === 0) throw new Error('Scene chapter ID cannot be empty');
  }
}

export class SceneCollection extends ValueObject {
  private readonly items: Map<string, Scene>;

  constructor(scenes: Scene[] = []) {
    super();
    this.items = new Map();
    for (const s of scenes) {
      this.items.set(s.sceneId, s);
    }
  }

  get all(): readonly Scene[] { return Array.from(this.items.values()); }
  get count(): number { return this.items.size; }

  get(id: string): Scene | undefined { return this.items.get(id); }
  has(id: string): boolean { return this.items.has(id); }

  add(scene: Scene): SceneCollection {
    const next = new Map(this.items);
    next.set(scene.sceneId, scene);
    return new SceneCollection(Array.from(next.values()));
  }

  remove(id: string): SceneCollection {
    const next = new Map(this.items);
    next.delete(id);
    return new SceneCollection(Array.from(next.values()));
  }

  ofChapter(chapterId: string): Scene[] {
    return this.all.filter(s => s.chapterId === chapterId);
  }

  sorted(): Scene[] {
    return [...this.all].sort((a, b) => a.sceneNumber.value - b.sceneNumber.value);
  }

  withCharacter(characterId: string): Scene[] {
    return this.all.filter(s => s.characters.includes(characterId));
  }

  ofType(sceneType: SceneType): Scene[] {
    return this.all.filter(s => s.sceneType === sceneType);
  }

  totalWordCount(): WordCount {
    return this.all.reduce((sum, s) => sum.add(s.wordCount), WordCount.zero());
  }

  protected getEqualityComponents(): unknown[] { return [this.all.length]; }

  toJSON(): Record<string, unknown> {
    return { items: this.all.map(s => ({
      sceneId: s.sceneId, chapterId: s.chapterId,
      sceneNumber: s.sceneNumber.value, title: s.title,
      summary: s.summary, characters: [...s.characters],
      locations: [...s.locations], timelineRefs: [...s.timelineRefs],
      canonRefs: [...s.canonRefs], objectives: [...s.objectives],
      conflict: s.conflict, outcome: s.outcome, mood: s.mood,
      povCharacter: s.povCharacter, sceneType: s.sceneType,
      wordCount: s.wordCount.value, notes: [...s.notes],
    }))};
  }
}
