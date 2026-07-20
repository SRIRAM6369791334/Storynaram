import { describe, it, expect } from 'vitest';
import { WorldAggregate } from '../src/world-aggregate';
import { WorldIdentity } from '../src/world-identity';
import { WorldProfile, WorldName, WorldDescription } from '../src/world-profile';
import {
  FantasySpecification,
  SciFiSpecification,
  HistoricalSpecification,
  ModernSpecification,
  PostApocalypticSpecification,
  OpenWorldSpecification,
  SandboxSpecification,
} from '../src/world-specifications';
import { Region, PoliticalSystem } from '../src/world-political';
import { Coordinates, Area, Population, Biome, Climate as ClimateVO } from '../src/world-geography';

function createWorld(genre: string, tone: string = 'dark'): WorldAggregate {
  const world = new WorldAggregate(WorldIdentity.create());
  world.applyProfile(new WorldProfile({
    name: new WorldName('Test World'),
    description: new WorldDescription('A test world'),
    genre,
    tone,
  }));
  return world;
}

describe('Specifications', () => {
  it('FantasySpecification matches fantasy', () => {
    const spec = new FantasySpecification();
    expect(spec.isSatisfiedBy(createWorld('fantasy'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('high fantasy'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('sci-fi'))).toBe(false);
  });

  it('SciFiSpecification matches scifi', () => {
    const spec = new SciFiSpecification();
    expect(spec.isSatisfiedBy(createWorld('sci-fi'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('cyberpunk'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('fantasy'))).toBe(false);
  });

  it('HistoricalSpecification matches historical', () => {
    const spec = new HistoricalSpecification();
    expect(spec.isSatisfiedBy(createWorld('historical'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('fantasy'))).toBe(false);
  });

  it('ModernSpecification matches modern', () => {
    const spec = new ModernSpecification();
    expect(spec.isSatisfiedBy(createWorld('modern'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('fantasy'))).toBe(false);
  });

  it('PostApocalypticSpecification matches post-apocalyptic', () => {
    const spec = new PostApocalypticSpecification();
    expect(spec.isSatisfiedBy(createWorld('post-apocalyptic'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('dystopian'))).toBe(true);
    expect(spec.isSatisfiedBy(createWorld('fantasy'))).toBe(false);
  });

  it('OpenWorldSpecification requires 5+ regions', () => {
    const spec = new OpenWorldSpecification();
    const world = createWorld('fantasy');
    expect(spec.isSatisfiedBy(world)).toBe(false);

    const region = new Region(
      'r-1', 'Region', [new Coordinates(0, 0)],
      new Area(100), new Biome('forest'), new ClimateVO('temperate'), new Population(100),
    );
    for (let i = 0; i < 5; i++) {
      const r = new Region(
        `r-${i}`, `Region ${i}`, [new Coordinates(i, i)],
        new Area(100), new Biome('forest'), new ClimateVO('temperate'), new Population(100),
      );
      world.addRegion(r);
    }
    expect(spec.isSatisfiedBy(world)).toBe(true);
  });

  it('SandboxSpecification matches worlds with no rules', () => {
    const spec = new SandboxSpecification();
    expect(spec.isSatisfiedBy(createWorld('fantasy'))).toBe(true);
  });

  it('supports and composition', () => {
    const fantasy = new FantasySpecification();
    const world = createWorld('fantasy', 'dark');
    expect(fantasy.isSatisfiedBy(world)).toBe(true);
  });
});
