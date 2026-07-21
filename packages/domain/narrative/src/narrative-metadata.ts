import { ValueObject } from '@storynaram/domain-kernel';
import { NarrativeProfile, NarrativeFormat } from './narrative-profile';
import { NarrativeStatus, NarrativeStatusType } from './narrative-status';
import { NarrativeTitle } from './narrative-title';
import { Subtitle } from './narrative-title';
import { Synopsis } from './narrative-synopsis';
import { Summary } from './narrative-synopsis';
import { Genre, Audience, Language } from './narrative-genre';
import { WordCount, ReadingTime } from './narrative-metrics';

export interface NarrativeMetadataProps {
  createdAt?: Date;
  updatedAt?: Date;
  lastEditedBy?: string;
  revision?: number;
  seriesName?: string;
  seriesOrder?: number;
  volumeNumber?: number;
  bookNumber?: number;
  partNumber?: number;
  isStandalone?: boolean;
}

export class NarrativeMetadata extends ValueObject {
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly lastEditedBy: string;
  public readonly revision: number;
  public readonly seriesName: string;
  public readonly seriesOrder: number;
  public readonly volumeNumber: number;
  public readonly bookNumber: number;
  public readonly partNumber: number;
  public readonly isStandalone: boolean;

  constructor(props: NarrativeMetadataProps = {}) {
    super();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.lastEditedBy = props.lastEditedBy ?? '';
    this.revision = props.revision ?? 0;
    this.seriesName = props.seriesName ?? '';
    this.seriesOrder = props.seriesOrder ?? 1;
    this.volumeNumber = props.volumeNumber ?? 0;
    this.bookNumber = props.bookNumber ?? 0;
    this.partNumber = props.partNumber ?? 0;
    this.isStandalone = props.isStandalone ?? true;
    if (this.revision < 0) throw new Error('Revision cannot be negative');
  }

  withUpdate(editors: string): NarrativeMetadata {
    return new NarrativeMetadata({
      ...this,
      updatedAt: new Date(),
      lastEditedBy: editors,
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
      seriesName: this.seriesName,
      seriesOrder: this.seriesOrder,
      volumeNumber: this.volumeNumber,
      bookNumber: this.bookNumber,
      partNumber: this.partNumber,
      isStandalone: this.isStandalone,
    };
  }
}
