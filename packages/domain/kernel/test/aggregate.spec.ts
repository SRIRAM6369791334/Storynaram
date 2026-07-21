import { describe, it, expect } from 'vitest';
import { AggregateRoot } from '../src/aggregate-root';
import { Identity } from '../src/identity';
import { DomainEvent } from '../src/domain-event';
import { DomainSnapshot } from '../src/domain-snapshot';

class TestAggregate extends AggregateRoot<Identity<string>> {
  constructor(
    id: string,
    public value: string,
  ) {
    super(new Identity(id));
  }

  changeValue(newValue: string): void {
    const oldValue = this.value;
    this.value = newValue;
    this.addDomainEvent(new DomainEvent({
      aggregateId: this.identity.value,
      aggregateType: 'TestAggregate',
      eventType: 'value.changed',
      payload: { oldValue, newValue },
    }));
    this.markUpdated();
  }

  protected toSnapshot(): Record<string, unknown> {
    return { value: this.value };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    this.value = snapshot.data.value as string;
  }
}

describe('AggregateRoot', () => {
  it('starts with no domain events', () => {
    const agg = new TestAggregate('1', 'initial');
    expect(agg.domainEvents).toHaveLength(0);
  });

  it('accumulates domain events', () => {
    const agg = new TestAggregate('1', 'initial');
    agg.changeValue('v2');
    expect(agg.domainEvents).toHaveLength(1);
    expect(agg.domainEvents[0]!.eventType).toBe('value.changed');
    expect(agg.domainEvents[0]!.payload).toEqual({ oldValue: 'initial', newValue: 'v2' });
  });

  it('clearEvents removes all events', () => {
    const agg = new TestAggregate('1', 'initial');
    agg.changeValue('v2');
    agg.clearEvents();
    expect(agg.domainEvents).toHaveLength(0);
  });

  it('creates a snapshot', () => {
    const agg = new TestAggregate('1', 'snapshot-me');
    const snapshot = agg.createSnapshot();
    expect(snapshot.aggregateId).toBe('1');
    expect(snapshot.aggregateType).toBe('TestAggregate');
    expect(snapshot.data.value).toBe('snapshot-me');
    expect(snapshot.version).toBe(1);
  });

  it('snapshot has timestamp', () => {
    const agg = new TestAggregate('1', 'test');
    const snapshot = agg.createSnapshot();
    expect(snapshot.timestamp).toBeDefined();
  });

  it('domain events are immutable copies', () => {
    const agg = new TestAggregate('1', 'test');
    agg.changeValue('v2');
    const events = agg.domainEvents;
    expect(events).toHaveLength(1);
    agg.clearEvents();
    expect(events).toHaveLength(1);
  });

  it('toJSON includes snapshot version and events', () => {
    const agg = new TestAggregate('1', 'test');
    agg.changeValue('v2');
    const json = agg.toJSON();
    expect(json.snapshotVersion).toBe(0);
    expect((json.domainEvents as unknown[])).toHaveLength(1);
  });
});
