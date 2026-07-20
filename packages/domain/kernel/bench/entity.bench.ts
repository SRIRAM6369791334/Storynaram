import { bench, describe } from 'vitest';
import { Entity } from '../src/entity';
import { Identity } from '../src/identity';
import { Timestamp } from '../src/timestamp';

class BenchEntity extends Entity<Identity<string>> {
  constructor(id: string, public data: Record<string, unknown>) {
    super(new Identity(id));
  }

  mutate(): void {
    this.data.updated = true;
    this.markUpdated();
  }
}

describe('Entity creation', () => {
  bench('create 1000 entities', () => {
    const entities: BenchEntity[] = [];
    for (let i = 0; i < 1000; i++) {
      entities.push(new BenchEntity(String(i), { index: i, name: `entity-${i}` }));
    }
  });

  bench('mutate 1000 entities', () => {
    const entities: BenchEntity[] = [];
    for (let i = 0; i < 1000; i++) {
      entities.push(new BenchEntity(String(i), { index: i }));
    }
    for (const entity of entities) {
      entity.mutate();
    }
  });

  bench('equals 1000 pairs', () => {
    for (let i = 0; i < 1000; i++) {
      const a = new BenchEntity(String(i), {});
      const b = new BenchEntity(String(i), {});
      a.equals(b);
    }
  });
});
