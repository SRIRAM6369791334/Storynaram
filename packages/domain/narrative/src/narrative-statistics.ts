import { ValueObject } from '@storynaram/domain-kernel';

export interface NarrativeStatisticsProps {
  totalChapters?: number;
  totalScenes?: number;
  totalBeats?: number;
  totalDialogues?: number;
  totalWordCount?: number;
  readingTimeMinutes?: number;
  chapterProgress?: number;
  sceneProgress?: number;
  beatProgress?: number;
  completedScenes?: number;
  completedChapters?: number;
}

export class NarrativeStatistics extends ValueObject {
  public readonly totalChapters: number;
  public readonly totalScenes: number;
  public readonly totalBeats: number;
  public readonly totalDialogues: number;
  public readonly totalWordCount: number;
  public readonly readingTimeMinutes: number;
  public readonly chapterProgress: number;
  public readonly sceneProgress: number;
  public readonly beatProgress: number;
  public readonly completedScenes: number;
  public readonly completedChapters: number;

  constructor(props: NarrativeStatisticsProps = {}) {
    super();
    this.totalChapters = props.totalChapters ?? 0;
    this.totalScenes = props.totalScenes ?? 0;
    this.totalBeats = props.totalBeats ?? 0;
    this.totalDialogues = props.totalDialogues ?? 0;
    this.totalWordCount = props.totalWordCount ?? 0;
    this.readingTimeMinutes = props.readingTimeMinutes ?? 0;
    this.chapterProgress = props.chapterProgress ?? 0;
    this.sceneProgress = props.sceneProgress ?? 0;
    this.beatProgress = props.beatProgress ?? 0;
    this.completedScenes = props.completedScenes ?? 0;
    this.completedChapters = props.completedChapters ?? 0;
    if (this.totalChapters < 0) throw new Error('Total chapters cannot be negative');
  }

  protected getEqualityComponents(): unknown[] {
    return [this.totalChapters, this.totalScenes, this.totalWordCount];
  }

  toJSON(): Record<string, unknown> {
    return {
      totalChapters: this.totalChapters,
      totalScenes: this.totalScenes,
      totalBeats: this.totalBeats,
      totalDialogues: this.totalDialogues,
      totalWordCount: this.totalWordCount,
      readingTimeMinutes: this.readingTimeMinutes,
      chapterProgress: this.chapterProgress,
      sceneProgress: this.sceneProgress,
      beatProgress: this.beatProgress,
      completedScenes: this.completedScenes,
      completedChapters: this.completedChapters,
    };
  }
}
