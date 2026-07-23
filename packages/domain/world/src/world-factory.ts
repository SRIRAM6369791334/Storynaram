import { Factory, FactoryError } from '@storynaram/domain-kernel';
import { WorldAggregate } from './world-aggregate.js';
import { WorldIdentity } from './world-identity.js';
import {
  WorldProfile,
  WorldName,
  WorldDescription,
} from './world-profile.js';
import {
  WorldGeography,
  Area,
  Population,
  Climate,
  Biome,
} from './world-geography.js';
import { Calendar, TimeSystem, MonthDefinition } from './world-calendar.js';
import { assertUniqueWorldName } from './business-rules.js';

export interface CreateWorldProfileInput {
  name: string;
  description: string;
  genre: string;
  tone: string;
}

export interface CreateWorldGeographyInput {
  totalArea: number;
  totalPopulation: number;
  terrain: string;
  primaryClimate: string;
  primaryBiome: string;
}

export interface CreateWorldCalendarInput {
  months: { name: string; days: number }[];
  daysInWeek: number;
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  era: string;
}

export interface CreateWorldTimeInput {
  hoursInDay?: number;
  minutesInHour?: number;
  secondsInMinute?: number;
  dayNames?: string[];
}

export interface CreateWorldProps {
  identity?: string;
  profile: CreateWorldProfileInput;
  geography?: CreateWorldGeographyInput;
  calendar?: CreateWorldCalendarInput;
  timeSystem?: CreateWorldTimeInput;
  existingWorldNames?: Set<string>;
}

export class WorldFactory extends Factory<WorldAggregate, CreateWorldProps> {
  create(props: CreateWorldProps): WorldAggregate {
    this.assertValid(props.profile.name.length > 0, 'World name is required');
    this.assertValid(props.profile.genre.length > 0, 'Genre is required');

    if (props.existingWorldNames) {
      assertUniqueWorldName(props.profile.name, props.existingWorldNames);
    }

    const identity = props.identity
      ? new WorldIdentity(props.identity)
      : WorldIdentity.create();

    const world = new WorldAggregate(identity);

    const profile = new WorldProfile({
      name: new WorldName(props.profile.name),
      description: new WorldDescription(props.profile.description),
      genre: props.profile.genre,
      tone: props.profile.tone,
    });

    world.applyProfile(profile);

    if (props.geography) {
      const geography = new WorldGeography({
        totalArea: new Area(props.geography.totalArea),
        totalPopulation: new Population(props.geography.totalPopulation),
        terrain: props.geography.terrain,
        primaryClimate: new Climate(props.geography.primaryClimate),
        primaryBiome: new Biome(props.geography.primaryBiome),
      });
      world.applyGeography(geography);
    }

    if (props.calendar) {
      const calendar = new Calendar(
        props.calendar.months,
        props.calendar.daysInWeek,
        { year: props.calendar.currentYear, month: props.calendar.currentMonth, day: props.calendar.currentDay },
        props.calendar.era,
      );
      world.applyCalendar(calendar);
    }

    if (props.timeSystem) {
      const timeSystem = new TimeSystem(
        props.timeSystem.hoursInDay ?? 24,
        props.timeSystem.minutesInHour ?? 60,
        props.timeSystem.secondsInMinute ?? 60,
        props.timeSystem.dayNames ?? ['Monday'],
      );
      world.applyTimeSystem(timeSystem);
    }

    world.initialize(profile);

    return world;
  }

  reconstitute(state: Record<string, unknown>): WorldAggregate {
    const identity = new WorldIdentity(state.identity as string);
    const world = new WorldAggregate(identity);

    const profileData = state.profile as Record<string, unknown>;
    const profile = new WorldProfile({
      name: new WorldName((profileData.name as Record<string, unknown>).value as string),
      description: new WorldDescription((profileData.description as Record<string, unknown>).value as string),
      genre: profileData.genre as string,
      tone: profileData.tone as string,
    });
    world.applyProfile(profile);

    return world;
  }
}
