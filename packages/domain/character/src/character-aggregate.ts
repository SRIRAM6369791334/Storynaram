import { AggregateRoot, DomainEvent, DomainSnapshot, Timestamp } from '@storynaram/domain-kernel';
import { CharacterIdentity } from './character-identity.js';
import { CharacterProfile } from './character-profile.js';
import { CharacterAppearance } from './character-appearance.js';
import { CharacterPersonality } from './character-personality.js';
import { CharacterBiography } from './character-biography.js';
import { CharacterSkills, CharacterSkill } from './character-skills.js';
import { CharacterAbilities } from './character-abilities.js';
import { CharacterGoals, CharacterGoal, GoalStatus } from './character-goals.js';
import { CharacterRelationships, CharacterRelationship, RelationshipType } from './character-relationships.js';
import { CharacterInventory, InventoryItem } from './character-inventory.js';
import { CharacterKnowledge, KnowledgeEntry } from './character-knowledge.js';
import { CharacterMemory, MemoryEntry } from './character-memory.js';
import { CharacterEmotion, PrimaryEmotion } from './character-emotion.js';
import { CharacterStatus } from './character-status.js';
import { CharacterStatistics } from './character-statistics.js';
import {
  CharacterCreatedEvent,
  CharacterUpdatedEvent,
  CharacterDeletedEvent,
  CharacterRelationshipChangedEvent,
  CharacterSkillLearnedEvent,
  CharacterGoalCompletedEvent,
} from './character-events.js';

export class CharacterAggregate extends AggregateRoot<CharacterIdentity> {
  private _profile: CharacterProfile;
  private _appearance: CharacterAppearance;
  private _personality: CharacterPersonality;
  private _biography: CharacterBiography;
  private _skills: CharacterSkills;
  private _abilities: CharacterAbilities;
  private _goals: CharacterGoals;
  private _relationships: CharacterRelationships;
  private _inventory: CharacterInventory;
  private _knowledge: CharacterKnowledge;
  private _memories: CharacterMemory;
  private _emotion: CharacterEmotion;
  private _status: CharacterStatus;
  private _statistics: CharacterStatistics;

  constructor(identity: CharacterIdentity) {
    super(identity);
    this._profile = new CharacterProfile({
      name: null as never,
      age: null as never,
      birthDate: null as never,
      gender: null as never,
      species: null as never,
      role: null as never,
    });
    this._appearance = new CharacterAppearance();
    this._personality = new CharacterPersonality();
    this._biography = new CharacterBiography();
    this._skills = new CharacterSkills();
    this._abilities = new CharacterAbilities();
    this._goals = new CharacterGoals();
    this._relationships = new CharacterRelationships();
    this._inventory = new CharacterInventory();
    this._knowledge = new CharacterKnowledge();
    this._memories = new CharacterMemory();
    this._emotion = new CharacterEmotion(PrimaryEmotion.JOY);
    this._status = new CharacterStatus();
    this._statistics = new CharacterStatistics();
  }

  get profile(): CharacterProfile { return this._profile; }
  get appearance(): CharacterAppearance { return this._appearance; }
  get personality(): CharacterPersonality { return this._personality; }
  get biography(): CharacterBiography { return this._biography; }
  get skills(): CharacterSkills { return this._skills; }
  get abilities(): CharacterAbilities { return this._abilities; }
  get goals(): CharacterGoals { return this._goals; }
  get relationships(): CharacterRelationships { return this._relationships; }
  get inventory(): CharacterInventory { return this._inventory; }
  get knowledge(): CharacterKnowledge { return this._knowledge; }
  get memories(): CharacterMemory { return this._memories; }
  get emotion(): CharacterEmotion { return this._emotion; }
  get status(): CharacterStatus { return this._status; }
  get statistics(): CharacterStatistics { return this._statistics; }

  override addDomainEvent(event: DomainEvent): void {
    super.addDomainEvent(event);
  }

  applyProfile(profile: CharacterProfile): void {
    this._profile = profile;
    this.markUpdated();
  }

  applyAppearance(appearance: CharacterAppearance): void {
    this._appearance = appearance;
    this.markUpdated();
  }

  applyPersonality(personality: CharacterPersonality): void {
    this._personality = personality;
    this.markUpdated();
  }

  applyBiography(biography: CharacterBiography): void {
    this._biography = biography;
    this.markUpdated();
  }

  applySkills(skills: CharacterSkills): void {
    this._skills = skills;
    this.markUpdated();
  }

  applyAbilities(abilities: CharacterAbilities): void {
    this._abilities = abilities;
    this.markUpdated();
  }

  applyGoals(goals: CharacterGoals): void {
    this._goals = goals;
    this.markUpdated();
  }

  applyRelationships(relationships: CharacterRelationships): void {
    this._relationships = relationships;
    this.markUpdated();
  }

  applyInventory(inventory: CharacterInventory): void {
    this._inventory = inventory;
    this.markUpdated();
  }

  applyKnowledge(knowledge: CharacterKnowledge): void {
    this._knowledge = knowledge;
    this.markUpdated();
  }

  applyMemories(memories: CharacterMemory): void {
    this._memories = memories;
    this.markUpdated();
  }

  applyEmotion(emotion: CharacterEmotion): void {
    this._emotion = emotion;
    this.markUpdated();
  }

  applyStatus(status: CharacterStatus): void {
    this._status = status;
    this.markUpdated();
  }

  applyStatistics(statistics: CharacterStatistics): void {
    this._statistics = statistics;
    this.markUpdated();
  }

  initialize(profile: CharacterProfile): void {
    this._profile = profile;
    this.addDomainEvent(new CharacterCreatedEvent(
      this.identity.value,
      { name: profile.name.fullName, species: profile.species.value, role: profile.role.value },
    ));
    this.markUpdated();
  }

  learnSkill(name: string, level: number = 1): void {
    const skillId = `skill-${crypto.randomUUID()}`;
    const skill = new CharacterSkill(skillId, name, level);
    this._skills = this._skills.add(skill);
    this.addDomainEvent(new CharacterSkillLearnedEvent(
      this.identity.value,
      { skillName: name, skillLevel: level },
    ));
    this.markUpdated();
  }

  addGoal(description: string, type: import('./character-goals').GoalType, deadline?: Timestamp): void {
    const goalId = `goal-${crypto.randomUUID()}`;
    const goal = new CharacterGoal(goalId, description, type, GoalStatus.ACTIVE, deadline);
    this._goals = this._goals.add(goal);
    this.markUpdated();
  }

  completeGoal(goalId: string): void {
    const goal = this._goals.get(goalId);
    if (goal && goal.status !== GoalStatus.COMPLETED) {
      this._goals = this._goals.complete(goalId);
      this.addDomainEvent(new CharacterGoalCompletedEvent(
        this.identity.value,
        { goalId, goalDescription: goal.description },
      ));
      this.markUpdated();
    }
  }

  addRelationship(targetId: string, targetName: string, type: RelationshipType): void {
    const relId = `rel-${crypto.randomUUID()}`;
    const rel = new CharacterRelationship(relId, targetId, targetName, type);
    const previousType = this._relationships.all.find(r => r.targetId === targetId)?.type;
    this._relationships = this._relationships.add(rel);
    if (previousType && previousType !== type) {
      this.addDomainEvent(new CharacterRelationshipChangedEvent(
        this.identity.value,
        { targetId, previousType, newType: type },
      ));
    }
    this.markUpdated();
  }

  removeRelationship(relationshipId: string): void {
    this._relationships = this._relationships.remove(relationshipId);
    this.markUpdated();
  }

  addInventoryItem(name: string, description: string, quantity: number = 1): void {
    const itemId = `item-${crypto.randomUUID()}`;
    const item = new InventoryItem(itemId, name, description, quantity);
    this._inventory = this._inventory.add(item);
    this.markUpdated();
  }

  addKnowledge(topic: string, source?: string): void {
    const entryId = `knowledge-${crypto.randomUUID()}`;
    const entry = new KnowledgeEntry(entryId, topic, undefined, source);
    this._knowledge = this._knowledge.add(entry);
    this.markUpdated();
  }

  addMemory(title: string, description: string, emotionalWeight: number = 0, isSignificant: boolean = false): void {
    const memoryId = `mem-${crypto.randomUUID()}`;
    const memory = new MemoryEntry(memoryId, title, description, emotionalWeight, Timestamp.now(), isSignificant);
    this._memories = this._memories.add(memory);
    this.markUpdated();
  }

  markDeleted(): void {
    const charName = this._profile.name?.fullName ?? 'unknown';
    this.addDomainEvent(new CharacterDeletedEvent(
      this.identity.value,
      { name: charName },
    ));
    this.delete();
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      profile: this._profile.toJSON(),
      appearance: this._appearance.toJSON(),
      personality: this._personality.toJSON(),
      biography: this._biography.toJSON(),
      skills: this._skills.toJSON(),
      abilities: this._abilities.toJSON(),
      goals: this._goals.toJSON(),
      relationships: this._relationships.toJSON(),
      inventory: this._inventory.toJSON(),
      knowledge: this._knowledge.toJSON(),
      memories: this._memories.toJSON(),
      emotion: this._emotion.toJSON(),
      status: this._status.toJSON(),
      statistics: this._statistics.toJSON(),
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    const data = snapshot.data;
    this._profile = data.profile as CharacterProfile;
    this._appearance = data.appearance as CharacterAppearance;
    this._personality = data.personality as CharacterPersonality;
    this._biography = data.biography as CharacterBiography;
    this._skills = data.skills as CharacterSkills;
    this._abilities = data.abilities as CharacterAbilities;
    this._goals = data.goals as CharacterGoals;
    this._relationships = data.relationships as CharacterRelationships;
    this._inventory = data.inventory as CharacterInventory;
    this._knowledge = data.knowledge as CharacterKnowledge;
    this._memories = data.memories as CharacterMemory;
    this._emotion = data.emotion as CharacterEmotion;
    this._status = data.status as CharacterStatus;
    this._statistics = data.statistics as CharacterStatistics;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      profile: this._profile.toJSON(),
      appearance: this._appearance.toJSON(),
      personality: this._personality.toJSON(),
      biography: this._biography.toJSON(),
      skills: this._skills.toJSON(),
      abilities: this._abilities.toJSON(),
      goals: this._goals.toJSON(),
      relationships: this._relationships.toJSON(),
      inventory: this._inventory.toJSON(),
      knowledge: this._knowledge.toJSON(),
      memories: this._memories.toJSON(),
      emotion: this._emotion.toJSON(),
      status: this._status.toJSON(),
      statistics: this._statistics.toJSON(),
    };
  }
}
