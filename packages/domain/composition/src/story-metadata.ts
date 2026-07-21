import { ValueObject } from '@storynaram/domain-kernel';

export interface StoryMetadataProps {
  createdAt?: Date;
  updatedAt?: Date;
  lastEditedBy?: string;
  revision?: number;
  sourceNarrativeId?: string;
  sourceCharacterIds?: readonly string[];
  sourceWorldIds?: readonly string[];
  sourceTimelineIds?: readonly string[];
  sourceCanonIds?: readonly string[];
}

export class StoryMetadata extends ValueObject {
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly lastEditedBy: string;
  public readonly revision: number;
  public readonly sourceNarrativeId: string;
  public readonly sourceCharacterIds: readonly string[];
  public readonly sourceWorldIds: readonly string[];
  public readonly sourceTimelineIds: readonly string[];
  public readonly sourceCanonIds: readonly string[];

  constructor(props: StoryMetadataProps = {}) {
    super();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.lastEditedBy = props.lastEditedBy ?? '';
    this.revision = props.revision ?? 0;
    this.sourceNarrativeId = props.sourceNarrativeId ?? '';
    this.sourceCharacterIds = props.sourceCharacterIds ?? [];
    this.sourceWorldIds = props.sourceWorldIds ?? [];
    this.sourceTimelineIds = props.sourceTimelineIds ?? [];
    this.sourceCanonIds = props.sourceCanonIds ?? [];
    if (this.revision < 0) throw new Error('Revision cannot be negative');
  }

  withUpdate(editor: string): StoryMetadata {
    return new StoryMetadata({
      ...this,
      updatedAt: new Date(),
      lastEditedBy: editor,
      revision: this.revision + 1,
    });
  }

  protected getEqualityComponents(): unknown[] {
    return [this.revision, this.createdAt.getTime()];
  }

  toJSON(): Record<string, unknown> {
    return {
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      lastEditedBy: this.lastEditedBy,
      revision: this.revision,
      sourceNarrativeId: this.sourceNarrativeId,
      sourceCharacterIds: [...this.sourceCharacterIds],
      sourceWorldIds: [...this.sourceWorldIds],
      sourceTimelineIds: [...this.sourceTimelineIds],
      sourceCanonIds: [...this.sourceCanonIds],
    };
  }
}
