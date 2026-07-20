export { CharacterIdentity } from './character-identity';

export {
  CharacterProfile,
  CharacterProfileProps,
  CharacterName,
  CharacterAge,
  CharacterBirthDate,
  CharacterGender,
  CharacterSpecies,
  CharacterOccupation,
  CharacterRole,
  CharacterTitle,
} from './character-profile';

export {
  CharacterAppearance,
  CharacterAppearanceProps,
} from './character-appearance';

export {
  CharacterPersonality,
  CharacterPersonalityProps,
  CharacterTraits,
  CharacterAlignment,
} from './character-personality';

export { CharacterBiography, BiographyEntry } from './character-biography';

export { CharacterSkills, CharacterSkill } from './character-skills';
export { CharacterAbilities, AbilityScores } from './character-abilities';

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

export { CharacterStatus, CharacterStatusProps, LifeStage, Consciousness } from './character-status';

export { CharacterStatistics, CharacterStatisticsProps } from './character-statistics';

export { CharacterAggregate } from './character-aggregate';

export { CharacterLifecycle } from './character-lifecycle';

export {
  CharacterFactory,
  CreateCharacterProps,
  CreateCharacterProfileInput,
  CreateCharacterAppearanceInput,
  CreateCharacterPersonalityInput,
  CreateCharacterAbilitiesInput,
} from './character-factory';

export { CharacterRepositoryContract, CHARACTER_REPOSITORY } from './character-repository';

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

export {
  CharacterRuntimeIntegrations,
  indexCharacterForSearch,
  triggerCharacterWorkflow,
  handleCharacterCreatedIntegration,
} from './integration';
