import { CharacterAggregate } from './character-aggregate';
import { CharacterStatus, LifeStage, Consciousness } from './character-status';
import { CharacterStatistics } from './character-statistics';
import { CharacterUpdatedEvent } from './character-events';

export class CharacterLifecycle {
  initialize(character: CharacterAggregate): void {
    character.applyStatus(new CharacterStatus({
      isAlive: true,
      isPlayable: true,
      lifeStage: LifeStage.ADULT,
      consciousness: Consciousness.AWAKE,
    }));
  }

  kill(character: CharacterAggregate, reason?: string): void {
    const newStatus = character.status.kill();
    character.applyStatus(newStatus);
    character.addDomainEvent(new CharacterUpdatedEvent(
      character.identity.value,
      { action: 'killed', reason },
    ));
  }

  revive(character: CharacterAggregate): void {
    const newStatus = character.status.revive();
    character.applyStatus(newStatus);
    character.addDomainEvent(new CharacterUpdatedEvent(
      character.identity.value,
      { action: 'revived' },
    ));
  }

  age(character: CharacterAggregate): void {
    const stages = [LifeStage.CHILD, LifeStage.ADOLESCENT, LifeStage.ADULT, LifeStage.ELDERLY];
    const currentIdx = stages.indexOf(character.status.lifeStage);
    if (currentIdx < stages.length - 1) {
      const newStatus = character.status.setLifeStage(stages[currentIdx + 1]!);
      character.applyStatus(newStatus);
      character.addDomainEvent(new CharacterUpdatedEvent(
        character.identity.value,
        { action: 'aged', newStage: stages[currentIdx + 1]! },
      ));
    }
  }

  levelUp(character: CharacterAggregate): void {
    const newStats = character.statistics.addExperience(character.statistics.experienceToNextLevel);
    character.applyStatistics(newStats);
    character.addDomainEvent(new CharacterUpdatedEvent(
      character.identity.value,
      { action: 'leveledUp', newLevel: newStats.level },
    ));
  }

  addExperience(character: CharacterAggregate, amount: number): void {
    const newStats = character.statistics.addExperience(amount);
    character.applyStatistics(newStats);
    if (newStats.level > character.statistics.level) {
      character.addDomainEvent(new CharacterUpdatedEvent(
        character.identity.value,
        { action: 'leveledUp', newLevel: newStats.level },
      ));
    }
  }

  takeDamage(character: CharacterAggregate, amount: number): void {
    const newStats = character.statistics.takeDamage(amount);
    character.applyStatistics(newStats);

    if (newStats.health <= 0) {
      this.kill(character, 'health depleted');
    }
  }

  heal(character: CharacterAggregate, amount: number): void {
    const newStats = character.statistics.heal(amount);
    character.applyStatistics(newStats);
  }

  putToSleep(character: CharacterAggregate): void {
    const newStatus = character.status.setConsciousness(Consciousness.ASLEEP);
    character.applyStatus(newStatus);
  }

  wakeUp(character: CharacterAggregate): void {
    const newStatus = character.status.setConsciousness(Consciousness.AWAKE);
    character.applyStatus(newStatus);
  }
}
