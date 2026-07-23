import type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from '@storynaram/domain-kernel';
import { WorldAggregate } from './world-aggregate.js';
import { WorldCreatedEvent, RegionAddedEvent } from './world-events.js';

export interface WorldRuntimeIntegrations {
  repository?: RepositoryRuntimeContract;
  workflow?: WorkflowRuntimeContract;
  validation?: ValidationRuntimeContract;
  ai?: AIRuntimeContract;
  search?: SearchProviderContract;
  storage?: StorageProviderContract;
}

export async function indexWorldForSearch(world: WorldAggregate, search: SearchProviderContract): Promise<void> {
  await search.index('worlds', world.identity.value, {
    id: world.identity.value,
    name: world.profile.name.value,
    genre: world.profile.genre,
    tone: world.profile.tone,
    description: world.profile.description.value.substring(0, 500),
    regionCount: world.map.count,
    factionCount: world.factions.count,
    cultureCount: world.cultures.count,
    tags: [
      world.profile.genre,
      world.profile.tone,
      ...world.factions.all.map(f => f.name),
    ],
  });
}

export async function triggerWorldWorkflow(world: WorldAggregate, workflow: WorkflowRuntimeContract): Promise<void> {
  await workflow.triggerEvent('world.created', {
    worldId: world.identity.value,
    name: world.profile.name.value,
  });
}

export async function handleWorldCreatedIntegration(
  event: WorldCreatedEvent,
  integrations: WorldRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('world.created', event.payload);
  }
}

export async function handleRegionAddedIntegration(
  event: RegionAddedEvent,
  integrations: WorldRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('world.region.added', event.payload);
  }
}
