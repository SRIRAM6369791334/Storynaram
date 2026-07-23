import { Specification } from '@storynaram/domain-kernel';
import { CharacterAggregate } from './character-aggregate.js';

export class AliveSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    return candidate.status.isAlive;
  }
}

export class DeadSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    return candidate.status.isDead;
  }
}

export class PlayableSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    return candidate.status.isPlayable;
  }
}

export class NPCSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    return !candidate.status.isPlayable;
  }
}

export class HeroSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    const role = candidate.profile.role.value.toLowerCase();
    return role === 'hero' || role === 'protagonist' || role === 'main';
  }
}

export class VillainSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    const role = candidate.profile.role.value.toLowerCase();
    return role === 'villain' || role === 'antagonist' || role === 'enemy';
  }
}

export class CompanionSpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    const role = candidate.profile.role.value.toLowerCase();
    return role === 'companion' || role === 'follower' || role === 'sidekick';
  }
}

export class EnemySpecification extends Specification<CharacterAggregate> {
  isSatisfiedBy(candidate: CharacterAggregate): boolean {
    return candidate.relationships.all.some(r =>
      r.type === 'ENEMY' || r.type === 'RIVAL',
    );
  }
}
