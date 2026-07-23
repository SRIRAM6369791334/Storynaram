import { Timestamp } from './timestamp.js';

export interface DomainSnapshotProps {
  aggregateId: unknown;
  aggregateType: string;
  version: number;
  data: Record<string, unknown>;
  timestamp: Timestamp;
}

export class DomainSnapshot {
  public readonly aggregateId: unknown;
  public readonly aggregateType: string;
  public readonly version: number;
  public readonly data: Record<string, unknown>;
  public readonly timestamp: Timestamp;

  constructor(props: DomainSnapshotProps) {
    this.aggregateId = props.aggregateId;
    this.aggregateType = props.aggregateType;
    this.version = props.version;
    this.data = { ...props.data };
    this.timestamp = props.timestamp;
  }

  toJSON(): Record<string, unknown> {
    return {
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      version: this.version,
      data: this.data,
      timestamp: this.timestamp.toJSON(),
    };
  }
}

export interface SnapshotStore {
  save(snapshot: DomainSnapshot): Promise<void>;
  findLatest(aggregateId: unknown, aggregateType: string): Promise<DomainSnapshot | null>;
  findByVersion(aggregateId: unknown, aggregateType: string, version: number): Promise<DomainSnapshot | null>;
}
