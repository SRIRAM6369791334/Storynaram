import type {
  RepositoryRuntimeContract,
  WorkflowRuntimeContract,
  ValidationRuntimeContract,
  AIRuntimeContract,
  SearchProviderContract,
  StorageProviderContract,
} from '@storynaram/domain-kernel';
import { TimelineAggregate } from './timeline-aggregate.js';
import { TimelineCreatedEvent, TimelineEventAddedEvent } from './timeline-events.js';

export interface TimelineRuntimeIntegrations {
  repository?: RepositoryRuntimeContract;
  workflow?: WorkflowRuntimeContract;
  validation?: ValidationRuntimeContract;
  ai?: AIRuntimeContract;
  search?: SearchProviderContract;
  storage?: StorageProviderContract;
}

export async function indexTimelineForSearch(timeline: TimelineAggregate, search: SearchProviderContract): Promise<void> {
  await search.index('timelines', timeline.identity.value, {
    id: timeline.identity.value,
    name: timeline.name,
    description: timeline.description.substring(0, 500),
    eventCount: timeline.events.count,
    branchCount: timeline.branches.count,
    dateRange: timeline.statistics.dateRangeStart && timeline.statistics.dateRangeEnd
      ? `${timeline.statistics.dateRangeStart} to ${timeline.statistics.dateRangeEnd}` : '',
    tags: timeline.events.all.flatMap(e => e.tags).filter((v, i, a) => a.indexOf(v) === i),
  });
}

export async function triggerTimelineWorkflow(timeline: TimelineAggregate, workflow: WorkflowRuntimeContract): Promise<void> {
  await workflow.triggerEvent('timeline.created', {
    timelineId: timeline.identity.value,
    name: timeline.name,
  });
}

export async function handleTimelineCreatedIntegration(
  event: TimelineCreatedEvent,
  integrations: TimelineRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('timeline.created', event.payload);
  }
}

export async function handleTimelineEventAddedIntegration(
  event: TimelineEventAddedEvent,
  integrations: TimelineRuntimeIntegrations,
): Promise<void> {
  if (integrations.workflow) {
    await integrations.workflow.triggerEvent('timeline.event.added', event.payload);
  }
}
