import { AggregateRoot, DomainSnapshot, Timestamp } from '@storynaram/domain-kernel';
import { WorldIdentity } from './world-identity';
import { WorldProfile, WorldName, WorldDescription } from './world-profile';
import { WorldGeography, Coordinates, Area, Population, Biome, Climate as ClimateVO, Temperature } from './world-geography';
import { WorldMap } from './world-map';
import { Calendar, TimeSystem } from './world-calendar';
import { WorldFactions, Faction, FactionType } from './world-faction';
import { WorldCultures, Culture, Currency, CurrencyCode } from './world-culture';
import { MagicSystem } from './world-magic-system';
import { TechnologyLevel } from './world-technology-level';
import { EconomicSystem } from './world-economy';
import { WorldNaturalResources, NaturalResource } from './world-economy';
import { WorldRules, WorldRule, RuleCategory } from './world-rule';
import { WorldHistory, WorldEvent } from './world-history';
import { WorldStatistics } from './world-statistics';
import { WorldSettlements, City, Village, Landmark } from './world-settlements';
import { Region } from './world-political';
import {
  WorldCreatedEvent,
  RegionAddedEvent,
  FactionCreatedEvent,
  MagicSystemChangedEvent,
  CultureUpdatedEvent,
  HistoryRecordedEvent,
  WorldDeletedEvent,
} from './world-events';

export class WorldAggregate extends AggregateRoot<WorldIdentity> {
  private _profile: WorldProfile;
  private _geography: WorldGeography;
  private _map: WorldMap;
  private _calendar: Calendar;
  private _timeSystem: TimeSystem;
  private _factions: WorldFactions;
  private _cultures: WorldCultures;
  private _magicSystem: MagicSystem;
  private _technologyLevel: TechnologyLevel;
  private _economicSystem: EconomicSystem;
  private _resources: WorldNaturalResources;
  private _rules: WorldRules;
  private _history: WorldHistory;
  private _statistics: WorldStatistics;

  constructor(identity: WorldIdentity) {
    super(identity);
    this._profile = new WorldProfile({
      name: new WorldName('Unnamed World'),
      description: new WorldDescription(''),
      genre: '',
      tone: '',
    });
    this._geography = new WorldGeography({
      totalArea: new Area(0),
      totalPopulation: new Population(0),
      terrain: '',
      primaryClimate: new ClimateVO('temperate'),
      primaryBiome: new Biome('mixed'),
    });
    this._map = new WorldMap();
    this._calendar = new Calendar(
      [{ name: 'January', days: 31 }],
      7,
      { year: 1, month: 1, day: 1 },
      'Common Era',
    );
    this._timeSystem = new TimeSystem(24, 60, 60, ['Monday']);
    this._factions = new WorldFactions();
    this._cultures = new WorldCultures();
    this._magicSystem = new MagicSystem('None', 'arcane', 0, 'No magic system defined', []);
    this._technologyLevel = new TechnologyLevel('medieval', 'Default technology', []);
    this._economicSystem = new EconomicSystem('traditional', 'Default economy', new Currency('default-currency', 'Default Coin', new CurrencyCode('DEF'), 'D'), []);
    this._resources = new WorldNaturalResources();
    this._rules = new WorldRules();
    this._history = new WorldHistory();
    this._statistics = new WorldStatistics();
  }

  get profile(): WorldProfile { return this._profile; }
  get geography(): WorldGeography { return this._geography; }
  get map(): WorldMap { return this._map; }
  get calendar(): Calendar { return this._calendar; }
  get timeSystem(): TimeSystem { return this._timeSystem; }
  get factions(): WorldFactions { return this._factions; }
  get cultures(): WorldCultures { return this._cultures; }
  get magicSystem(): MagicSystem { return this._magicSystem; }
  get technologyLevel(): TechnologyLevel { return this._technologyLevel; }
  get economicSystem(): EconomicSystem { return this._economicSystem; }
  get resources(): WorldNaturalResources { return this._resources; }
  get rules(): WorldRules { return this._rules; }
  get history(): WorldHistory { return this._history; }
  get statistics(): WorldStatistics { return this._statistics; }

  applyProfile(profile: WorldProfile): void {
    this._profile = profile;
    this.markUpdated();
  }

  applyGeography(geography: WorldGeography): void {
    this._geography = geography;
    this.markUpdated();
  }

  applyCalendar(calendar: Calendar): void {
    this._calendar = calendar;
    this.markUpdated();
  }

  applyTimeSystem(timeSystem: TimeSystem): void {
    this._timeSystem = timeSystem;
    this.markUpdated();
  }

  applyMagicSystem(magicSystem: MagicSystem): void {
    this._magicSystem = magicSystem;
    this.addDomainEvent(new MagicSystemChangedEvent(
      this.identity.value,
      { magicSystemName: magicSystem.name, magicType: magicSystem.type },
    ));
    this.markUpdated();
  }

  applyTechnologyLevel(technologyLevel: TechnologyLevel): void {
    this._technologyLevel = technologyLevel;
    this.markUpdated();
  }

  applyEconomicSystem(economicSystem: EconomicSystem): void {
    this._economicSystem = economicSystem;
    this.markUpdated();
  }

  applyStatistics(statistics: WorldStatistics): void {
    this._statistics = statistics;
    this.markUpdated();
  }

  initialize(profile: WorldProfile): void {
    this._profile = profile;
    this.addDomainEvent(new WorldCreatedEvent(
      this.identity.value,
      { name: profile.name.value, genre: profile.genre, tone: profile.tone },
    ));
    this.markUpdated();
  }

  addRegion(region: Region): void {
    this._map = this._map.add(region);
    this.addDomainEvent(new RegionAddedEvent(
      this.identity.value,
      { regionId: region.id, regionName: region.name },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  removeRegion(regionId: string): void {
    this._map = this._map.remove(regionId);
    this.markUpdated();
    this.refreshStatistics();
  }

  addCityToRegion(regionId: string, city: City): void {
    const region = this._map.get(regionId);
    if (!region) throw new Error(`Region not found: ${regionId}`);
    this.markUpdated();
  }

  addVillageToRegion(regionId: string, village: Village): void {
    const region = this._map.get(regionId);
    if (!region) throw new Error(`Region not found: ${regionId}`);
    this.markUpdated();
  }

  addLandmarkToRegion(regionId: string, landmark: Landmark): void {
    const region = this._map.get(regionId);
    if (!region) throw new Error(`Region not found: ${regionId}`);
    this.markUpdated();
  }

  addFaction(
    id: string,
    name: string,
    description: string,
    type: FactionType,
    influence: number,
    leaderId?: string,
  ): void {
    const faction = new Faction(id, name, description, type, influence, leaderId);
    this._factions = this._factions.add(faction);
    this.addDomainEvent(new FactionCreatedEvent(
      this.identity.value,
      { factionId: id, factionName: name, factionType: type },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  removeFaction(factionId: string): void {
    this._factions = this._factions.remove(factionId);
    this.markUpdated();
    this.refreshStatistics();
  }

  addCulture(culture: Culture): void {
    this._cultures = this._cultures.add(culture);
    this.addDomainEvent(new CultureUpdatedEvent(
      this.identity.value,
      { cultureId: culture.id, cultureName: culture.name },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  addRule(rule: WorldRule): void {
    this._rules = this._rules.add(rule);
    this.markUpdated();
  }

  addResource(resource: NaturalResource): void {
    this._resources = this._resources.add(resource);
    this.markUpdated();
  }

  recordEvent(event: WorldEvent): void {
    this._history = this._history.add(event);
    this.addDomainEvent(new HistoryRecordedEvent(
      this.identity.value,
      { eventId: event.id, eventTitle: event.title, significance: event.significance },
    ));
    this.markUpdated();
  }

  markDeleted(): void {
    this.addDomainEvent(new WorldDeletedEvent(
      this.identity.value,
      { name: this._profile.name?.value ?? 'unknown' },
    ));
    this.delete();
  }

  private refreshStatistics(): void {
    this._statistics = new WorldStatistics({
      regionCount: this._map.count,
      factionCount: this._factions.count,
      cultureCount: this._cultures.count,
    });
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      profile: this._profile.toJSON(),
      geography: this._geography.toJSON(),
      map: this._map.toJSON(),
      calendar: this._calendar.toJSON(),
      timeSystem: this._timeSystem.toJSON(),
      factions: this._factions.toJSON(),
      cultures: this._cultures.toJSON(),
      magicSystem: this._magicSystem.toJSON(),
      technologyLevel: this._technologyLevel.toJSON(),
      economicSystem: this._economicSystem.toJSON(),
      resources: this._resources.toJSON(),
      rules: this._rules.toJSON(),
      history: this._history.toJSON(),
      statistics: this._statistics.toJSON(),
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    const data = snapshot.data;
    this._profile = data.profile as WorldProfile;
    this._geography = data.geography as WorldGeography;
    this._map = data.map as WorldMap;
    this._calendar = data.calendar as Calendar;
    this._timeSystem = data.timeSystem as TimeSystem;
    this._factions = data.factions as WorldFactions;
    this._cultures = data.cultures as WorldCultures;
    this._magicSystem = data.magicSystem as MagicSystem;
    this._technologyLevel = data.technologyLevel as TechnologyLevel;
    this._economicSystem = data.economicSystem as EconomicSystem;
    this._resources = data.resources as WorldNaturalResources;
    this._rules = data.rules as WorldRules;
    this._history = data.history as WorldHistory;
    this._statistics = data.statistics as WorldStatistics;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      profile: this._profile.toJSON(),
      geography: this._geography.toJSON(),
      map: this._map.toJSON(),
      calendar: this._calendar.toJSON(),
      timeSystem: this._timeSystem.toJSON(),
      factions: this._factions.toJSON(),
      cultures: this._cultures.toJSON(),
      magicSystem: this._magicSystem.toJSON(),
      technologyLevel: this._technologyLevel.toJSON(),
      economicSystem: this._economicSystem.toJSON(),
      resources: this._resources.toJSON(),
      rules: this._rules.toJSON(),
      history: this._history.toJSON(),
      statistics: this._statistics.toJSON(),
    };
  }
}
