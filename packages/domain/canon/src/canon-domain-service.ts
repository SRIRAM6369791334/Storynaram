import { DomainService, Specification } from '@storynaram/domain-kernel';
import { CanonAggregate } from './canon-aggregate.js';
import { CanonIdentity } from './canon-identity.js';
import { CanonEntry } from './canon-entry.js';
import { CanonRepositoryContract } from './canon-repository.js';
import { FactType } from './canon-fact.js';
import { CanonicalSpec, PublishedSpec, ConflictedSpec, DeprecatedSpec, DraftSpec } from './canon-specifications.js';

export class CanonDomainService extends DomainService {
  constructor(
    private readonly repository: CanonRepositoryContract,
  ) {
    super('CanonDomainService');
  }

  async findEntriesByKey(canonId: string, key: string): Promise<CanonEntry[]> {
    const identity = new CanonIdentity(canonId);
    const canon = await this.repository.findByIdentity(identity);
    if (!canon) return [];
    return canon.entriesByKey(key);
  }

  async findEntriesByType(canonId: string, factType: FactType): Promise<CanonEntry[]> {
    const identity = new CanonIdentity(canonId);
    const canon = await this.repository.findByIdentity(identity);
    if (!canon) return [];
    return canon.entriesOfType(factType);
  }

  async getConflictedEntries(canonId: string): Promise<CanonEntry[]> {
    const identity = new CanonIdentity(canonId);
    const canon = await this.repository.findByIdentity(identity);
    if (!canon) return [];
    return canon.getConflictedEntries();
  }

  async findCanonical(): Promise<CanonAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new CanonicalSpec();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findPublished(): Promise<CanonAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new PublishedSpec();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findConflicted(): Promise<CanonAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new ConflictedSpec();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findDeprecated(): Promise<CanonAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new DeprecatedSpec();
    return all.filter(c => spec.isSatisfiedBy(c));
  }

  async findDrafts(): Promise<CanonAggregate[]> {
    const all = await this.repository.findAll();
    const spec = new DraftSpec();
    return all.filter(c => spec.isSatisfiedBy(c));
  }
}
