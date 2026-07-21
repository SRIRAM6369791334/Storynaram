import { RepositoryContract } from '@storynaram/domain-kernel';
import { NarrativeAggregate } from './narrative-aggregate';
import { NarrativeIdentity } from './narrative-identity';
import { NarrativeFormat } from './narrative-profile';
import { NarrativeStatusType } from './narrative-status';

export interface NarrativeRepositoryContract extends RepositoryContract<NarrativeAggregate> {
  findByIdentity(identity: NarrativeIdentity): Promise<NarrativeAggregate | null>;

  findByTitle(title: string): Promise<NarrativeAggregate[]>;

  findByFormat(format: NarrativeFormat): Promise<NarrativeAggregate[]>;

  findByStatus(status: NarrativeStatusType): Promise<NarrativeAggregate[]>;

  findByGenre(genre: string): Promise<NarrativeAggregate[]>;

  findByCharacter(characterId: string): Promise<NarrativeAggregate[]>;

  findByTimeline(timelineId: string): Promise<NarrativeAggregate[]>;

  findByCanon(canonId: string): Promise<NarrativeAggregate[]>;

  search(query: string): Promise<NarrativeAggregate[]>;
}

export const NARRATIVE_REPOSITORY = Symbol('NARRATIVE_REPOSITORY');
