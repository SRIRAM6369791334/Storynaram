export { CharacterIdentity } from './character-identity.js';

export {
  CharacterProfile,
  CharacterName,
  CharacterAge,
  CharacterBirthDate,
  CharacterGender,
  CharacterSpecies,
  CharacterOccupation,
  CharacterRole,
  CharacterTitle,
} from './character-profile.js';
export type { CharacterProfileProps } from './character-profile.js';

export { CharacterAppearance } from './character-appearance.js';
export type { CharacterAppearanceProps } from './character-appearance.js';

export {
  CharacterPersonality,
  CharacterTraits,
  CharacterAlignment,
} from './character-personality.js';
export type { CharacterPersonalityProps } from './character-personality.js';

export { CharacterBiography } from './character-biography.js';
export type { BiographyEntry } from './character-biography.js';

export { CharacterSkills, CharacterSkill } from './character-skills.js';
export { CharacterAbilities } from './character-abilities.js';
export type { AbilityScores } from './character-abilities.js';

export {
  CharacterGoals,
  CharacterGoal,
  GoalType,
  GoalStatus,
} from './character-goals.js';

export {
  CharacterRelationships,
  CharacterRelationship,
  RelationshipType,
} from './character-relationships.js';

export {
  CharacterInventory,
  InventoryItem,
} from './character-inventory.js';

export {
  CharacterKnowledge,
  KnowledgeEntry,
  KnowledgeLevel,
} from './character-knowledge.js';

export { CharacterMemory, MemoryEntry } from './character-memory.js';

export { CharacterEmotion, PrimaryEmotion } from './character-emotion.js';

export { CharacterStatus, LifeStage, Consciousness } from './character-status.js';
export type { CharacterStatusProps } from './character-status.js';

export { CharacterStatistics } from './character-statistics.js';
export type { CharacterStatisticsProps } from './character-statistics.js';

export { CharacterAggregate } from './character-aggregate.js';

export { CharacterLifecycle } from './character-lifecycle.js';

export { CharacterFactory } from './character-factory.js';
export type {
  CreateCharacterProps,
  CreateCharacterProfileInput,
  CreateCharacterAppearanceInput,
  CreateCharacterPersonalityInput,
  CreateCharacterAbilitiesInput,
} from './character-factory.js';

export type { CharacterRepositoryContract } from './character-repository.js';
export { CHARACTER_REPOSITORY } from './character-repository.js';

export { CharacterDomainService } from './character-domain-service.js';

export {
  AliveSpecification,
  DeadSpecification,
  PlayableSpecification,
  NPCSpecification,
  HeroSpecification,
  VillainSpecification,
  CompanionSpecification,
  EnemySpecification,
} from './character-specifications.js';

export {
  CharacterCreatedEvent,
  CharacterUpdatedEvent,
  CharacterDeletedEvent,
  CharacterRelationshipChangedEvent,
  CharacterSkillLearnedEvent,
  CharacterGoalCompletedEvent,
} from './character-events.js';

export {
  UniqueIdentityRule,
  AgeValidationRule,
  SpeciesConstraintRule,
  RelationshipRule,
  StatusTransitionRule,
  assertAgeValid,
  assertUniqueIdentity,
} from './business-rules.js';

export { CharacterDomainModule } from './character.module.js';

export type { CharacterRuntimeIntegrations } from './integration.js';
export {
  indexCharacterForSearch,
  triggerCharacterWorkflow,
  handleCharacterCreatedIntegration,
} from './integration.js';
