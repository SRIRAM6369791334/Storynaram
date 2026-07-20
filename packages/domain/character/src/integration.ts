import type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from '@storynaram/domain-kernel';
import { CharacterAggregate } from './character-aggregate';
import { CharacterCreatedEvent, CharacterUpdatedEvent, CharacterDeletedEvent } from './character-events';

export interface CharacterRuntimeIntegrations {
  repository?: RepositoryRuntimeContract;
  workflow?: WorkflowRuntimeContract;
  validation?: ValidationRuntimeContract;
  ai?: AIRuntimeContract;
  search?: SearchProviderContract;
  storage?: StorageProviderContract;
}

export async function indexCharacterForSearch(character: CharacterAggregate, search: SearchProviderContract): Promise<void> {
  await search.index('characters', character.identity.value, {
    id: character.identity.value,
    name: character.profile.name.fullName,
    species: character.profile.species.value,
    role: character.profile.role.value,
    biography: character.biography.backstory.substring(0, 500),
    traits: character.personality.traits.values,
    tags: [
      character.profile.species.value,
      character.profile.role.value,
      ...character.personality.traits.values,
    ],
  });
}

export async function triggerCharacterWorkflow(character: CharacterAggregate, workflow: WorkflowRuntimeContract): Promise<void> {
  await workflow.triggerEvent('character.created', {
    characterId: character.identity.value,
    name: character.profile.name.fullName,
  });
}

export async function handleCharacterCreatedIntegration(
  event: CharacterCreatedEvent,
  integrations: CharacterRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('character.created', event.payload);
  }
}
