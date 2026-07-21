import type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from '@storynaram/domain-kernel';
import { NarrativeAggregate } from './narrative-aggregate';
import { NarrativeCreatedEvent, NarrativePublishedEvent } from './narrative-events';

export interface NarrativeRuntimeIntegrations {
  repository?: RepositoryRuntimeContract;
  workflow?: WorkflowRuntimeContract;
  validation?: ValidationRuntimeContract;
  ai?: AIRuntimeContract;
  search?: SearchProviderContract;
  storage?: StorageProviderContract;
  character?: { getCharacterName(id: string): Promise<string> };
  world?: { getWorldName(id: string): Promise<string> };
  timeline?: { getTimelineName(id: string): Promise<string> };
  canon?: { getCanonFact(key: string): Promise<unknown> };
}

export async function indexNarrativeForSearch(narrative: NarrativeAggregate, search: SearchProviderContract): Promise<void> {
  await search.index('narratives', narrative.identity.value, {
    id: narrative.identity.value,
    title: narrative.profile.title.value,
    format: narrative.profile.format,
    status: narrative.profile.status.value,
    chapterCount: narrative.chapters.count,
    sceneCount: narrative.scenes.count,
    wordCount: narrative.statistics.totalWordCount,
  });
}

export async function triggerNarrativeWorkflow(narrative: NarrativeAggregate, workflow: WorkflowRuntimeContract): Promise<void> {
  await workflow.triggerEvent('narrative.created', {
    narrativeId: narrative.identity.value,
    title: narrative.profile.title.value,
  });
}

export async function handleNarrativeCreatedIntegration(
  event: NarrativeCreatedEvent,
  integrations: NarrativeRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('narrative.created', event.payload);
  }
}

export async function handleNarrativePublishedIntegration(
  event: NarrativePublishedEvent,
  integrations: NarrativeRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('narrative.published', event.payload);
  }
}
