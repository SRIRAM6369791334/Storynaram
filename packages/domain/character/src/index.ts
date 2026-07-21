export { CharacterIdentity } from './character-identity';

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
} from './character-profile';
export type { CharacterProfileProps } from './character-profile';

export { CharacterAppearance } from './character-appearance';
export type { CharacterAppearanceProps } from './character-appearance';

export {
  CharacterPersonality,
  CharacterTraits,
  CharacterAlignment,
} from './character-personality';
export type { CharacterPersonalityProps } from './character-personality';

export { CharacterBiography } from './character-biography';
export type { BiographyEntry } from './character-biography';

export { CharacterSkills, CharacterSkill } from './character-skills';
export { CharacterAbilities } from './character-abilities';
export type { AbilityScores } from './character-abilities';

export {
  CharacterGoals,
  CharacterGoal,
  GoalType,
  GoalStatus,
} from './character-goals';

export {
  CharacterRelationships,
  CharacterRelationship,
  RelationshipType,
} from './character-relationships';

export {
  CharacterInventory,
  InventoryItem,
} from './character-inventory';

export {
  CharacterKnowledge,
  KnowledgeEntry,
  KnowledgeLevel,
} from './character-knowledge';

export { CharacterMemory, MemoryEntry } from './character-memory';

export { CharacterEmotion, PrimaryEmotion } from './character-emotion';

export { CharacterStatus, LifeStage, Consciousness } from './character-status';
export type { CharacterStatusProps } from './character-status';

export { CharacterStatistics } from './character-statistics';
export type { CharacterStatisticsProps } from './character-statistics';

export { CharacterAggregate } from './character-aggregate';

export { CharacterLifecycle } from './character-lifecycle';

export { CharacterFactory } from './character-factory';
export type {
  CreateCharacterProps,
  CreateCharacterProfileInput,
  CreateCharacterAppearanceInput,
  CreateCharacterPersonalityInput,
  CreateCharacterAbilitiesInput,
} from './character-factory';

export type { CharacterRepositoryContract } from './character-repository';
export { CHARACTER_REPOSITORY } from './character-repository';

export { CharacterDomainService } from './character-domain-service';

export {
  AliveSpecification,
  DeadSpecification,
  PlayableSpecification,
  NPCSpecification,
  HeroSpecification,
  VillainSpecification,
  CompanionSpecification,
  EnemySpecification,
} from './character-specifications';

export {
  CharacterCreatedEvent,
  CharacterUpdatedEvent,
  CharacterDeletedEvent,
  CharacterRelationshipChangedEvent,
  CharacterSkillLearnedEvent,
  CharacterGoalCompletedEvent,
} from './character-events';

export {
  UniqueIdentityRule,
  AgeValidationRule,
  SpeciesConstraintRule,
  RelationshipRule,
  StatusTransitionRule,
  assertAgeValid,
  assertUniqueIdentity,
} from './business-rules';

export { CharacterDomainModule } from './character.module';

export type { CharacterRuntimeIntegrations } from './integration';
export {
  indexCharacterForSearch,
  triggerCharacterWorkflow,
  handleCharacterCreatedIntegration,
} from './integration';
