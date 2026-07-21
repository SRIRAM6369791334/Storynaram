import { RepositoryContract } from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate';
import { StoryIdentity } from './story-identity';
import { StoryFormat } from './story-profile';
import { StoryPhase } from './story-state';

export interface StoryRepositoryContract extends RepositoryContract<StoryAggregate> {
  findByIdentity(identity: StoryIdentity): Promise<StoryAggregate | null>;

  findByTitle(title: string): Promise<StoryAggregate[]>;

  findByFormat(format: StoryFormat): Promise<StoryAggregate[]>;

  findByPhase(phase: StoryPhase): Promise<StoryAggregate[]>;

  findByCharacter(characterId: string): Promise<StoryAggregate[]>;

  findByTheme(category: string): Promise<StoryAggregate[]>;

  findByTimeline(timelineId: string): Promise<StoryAggregate[]>;

  findByCanon(canonId: string): Promise<StoryAggregate[]>;

  findByNarrative(narrativeId: string): Promise<StoryAggregate[]>;

  findByGenre(genre: string): Promise<StoryAggregate[]>;

  findByStatus(status: string): Promise<StoryAggregate[]>;

  search(query: string): Promise<StoryAggregate[]>;
}

export const STORY_REPOSITORY = Symbol('STORY_REPOSITORY');
