import { Timestamp } from './timestamp';

let sequenceCounter = 0;

function generateEventId(): string {
  sequenceCounter++;
  return `evt-${Date.now()}-${sequenceCounter}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface DomainEventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly tenant?: string;
  readonly userId?: string;
  readonly source?: string;
}

export interface DomainEventProps {
  readonly aggregateId: unknown;
  readonly aggregateType: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly metadata?: DomainEventMetadata;
  readonly eventId?: string;
  readonly timestamp?: Timestamp;
}

export class DomainEvent {
  public readonly eventId: string;
  public readonly aggregateId: unknown;
  public readonly aggregateType: string;
  public readonly eventType: string;
  public readonly timestamp: Timestamp;
  public readonly payload: Record<string, unknown>;
  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps) {
    this.eventId = props.eventId ?? generateEventId();
    this.aggregateId = props.aggregateId;
    this.aggregateType = props.aggregateType;
    this.eventType = props.eventType;
    this.timestamp = props.timestamp ?? Timestamp.now();
    this.payload = { ...props.payload };
    this.metadata = { ...props.metadata };
  }

  withCorrelationId(correlationId: string): DomainEvent {
    return new DomainEvent({
      ...this,
      metadata: { ...this.metadata, correlationId },
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      eventType: this.eventType,
      timestamp: this.timestamp.toJSON(),
      payload: this.payload,
      metadata: this.metadata,
    };
  }

  static fromJSON(data: Record<string, unknown>): DomainEvent {
    return new DomainEvent({
      eventId: data.eventId as string,
      aggregateId: data.aggregateId,
      aggregateType: data.aggregateType as string,
      eventType: data.eventType as string,
      timestamp: Timestamp.fromISOString(data.timestamp as string),
      payload: data.payload as Record<string, unknown>,
      metadata: data.metadata as DomainEventMetadata,
    });
  }
}
