import { DomainService, DomainContext, Specification } from '@storynaram/domain-kernel';
import { CharacterAggregate } from './character-aggregate.js';
import { CharacterIdentity } from './character-identity.js';
import { CharacterRepositoryContract } from './character-repository.js';
import { AliveSpecification, DeadSpecification, PlayableSpecification } from './character-specifications.js';

export class CharacterDomainService extends DomainService {
  constructor(
    private readonly repository: CharacterRepositoryContract,
  ) {
    super('CharacterDomainService');
  }

  async findAliveCharacters(): Promise<CharacterAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new AliveSpecification();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findDeadCharacters(): Promise<CharacterAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new DeadSpecification();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findPlayableCharacters(): Promise<CharacterAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new PlayableSpecification();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findCharactersBySpecification(spec: Specification<CharacterAggregate>): Promise<CharacterAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async getRelationshipNetwork(characterId: CharacterIdentity): Promise<{
    character: CharacterAggregate | null;
    relationships: CharacterAggregate[];
  }> {
    const character = await this.repository.findByIdentity(characterId);
    if (!character) {
      return { character: null, relationships: [] };
    }

    const relatedCharacters: CharacterAggregate[] = [];
    for (const rel of character.relationships.all) {
      const targetId = new CharacterIdentity(rel.targetId);
      const target = await this.repository.findByIdentity(targetId);
      if (target) {
        relatedCharacters.push(target);
      }
    }

    return { character, relationships: relatedCharacters };
  }
}
