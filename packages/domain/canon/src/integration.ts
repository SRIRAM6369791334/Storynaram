import type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from '@storynaram/domain-kernel';
import { CanonAggregate } from './canon-aggregate';
import { CanonCreatedEvent, ConflictDetectedEvent, CanonPublishedEvent } from './canon-events';

export interface CanonRuntimeIntegrations {
  repository?: RepositoryRuntimeContract;
  workflow?: WorkflowRuntimeContract;
  validation?: ValidationRuntimeContract;
  ai?: AIRuntimeContract;
  search?: SearchProviderContract;
  storage?: StorageProviderContract;
}

export async function indexCanonForSearch(canon: CanonAggregate, search: SearchProviderContract): Promise<void> {
  await search.index('canon', canon.identity.value, {
    id: canon.identity.value,
    name: canon.name,
    description: canon.description.substring(0, 500),
    entryCount: canon.entries.count,
    factTypes: Object.keys(canon.statistics.factTypeDistribution),
    isPublished: canon.isPublished,
  });
}

export async function triggerCanonWorkflow(canon: CanonAggregate, workflow: WorkflowRuntimeContract): Promise<void> {
  await workflow.triggerEvent('canon.created', {
    canonId: canon.identity.value,
    name: canon.name,
  });
}

export async function handleCanonCreatedIntegration(
  event: CanonCreatedEvent,
  integrations: CanonRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('canon.created', event.payload);
  }
}

export async function handleConflictDetectedIntegration(
  event: ConflictDetectedEvent,
  integrations: CanonRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('canon.conflict.detected', event.payload);
  }
}

export async function handleCanonPublishedIntegration(
  event: CanonPublishedEvent,
  integrations: CanonRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('canon.published', event.payload);
  }
  if (integrations.search) {
    // Re-index on publish
  }
}
