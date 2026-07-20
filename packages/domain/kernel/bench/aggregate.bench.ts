import { bench, describe } from 'vitest';
import { AggregateRoot } from '../src/aggregate-root';
import { Identity } from '../src/identity';
import { DomainEvent } from '../src/domain-event';
import { DomainSnapshot } from '../src/domain-snapshot';

class BenchAggregate extends AggregateRoot<Identity<string>> {
  constructor(id: string, public value: string) {
    super(new Identity(id));
  }

  change(v: string): void {
    this.value = v;
    this.addDomainEvent(new DomainEvent({
      aggregateId: this.identity.value,
      aggregateType: 'BenchAggregate',
      eventType: 'changed',
      payload: { value: v },
    }));
    this.markUpdated();
  }

  protected toSnapshot(): Record<string, unknown> {
    return { value: this.value };
  }

  protected applySnapshot(_snapshot: DomainSnapshot): void {}
}

describe('Aggregate mutations', () => {
  bench('create 1000 aggregates', () => {
    const aggregates: BenchAggregate[] = [];
    for (let i = 0; i < 1000; i++) {
      aggregates.push(new BenchAggregate(String(i), 'initial'));
    }
  });

  bench('mutate 1000 aggregates with events', () => {
    const aggregates: BenchAggregate[] = [];
    for (let i = 0; i < 1000; i++) {
      aggregates.push(new BenchAggregate(String(i), 'initial'));
    }
    for (const agg of aggregates) {
      agg.change('updated');
    }
  });

  bench('clear events on 1000 aggregates', () => {
    const aggregates: BenchAggregate[] = [];
    for (let i = 0; i < 1000; i++) {
      aggregates.push(new BenchAggregate(String(i), 'initial'));
    }
    for (const agg of aggregates) {
      agg.change('updated');
    }
    for (const agg of aggregates) {
      agg.clearEvents();
    }
  });
});
