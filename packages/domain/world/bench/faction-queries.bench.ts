import { bench, describe } from 'vitest';
import { WorldFactions, Faction } from '../src/world-faction';

function createFactions(count: number): WorldFactions {
  const factions: Faction[] = [];
  const types = ['political', 'religious', 'military', 'guild', 'secret'] as const;
  for (let i = 0; i < count; i++) {
    factions.push(new Faction(
      `f-${i}`, `Faction ${i}`, `Description ${i}`,
      types[i % types.length]!,
      Math.floor(Math.random() * 100),
    ));
  }
  return new WorldFactions(factions);
}

describe('Faction queries', () => {
  bench('filter by type (500 factions)', () => {
    const factions = createFactions(500);
    for (const type of ['political', 'religious', 'military', 'guild', 'secret'] as const) {
      factions.ofType(type);
    }
  });

  bench('filter by influence (500 factions)', () => {
    const factions = createFactions(500);
    factions.withInfluenceAbove(50);
  });
});
