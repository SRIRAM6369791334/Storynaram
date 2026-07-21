import type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate';
import { StoryCreatedEvent, StoryPublishedEvent } from './story-events';

export interface StoryRuntimeIntegrations {
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
  narrative?: { getNarrativeTitle(id: string): Promise<string> };
}

export async function indexStoryForSearch(story: StoryAggregate, search: SearchProviderContract): Promise<void> {
  await search.index('stories', story.identity.value, {
    id: story.identity.value,
    title: story.profile.title,
    format: story.profile.format,
    status: story.state.phase,
    plotPoints: story.plot.points.count,
    arcs: story.arcs.count,
    conflicts: story.conflicts.count,
    themes: story.themes.count,
  });
}

export async function triggerStoryWorkflow(story: StoryAggregate, workflow: WorkflowRuntimeContract): Promise<void> {
  await workflow.triggerEvent('story.created', {
    storyId: story.identity.value,
    title: story.profile.title,
  });
}

export async function handleStoryCreatedIntegration(
  event: StoryCreatedEvent,
  integrations: StoryRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('story.created', event.payload);
  }
}

export async function handleStoryPublishedIntegration(
  event: StoryPublishedEvent,
  integrations: StoryRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('story.published', event.payload);
  }
}
