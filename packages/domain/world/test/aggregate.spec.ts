import { describe, it, expect } from 'vitest';
import { WorldAggregate } from '../src/world-aggregate';
import { WorldIdentity } from '../src/world-identity';
import { WorldProfile, WorldName, WorldDescription } from '../src/world-profile';
import { WorldGeography, Coordinates, Area, Population, Biome, Climate as ClimateVO } from '../src/world-geography';
import { Calendar, TimeSystem } from '../src/world-calendar';
import { WorldFactions, Faction } from '../src/world-faction';
import { WorldCultures, Culture } from '../src/world-culture';
import { MagicSystem } from '../src/world-magic-system';
import { TechnologyLevel } from '../src/world-technology-level';
import { EconomicSystem } from '../src/world-economy';
import { WorldNaturalResources, NaturalResource } from '../src/world-economy';
import { WorldRules, WorldRule, RuleCategory } from '../src/world-rule';
import { WorldHistory, WorldEvent } from '../src/world-history';
import { WorldStatistics } from '../src/world-statistics';
import { Region, PoliticalSystem } from '../src/world-political';
import { Currency, CurrencyCode } from '../src/world-culture';

function createProfile(): WorldProfile {
  return new WorldProfile({
    name: new WorldName('Middle Earth'),
    description: new WorldDescription('A fantasy world'),
    genre: 'fantasy',
    tone: 'epic',
  });
}

describe('WorldAggregate', () => {
  it('creates with identity', () => {
    const world = new WorldAggregate(WorldIdentity.create());
    expect(world.identity).toBeDefined();
  });

  it('accepts profile', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyProfile(createProfile());
    expect(world.profile.name.value).toBe('Middle Earth');
  });

  it('accepts geography', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyGeography(new WorldGeography({
      totalArea: new Area(1000),
      totalPopulation: new Population(50000),
      terrain: 'forest',
      primaryClimate: new ClimateVO('temperate'),
      primaryBiome: new Biome('forest'),
    }));
    expect(world.geography.totalArea.value).toBe(1000);
  });

  it('accepts calendar', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const cal = new Calendar(
      [{ name: 'Jan', days: 31 }],
      7,
      { year: 1, month: 1, day: 1 },
      'Era',
    );
    world.applyCalendar(cal);
    expect(world.calendar.currentDate.year).toBe(1);
  });

  it('accepts time system', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const ts = new TimeSystem(24, 60, 60, ['Monday']);
    world.applyTimeSystem(ts);
    expect(world.timeSystem.hoursInDay).toBe(24);
  });

  it('accepts magic system and raises event', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyMagicSystem(new MagicSystem('Arcane', 'arcane', 50, 'Standard magic', ['No resurrection']));
    expect(world.magicSystem.name).toBe('Arcane');
    expect(world.domainEvents.some(e => e.eventType === 'world.magic.system.changed')).toBe(true);
  });

  it('accepts technology level', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyTechnologyLevel(new TechnologyLevel('medieval', 'Medieval tech', ['Longbows', 'Castles']));
    expect(world.technologyLevel.era).toBe('medieval');
  });

  it('accepts economic system', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const currency = new Currency('c-1', 'Gold Coin', new CurrencyCode('GOLD'), 'G');
    world.applyEconomicSystem(new EconomicSystem('feudal', 'Feudal economy', currency, ['Farming', 'Mining']));
    expect(world.economicSystem.type).toBe('feudal');
  });

  it('manages regions', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const region = new Region(
      'r-1', 'Mordor', [new Coordinates(10, 10), new Coordinates(20, 20)],
      new Area(1000), new Biome('volcanic'), new ClimateVO('arid'), new Population(10000),
    );
    world.addRegion(region);
    expect(world.map.count).toBe(1);
    expect(world.map.get('r-1')?.name).toBe('Mordor');
    expect(world.domainEvents.some(e => e.eventType === 'world.region.added')).toBe(true);
  });

  it('manages factions', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.addFaction('f-1', 'Fellowship', 'The Fellowship of the Ring', 'political', 80);
    expect(world.factions.count).toBe(1);
    expect(world.factions.get('f-1')?.name).toBe('Fellowship');
    expect(world.domainEvents.some(e => e.eventType === 'world.faction.created')).toBe(true);
  });

  it('manages cultures', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const culture = new Culture('c-1', 'Elvish', 'Elven culture', ['lang-elv'], ['wisdom', 'beauty'], ['singing', 'crafting']);
    world.addCulture(culture);
    expect(world.cultures.count).toBe(1);
    expect(world.cultures.get('c-1')?.name).toBe('Elvish');
    expect(world.domainEvents.some(e => e.eventType === 'world.culture.updated')).toBe(true);
  });

  it('manages rules', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.addRule(new WorldRule('rule-1', 'Gravity', 'Standard gravity', 'physical'));
    expect(world.rules.count).toBe(1);
  });

  it('manages resources', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.addResource(new NaturalResource('res-1', 'Gold', 'mineral', 'abundant', 'region-1'));
    expect(world.resources.count).toBe(1);
  });

  it('records history events', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const event = new WorldEvent('evt-1', 'Founding', 'The world was founded', 'Year 1', 100);
    world.recordEvent(event);
    expect(world.history.count).toBe(1);
    expect(world.domainEvents.some(e => e.eventType === 'world.history.recorded')).toBe(true);
  });

  it('supports snapshots', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyProfile(createProfile());
    const snapshot = world.createSnapshot();
    expect(snapshot.aggregateId).toBe('1');
    expect(snapshot.version).toBe(world.version.value);
  });

  it('emits deleted event', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.markDeleted();
    expect(world.isDeleted()).toBe(true);
    expect(world.domainEvents.some(e => e.eventType === 'world.deleted')).toBe(true);
  });

  it('version increments on changes', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    const v1 = world.version.value;
    world.applyProfile(createProfile());
    expect(world.version.value).toBe(v1 + 1);
  });

  it('initializes and raises created event', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.initialize(createProfile());
    expect(world.domainEvents.some(e => e.eventType === 'world.created')).toBe(true);
  });

  it('refreshStatistics updates counts', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyProfile(createProfile());

    const region = new Region(
      'r-1', 'Region', [new Coordinates(0, 0)],
      new Area(100), new Biome('forest'), new ClimateVO('temperate'), new Population(100),
    );
    world.addRegion(region);
    world.addFaction('f-1', 'Test', 'Test faction', 'political', 50);

    expect(world.statistics.regionCount).toBe(1);
    expect(world.statistics.factionCount).toBe(1);
  });

  it('toJSON serializes all fields', () => {
    const world = new WorldAggregate(new WorldIdentity('1'));
    world.applyProfile(createProfile());
    const json = world.toJSON();
    expect(json.profile).toBeDefined();
    expect(json.geography).toBeDefined();
    expect(json.map).toBeDefined();
    expect(json.calendar).toBeDefined();
    expect(json.factions).toBeDefined();
    expect(json.cultures).toBeDefined();
    expect(json.magicSystem).toBeDefined();
    expect(json.technologyLevel).toBeDefined();
    expect(json.economicSystem).toBeDefined();
    expect(json.resources).toBeDefined();
    expect(json.rules).toBeDefined();
    expect(json.history).toBeDefined();
    expect(json.statistics).toBeDefined();
  });
});
