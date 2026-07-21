import { AggregateRoot, DomainSnapshot } from '@storynaram/domain-kernel';
import { NarrativeIdentity } from './narrative-identity';
import { NarrativeProfile, NarrativeFormat } from './narrative-profile';
import { NarrativeTitle } from './narrative-title';
import { NarrativeStatus, NarrativeStatusType } from './narrative-status';
import { Chapter, ChapterCollection, ChapterStatus } from './narrative-chapter';
import { Scene, SceneCollection, SceneType } from './narrative-scene';
import { Beat, BeatCollection, BeatType } from './narrative-beat';
import { Dialogue, DialogueCollection } from './narrative-dialogue';
import { ChapterNumber, SceneNumber, BeatNumber, DialogueOrder } from './narrative-numbers';
import { WordCount, ReadingTime } from './narrative-metrics';
import { NarrativeMetadata } from './narrative-metadata';
import { NarrativeStatistics } from './narrative-statistics';
import { Genre, Audience, Language } from './narrative-genre';
import {
  NarrativeCreatedEvent,
  ChapterAddedEvent,
  SceneAddedEvent,
  BeatAddedEvent,
  DialogueAddedEvent,
  NarrativePublishedEvent,
  NarrativeArchivedEvent,
} from './narrative-events';
import {
  SequentialNumberingRule,
  UniqueChapterNumbersRule,
  ChapterOrderingRule,
} from './business-rules';

export class NarrativeAggregate extends AggregateRoot<NarrativeIdentity> {
  private _profile: NarrativeProfile;
  private _chapters: ChapterCollection;
  private _scenes: SceneCollection;
  private _beats: BeatCollection;
  private _dialogues: DialogueCollection;
  private _metadata: NarrativeMetadata;
  private _statistics: NarrativeStatistics;

  constructor(identity: NarrativeIdentity) {
    super(identity);
    this._profile = new NarrativeProfile(new NarrativeTitle('Untitled'), 'novel');
    this._chapters = new ChapterCollection();
    this._scenes = new SceneCollection();
    this._beats = new BeatCollection();
    this._dialogues = new DialogueCollection();
    this._metadata = new NarrativeMetadata();
    this._statistics = new NarrativeStatistics();
  }

  get profile(): NarrativeProfile { return this._profile; }
  get chapters(): ChapterCollection { return this._chapters; }
  get scenes(): SceneCollection { return this._scenes; }
  get beats(): BeatCollection { return this._beats; }
  get dialogues(): DialogueCollection { return this._dialogues; }
  get metadata(): NarrativeMetadata { return this._metadata; }
  get statistics(): NarrativeStatistics { return this._statistics; }

  initialize(
    title: string,
    format: NarrativeFormat = 'novel',
  ): void {
    this._profile = new NarrativeProfile(
      new NarrativeTitle(title),
      format,
    );
    this.addDomainEvent(new NarrativeCreatedEvent(
      this.identity.value,
      { title, format },
    ));
    this.markUpdated();
  }

  updateProfile(profile: NarrativeProfile): void {
    this._profile = profile;
    this.markUpdated();
  }

  addChapter(
    chapterId: string,
    title: string,
    chapterNumber: number,
    summary: string = '',
  ): void {
    const num = new ChapterNumber(chapterNumber);

    const seqRule = new SequentialNumberingRule(num, this._chapters);
    const seqViolation = seqRule.check();
    if (seqViolation) throw new Error(seqViolation.message);

    const uniqueRule = new UniqueChapterNumbersRule(num, this._chapters);
    const uniqueViolation = uniqueRule.check();
    if (uniqueViolation) throw new Error(uniqueViolation.message);

    const chapter = new Chapter(chapterId, title, num, summary);
    this._chapters = this._chapters.add(chapter);

    this.addDomainEvent(new ChapterAddedEvent(
      this.identity.value,
      { chapterId, title, chapterNumber },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  addScene(
    sceneId: string,
    chapterId: string,
    sceneNumber: number,
    title: string = '',
    sceneType: SceneType = 'rising',
  ): void {
    if (!this._chapters.has(chapterId)) throw new Error(`Chapter not found: ${chapterId}`);

    const num = new SceneNumber(sceneNumber);
    const existing = this._scenes.ofChapter(chapterId);
    if (existing.some(s => s.sceneNumber.value === num.value)) {
      throw new Error(`Scene number ${sceneNumber} already exists in chapter ${chapterId}`);
    }

    const scene = new Scene(sceneId, chapterId, num, title, '', [], [], [], [], [], '', '', '', '', sceneType);
    this._scenes = this._scenes.add(scene);

    this.addDomainEvent(new SceneAddedEvent(
      this.identity.value,
      { sceneId, chapterId, sceneNumber, title },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  addBeat(
    beatId: string,
    sceneId: string,
    beatNumber: number,
    beatType: BeatType,
    content: string = '',
  ): void {
    if (!this._scenes.has(sceneId)) throw new Error(`Scene not found: ${sceneId}`);

    const num = new BeatNumber(beatNumber);
    const existing = this._beats.ofScene(sceneId);
    if (existing.some(b => b.beatNumber.value === num.value)) {
      throw new Error(`Beat number ${beatNumber} already exists in scene ${sceneId}`);
    }

    const beat = new Beat(beatId, sceneId, num, beatType, content);
    this._beats = this._beats.add(beat);

    this.addDomainEvent(new BeatAddedEvent(
      this.identity.value,
      { beatId, sceneId, beatNumber, beatType },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  addDialogue(
    dialogueId: string,
    beatId: string,
    order: number,
    speaker: string,
    content: string,
    target: string = '',
  ): void {
    if (!this._beats.has(beatId)) throw new Error(`Beat not found: ${beatId}`);

    const ord = new DialogueOrder(order);
    const existing = this._dialogues.ofBeat(beatId);
    if (existing.some(d => d.order.value === ord.value)) {
      throw new Error(`Dialogue order ${order} already exists in beat ${beatId}`);
    }

    const dialogue = new Dialogue(dialogueId, beatId, ord, speaker, content, target);
    this._dialogues = this._dialogues.add(dialogue);

    this.addDomainEvent(new DialogueAddedEvent(
      this.identity.value,
      { dialogueId, beatId, order, speaker },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  publish(): void {
    this._profile = this._profile.withStatus(new NarrativeStatus('published'));
    this.addDomainEvent(new NarrativePublishedEvent(
      this.identity.value,
      { title: this._profile.title.value },
    ));
    this.markUpdated();
  }

  archive(): void {
    this._profile = this._profile.withStatus(new NarrativeStatus('archived'));
    this.addDomainEvent(new NarrativeArchivedEvent(
      this.identity.value,
      { title: this._profile.title.value },
    ));
    this.markUpdated();
  }

  scenesOfChapter(chapterId: string): Scene[] {
    return this._scenes.ofChapter(chapterId);
  }

  beatsOfScene(sceneId: string): Beat[] {
    return this._beats.ofScene(sceneId);
  }

  dialoguesOfBeat(beatId: string): Dialogue[] {
    return this._dialogues.ofBeat(beatId);
  }

  private refreshStatistics(): void {
    const allChapters = this._chapters.all;
    const allScenes = this._scenes.all;
    const allBeats = this._beats.all;
    const allDialogues = this._dialogues.all;
    const totalWords = this._chapters.totalWordCount()
      .add(this._scenes.totalWordCount())
      .add(this._beats.totalWordCount())
      .add(this._dialogues.totalWordCount());
    const readingTime = new ReadingTime(totalWords);
    const completedChapters = allChapters.filter(c => c.status === 'final').length;
    const completedScenes = allScenes.filter(s => s.outcome.length > 0).length;

    this._statistics = new NarrativeStatistics({
      totalChapters: allChapters.length,
      totalScenes: allScenes.length,
      totalBeats: allBeats.length,
      totalDialogues: allDialogues.length,
      totalWordCount: totalWords.value,
      readingTimeMinutes: readingTime.minutes,
      completedChapters,
      completedScenes,
      chapterProgress: allChapters.length > 0 ? Math.round((completedChapters / allChapters.length) * 100) : 0,
      sceneProgress: allScenes.length > 0 ? Math.round((completedScenes / allScenes.length) * 100) : 0,
    });
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      profile: this._profile.toJSON(),
      chapters: this._chapters.toJSON(),
      scenes: this._scenes.toJSON(),
      beats: this._beats.toJSON(),
      dialogues: this._dialogues.toJSON(),
      metadata: this._metadata.toJSON(),
      statistics: this._statistics.toJSON(),
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    const data = snapshot.data;
    this._profile = data.profile as NarrativeProfile;
    this._chapters = data.chapters as ChapterCollection;
    this._scenes = data.scenes as SceneCollection;
    this._beats = data.beats as BeatCollection;
    this._dialogues = data.dialogues as DialogueCollection;
    this._metadata = data.metadata as NarrativeMetadata;
    this._statistics = data.statistics as NarrativeStatistics;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      profile: this._profile.toJSON(),
      chapters: this._chapters.toJSON(),
      scenes: this._scenes.toJSON(),
      beats: this._beats.toJSON(),
      dialogues: this._dialogues.toJSON(),
      metadata: this._metadata.toJSON(),
      statistics: this._statistics.toJSON(),
    };
  }
}
