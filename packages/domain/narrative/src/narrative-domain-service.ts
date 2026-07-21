import { DomainService, Specification } from '@storynaram/domain-kernel';
import { NarrativeAggregate } from './narrative-aggregate';
import { NarrativeIdentity } from './narrative-identity';
import { NarrativeRepositoryContract } from './narrative-repository';
import { WordCount, ReadingTime } from './narrative-metrics';
import { PublishedSpec, DraftSpec, CompletedSpec, NovelSpec, ComicSpec, ScreenplaySpec } from './narrative-specifications';

export class NarrativeDomainService extends DomainService {
  constructor(
    private readonly repository: NarrativeRepositoryContract,
  ) {
    super('NarrativeDomainService');
  }

  async calculateTotalWordCount(narrativeId: string): Promise<WordCount> {
    const identity = new NarrativeIdentity(narrativeId);
    const narrative = await this.repository.findByIdentity(identity);
    if (!narrative) return WordCount.zero();
    const wc = narrative.chapters.totalWordCount()
      .add(narrative.scenes.totalWordCount())
      .add(narrative.beats.totalWordCount())
      .add(narrative.dialogues.totalWordCount());
    return wc;
  }

  async calculateReadingTime(narrativeId: string): Promise<ReadingTime> {
    const wc = await this.calculateTotalWordCount(narrativeId);
    return new ReadingTime(wc);
  }

  async validateStructure(narrativeId: string): Promise<string[]> {
    const identity = new NarrativeIdentity(narrativeId);
    const narrative = await this.repository.findByIdentity(identity);
    if (!narrative) return ['Narrative not found'];
    const errors: string[] = [];
    for (const scene of narrative.scenes.all) {
      if (!narrative.chapters.has(scene.chapterId)) {
        errors.push(`Scene ${scene.sceneId} references non-existent chapter ${scene.chapterId}`);
      }
    }
    for (const beat of narrative.beats.all) {
      if (!narrative.scenes.has(beat.sceneId)) {
        errors.push(`Beat ${beat.beatId} references non-existent scene ${beat.sceneId}`);
      }
    }
    for (const dialogue of narrative.dialogues.all) {
      if (!narrative.beats.has(dialogue.beatId)) {
        errors.push(`Dialogue ${dialogue.dialogueId} references non-existent beat ${dialogue.beatId}`);
      }
    }
    return errors;
  }

  async findPublished(): Promise<NarrativeAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(n => new PublishedSpec().isSatisfiedBy(n));
  }

  async findDrafts(): Promise<NarrativeAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(n => new DraftSpec().isSatisfiedBy(n));
  }

  async findNovels(): Promise<NarrativeAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(n => new NovelSpec().isSatisfiedBy(n));
  }
}
