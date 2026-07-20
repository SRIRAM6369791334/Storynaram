import { bench, describe } from 'vitest';
import { WorldAggregate } from '../src/world-aggregate';
import { WorldIdentity } from '../src/world-identity';
import { Region } from '../src/world-political';
import { Coordinates, Area, Population, Biome, Climate as ClimateVO } from '../src/world-geography';

function createWorldWithRegions(count: number): WorldAggregate {
  const world = new WorldAggregate(WorldIdentity.create());
  for (let i = 0; i < count; i++) {
    const region = new Region(
      `r-${i}`, `Region ${i}`, [new Coordinates(i, i)],
      new Area(100), new Biome('forest'), new ClimateVO('temperate'), new Population(100),
    );
    world.addRegion(region);
  }
  return world;
}

describe('Region lookup', () => {
  bench('lookup region by id (100 regions)', () => {
    const world = createWorldWithRegions(100);
    for (let i = 0; i < 100; i++) {
      world.map.get(`r-${i}`);
    }
  });
});
