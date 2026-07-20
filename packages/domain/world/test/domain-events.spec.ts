import { describe, it, expect } from 'vitest';
import {
  WorldCreatedEvent,
  RegionAddedEvent,
  FactionCreatedEvent,
  MagicSystemChangedEvent,
  CultureUpdatedEvent,
  HistoryRecordedEvent,
  WorldDeletedEvent,
} from '../src/world-events';

describe('WorldCreatedEvent', () => {
  it('creates with payload', () => {
    const event = new WorldCreatedEvent('world-1', { name: 'Arda', genre: 'fantasy' });
    expect(event.eventType).toBe('world.created');
    expect(event.aggregateId).toBe('world-1');
    expect(event.payload.name).toBe('Arda');
  });
});

describe('RegionAddedEvent', () => {
  it('creates with region info', () => {
    const event = new RegionAddedEvent('world-1', { regionId: 'r-1', regionName: 'Mordor' });
    expect(event.eventType).toBe('world.region.added');
    expect(event.payload.regionName).toBe('Mordor');
  });
});

describe('FactionCreatedEvent', () => {
  it('creates with faction info', () => {
    const event = new FactionCreatedEvent('world-1', { factionId: 'f-1', factionName: 'Fellowship', factionType: 'political' });
    expect(event.eventType).toBe('world.faction.created');
    expect(event.payload.factionName).toBe('Fellowship');
  });
});

describe('MagicSystemChangedEvent', () => {
  it('creates with magic info', () => {
    const event = new MagicSystemChangedEvent('world-1', { magicSystemName: 'Arcane', magicType: 'arcane' });
    expect(event.eventType).toBe('world.magic.system.changed');
    expect(event.payload.magicSystemName).toBe('Arcane');
  });
});

describe('CultureUpdatedEvent', () => {
  it('creates with culture info', () => {
    const event = new CultureUpdatedEvent('world-1', { cultureId: 'c-1', cultureName: 'Elvish' });
    expect(event.eventType).toBe('world.culture.updated');
    expect(event.payload.cultureName).toBe('Elvish');
  });
});

describe('HistoryRecordedEvent', () => {
  it('creates with history info', () => {
    const event = new HistoryRecordedEvent('world-1', { eventId: 'e-1', eventTitle: 'Battle', significance: 90 });
    expect(event.eventType).toBe('world.history.recorded');
    expect(event.payload.significance).toBe(90);
  });
});

describe('WorldDeletedEvent', () => {
  it('creates with payload', () => {
    const event = new WorldDeletedEvent('world-1', { name: 'Arda' });
    expect(event.eventType).toBe('world.deleted');
    expect(event.aggregateId).toBe('world-1');
  });
});
