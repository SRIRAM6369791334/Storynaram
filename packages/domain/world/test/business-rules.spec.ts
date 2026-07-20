import { describe, it, expect } from 'vitest';
import {
  UniqueWorldNameRule,
  RegionHierarchyRule,
  PoliticalConsistencyRule,
  ClimateConstraintRule,
  CalendarConsistencyRule,
  assertUniqueWorldName,
} from '../src/business-rules';
import { BusinessRuleError } from '@storynaram/domain-kernel';
import { WorldMap } from '../src/world-map';
import { Region } from '../src/world-political';
import { WorldFactions, Faction } from '../src/world-faction';
import { Coordinates, Area, Population, Biome, Climate as ClimateVO, Temperature } from '../src/world-geography';

describe('BusinessRules', () => {
  it('UniqueWorldNameRule passes for new name', () => {
    const rule = new UniqueWorldNameRule('Arda', new Set(['Middle Earth']));
    expect(rule.check()).toBeNull();
  });

  it('UniqueWorldNameRule fails for duplicate name', () => {
    const rule = new UniqueWorldNameRule('Arda', new Set(['arda']));
    expect(rule.check()).not.toBeNull();
  });

  it('RegionHierarchyRule passes for no parent', () => {
    const map = new WorldMap();
    const rule = new RegionHierarchyRule('region-1', undefined, map);
    expect(rule.check()).toBeNull();
  });

  it('RegionHierarchyRule fails for missing parent', () => {
    const map = new WorldMap();
    const rule = new RegionHierarchyRule('region-1', 'parent-1', map);
    expect(rule.check()).not.toBeNull();
  });

  it('RegionHierarchyRule passes for valid parent', () => {
    const region = new Region(
      'parent-1', 'Parent', [new Coordinates(0, 0), new Coordinates(10, 10)],
      new Area(100), new Biome('forest'), new ClimateVO('temperate'), new Population(1000),
    );
    const map = new WorldMap([region]);
    const rule = new RegionHierarchyRule('region-1', 'parent-1', map);
    expect(rule.check()).toBeNull();
  });

  it('PoliticalConsistencyRule passes for single faction', () => {
    const factions = new WorldFactions([]);
    const rule = new PoliticalConsistencyRule({ type: 'political', influence: 95 }, factions);
    expect(rule.check()).toBeNull();
  });

  it('PoliticalConsistencyRule warns for multiple influential same-type factions', () => {
    const factions = new WorldFactions([
      new Faction('f-1', 'Faction One', 'Desc', 'political', 95),
    ]);
    const rule = new PoliticalConsistencyRule({ type: 'political', influence: 95 }, factions);
    expect(rule.check()).not.toBeNull();
  });

  it('ClimateConstraintRule passes for matching biome/temp', () => {
    const rule = new ClimateConstraintRule('forest', 'temperate', 15);
    expect(rule.check()).toBeNull();
  });

  it('ClimateConstraintRule warns for frozen biome with high temp', () => {
    const rule = new ClimateConstraintRule('tundra', 'cold', 20);
    expect(rule.check()).not.toBeNull();
  });

  it('ClimateConstraintRule warns for desert biome with low temp', () => {
    const rule = new ClimateConstraintRule('desert', 'arid', 10);
    expect(rule.check()).not.toBeNull();
  });

  it('CalendarConsistencyRule passes for valid calendar', () => {
    const rule = new CalendarConsistencyRule([{ name: 'Jan', days: 31 }], 7);
    expect(rule.check()).toBeNull();
  });

  it('CalendarConsistencyRule fails for month with 0 days', () => {
    const rule = new CalendarConsistencyRule([{ name: 'Jan', days: 0 }], 7);
    expect(rule.check()).not.toBeNull();
  });

  it('assertUniqueWorldName throws BusinessRuleError', () => {
    expect(() => assertUniqueWorldName('Arda', new Set(['arda']))).toThrow(BusinessRuleError);
  });

  it('assertUniqueWorldName does not throw for unique name', () => {
    expect(() => assertUniqueWorldName('Arda', new Set([]))).not.toThrow();
  });
});
