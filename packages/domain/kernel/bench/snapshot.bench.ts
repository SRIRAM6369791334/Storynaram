import { bench, describe } from 'vitest';
import { AggregateRoot } from '../src/aggregate-root';
import { Identity } from '../src/identity';
import { DomainSnapshot } from '../src/domain-snapshot';

class BenchAggregate extends AggregateRoot<Identity<string>> {
  constructor(
    id: string,
    public title: string,
    public description: string,
    public tags: string[],
    public metadata: Record<string, unknown>,
  ) {
    super(new Identity(id));
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      title: this.title,
      description: this.description,
      tags: [...this.tags],
      metadata: { ...this.metadata },
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    this.title = snapshot.data.title as string;
    this.description = snapshot.data.description as string;
    this.tags = [...(snapshot.data.tags as string[])];
    this.metadata = { ...(snapshot.data.metadata as Record<string, unknown>) };
  }
}

describe('Snapshot creation', () => {
  const aggregate = new BenchAggregate(
    'bench-agg',
    'Benchmark Title',
    'A longer description for the benchmark aggregate',
    ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    { key1: 'value1', key2: 42, key3: true, key4: { nested: 'data' } },
  );

  bench('create snapshot', () => {
    aggregate.createSnapshot();
  });

  bench('toJSON on snapshot', () => {
    const snapshot = aggregate.createSnapshot();
    snapshot.toJSON();
  });
});
