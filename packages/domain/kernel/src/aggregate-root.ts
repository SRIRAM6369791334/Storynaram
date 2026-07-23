import { Entity } from './entity.js';
import { Identity } from './identity.js';
import { DomainEvent } from './domain-event.js';
import { DomainSnapshot } from './domain-snapshot.js';
import { Timestamp } from './timestamp.js';

export abstract class AggregateRoot<TIdentity extends Identity = Identity> extends Entity<TIdentity> {
  private readonly _domainEvents: DomainEvent[] = [];
  private _snapshotVersion: number = 0;

  get domainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents.length = 0;
  }

  getSnapshotVersion(): number {
    return this._snapshotVersion;
  }

  setSnapshotVersion(version: number): void {
    this._snapshotVersion = version;
  }

  createSnapshot(): DomainSnapshot {
    return new DomainSnapshot({
      aggregateId: this.identity.value,
      aggregateType: this.constructor.name,
      version: this.version.value,
      data: this.toSnapshot(),
      timestamp: Timestamp.now(),
    });
  }

  protected abstract toSnapshot(): Record<string, unknown>;

  protected abstract applySnapshot(snapshot: DomainSnapshot): void;

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      snapshotVersion: this._snapshotVersion,
      domainEvents: this._domainEvents.map(e => e.toJSON()),
    };
  }
}
