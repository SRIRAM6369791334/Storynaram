import { DomainService, Specification } from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate.js';
import { StoryIdentity } from './story-identity.js';
import { StoryRepositoryContract } from './story-repository.js';
import { PublishedSpec, DraftSpec, CompletedSpec } from './story-specifications.js';

export class StoryDomainService extends DomainService {
  constructor(
    private readonly repository: StoryRepositoryContract,
  ) {
    super('StoryDomainService');
  }

  async analyzeContinuity(storyId: string): Promise<string[]> {
    const identity = new StoryIdentity(storyId);
    const story = await this.repository.findByIdentity(identity);
    if (!story) return ['Story not found'];
    const issues: string[] = [];
    const allForeshadows = story.foreshadows.all;
    const unpaid = allForeshadows.filter(f => !f.payoff.isPaidOff);
    if (unpaid.length > 0) {
      issues.push(`${unpaid.length} foreshadow(s) have not been paid off`);
    }
    return issues;
  }

  async analyzeConflictResolution(storyId: string): Promise<string[]> {
    const identity = new StoryIdentity(storyId);
    const story = await this.repository.findByIdentity(identity);
    if (!story) return ['Story not found'];
    const active = story.conflicts.active();
    if (active.length > 0) {
      return [`${active.length} conflict(s) remain unresolved`];
    }
    return [];
  }

  async analyzeArcCompletion(storyId: string): Promise<string[]> {
    const identity = new StoryIdentity(storyId);
    const story = await this.repository.findByIdentity(identity);
    if (!story) return ['Story not found'];
    const incomplete = story.arcs.all.filter(a => a.stage !== 'completed');
    if (incomplete.length > 0) {
      return [`${incomplete.length} arc(s) have not been completed`];
    }
    return [];
  }

  async findPublished(): Promise<StoryAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(n => new PublishedSpec().isSatisfiedBy(n));
  }

  async findDrafts(): Promise<StoryAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(n => new DraftSpec().isSatisfiedBy(n));
  }

  async findCompleted(): Promise<StoryAggregate[]> {
    const all = await this.repository.findAll();
    return all.filter(n => new CompletedSpec().isSatisfiedBy(n));
  }
}
