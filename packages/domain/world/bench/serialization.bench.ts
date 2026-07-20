import { bench, describe } from 'vitest';
import { WorldAggregate } from '../src/world-aggregate';
import { WorldIdentity } from '../src/world-identity';
import { WorldProfile, WorldName, WorldDescription } from '../src/world-profile';
import { Region } from '../src/world-political';
import { Coordinates, Area, Population, Biome, Climate as ClimateVO } from '../src/world-geography';

function createPopulatedWorld(): WorldAggregate {
  const world = new WorldAggregate(WorldIdentity.create());
  world.applyProfile(new WorldProfile({
    name: new WorldName('Test World'),
    description: new WorldDescription('A fully populated test world'),
    genre: 'fantasy',
    tone: 'epic',
  }));

  for (let i = 0; i < 50; i++) {
    const region = new Region(
      `r-${i}`, `Region ${i}`, [new Coordinates(i, i)],
      new Area(100), new Biome('forest'), new ClimateVO('temperate'), new Population(1000),
    );
    world.addRegion(region);
  }

  for (let i = 0; i < 10; i++) {
    world.addFaction(`f-${i}`, `Faction ${i}`, `Desc ${i}`, 'political', 50);
  }

  return world;
}

describe('Serialization', () => {
  const world = createPopulatedWorld();

  bench('toJSON serialization', () => {
    world.toJSON();
  });

  bench('createSnapshot', () => {
    world.createSnapshot();
  });
});
