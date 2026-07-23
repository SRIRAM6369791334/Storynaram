import { AggregateRoot, DomainSnapshot } from '@storynaram/domain-kernel';
import { CanonIdentity } from './canon-identity.js';
import { CanonFact, FactType } from './canon-fact.js';
import { CanonReference } from './canon-reference.js';
import { CanonEntry } from './canon-entry.js';
import { CanonConflict } from './canon-conflict.js';
import { CanonResolution, ResolutionStrategy } from './canon-resolution.js';
import { CanonRule } from './canon-rule.js';
import { CanonCollection } from './canon-collection.js';
import { CanonStatistics } from './canon-statistics.js';
import {
  CanonCreatedEvent,
  FactAddedEvent,
  FactUpdatedEvent,
  ConflictDetectedEvent,
  ConflictResolvedEvent,
  CanonPublishedEvent,
} from './canon-events.js';
import {
  SingleCanonTruthRule,
  ConflictDetectionRule,
  ReferenceValidationRule,
  assertNoUnresolvedConflicts,
} from './business-rules.js';

export class CanonAggregate extends AggregateRoot<CanonIdentity> {
  private _name: string;
  private _description: string;
  private _entries: CanonCollection;
  private _rules: CanonRule[];
  private _statistics: CanonStatistics;
  private _isPublished: boolean;

  constructor(identity: CanonIdentity) {
    super(identity);
    this._name = '';
    this._description = '';
    this._entries = new CanonCollection();
    this._rules = [];
    this._statistics = new CanonStatistics();
    this._isPublished = false;
  }

  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get entries(): CanonCollection { return this._entries; }
  get rules(): readonly CanonRule[] { return [...this._rules]; }
  get statistics(): CanonStatistics { return this._statistics; }
  get isPublished(): boolean { return this._isPublished; }

  initialize(name: string, description: string = ''): void {
    this._name = name;
    this._description = description;
    this.addDomainEvent(new CanonCreatedEvent(
      this.identity.value,
      { name, description },
    ));
    this.markUpdated();
  }

  addEntry(
    entryId: string,
    factType: FactType,
    key: string,
    value: unknown,
    references: CanonReference[] = [],
    tags: string[] = [],
    confidence: number = 1,
  ): void {
    const existingByKey = this._entries.findByKey(key);

    const truthRule = new SingleCanonTruthRule(key, value, existingByKey, entryId);
    const truthViolation = truthRule.check();
    if (truthViolation) throw new Error(truthViolation.message);

    const refRule = new ReferenceValidationRule(references);
    const refViolation = refRule.check();
    if (refViolation) throw new Error(refViolation.message);

    const fact = new CanonFact(
      `fact-${entryId}`,
      factType,
      key,
      value,
      references,
      confidence,
      tags,
    );

    const entry = new CanonEntry(entryId, factType, key, fact);
    this._entries = this._entries.add(entry);

    this.addDomainEvent(new FactAddedEvent(
      this.identity.value,
      { entryId, factType, key },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  updateEntry(entryId: string, newValue: unknown, reason: string): void {
    const entry = this._entries.get(entryId);
    if (!entry) throw new Error(`Entry not found: ${entryId}`);

    const newFact = new CanonFact(
      `fact-${entryId}-v${entry.versionCount + 1}`,
      entry.factType,
      entry.key,
      newValue,
      entry.currentFact.references,
      entry.currentFact.confidence,
      entry.currentFact.tags,
    );

    entry.updateFact(newFact, reason);
    this._entries = this._entries.remove(entryId);
    this._entries = this._entries.add(entry);

    this.addDomainEvent(new FactUpdatedEvent(
      this.identity.value,
      { entryId, key: entry.key, version: entry.versionCount },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  deprecateEntry(entryId: string): void {
    const entry = this._entries.get(entryId);
    if (!entry) throw new Error(`Entry not found: ${entryId}`);

    entry.deprecate();
    this._entries = this._entries.remove(entryId);
    this._entries = this._entries.add(entry);
    this.markUpdated();
    this.refreshStatistics();
  }

  resolveConflict(
    conflictId: string,
    strategy: ResolutionStrategy,
    resolvedValue: unknown,
    reason: string,
    resolvedBy: string,
  ): void {
    for (const entry of this._entries.all) {
      const conflict = entry.conflicts.find(c => c.conflictId === conflictId);
      if (conflict) {
        const resolution = new CanonResolution(strategy, resolvedValue, reason, resolvedBy);
        entry.resolveConflict(conflictId, resolution);
        this._entries = this._entries.remove(entry.entryId);
        this._entries = this._entries.add(entry);

        this.addDomainEvent(new ConflictResolvedEvent(
          this.identity.value,
          { conflictId, entryId: entry.entryId, strategy },
        ));
        this.markUpdated();
        this.refreshStatistics();
        return;
      }
    }
    throw new Error(`Conflict not found: ${conflictId}`);
  }

  addRule(rule: CanonRule): void {
    this._rules.push(rule);
    this.markUpdated();
  }

  publish(): void {
    assertNoUnresolvedConflicts(this._entries);
    this._isPublished = true;
    for (const entry of this._entries.all) {
      entry.publish();
      this._entries = this._entries.remove(entry.entryId);
      this._entries = this._entries.add(entry);
    }
    this.addDomainEvent(new CanonPublishedEvent(
      this.identity.value,
      { name: this._name, entryCount: this._entries.count },
    ));
    this.markUpdated();
    this.refreshStatistics();
  }

  entriesOfType(factType: FactType): CanonEntry[] {
    return this._entries.ofType(factType);
  }

  entriesByKey(key: string): CanonEntry[] {
    return this._entries.findByKey(key);
  }

  getConflictedEntries(): CanonEntry[] {
    return this._entries.withOpenConflicts();
  }

  override createSnapshot(): DomainSnapshot {
    return super.createSnapshot();
  }

  private refreshStatistics(): void {
    const allEntries = this._entries.all;
    const active = allEntries.filter(e => e.status === 'active');
    const conflicted = allEntries.filter(e => e.status === 'conflicted');
    const deprecated = allEntries.filter(e => e.status === 'deprecated');
    const draft = allEntries.filter(e => e.status === 'draft');
    const published = allEntries.filter(e => e.status === 'published');
    const allConflicts = allEntries.flatMap(e => e.conflicts);
    const unresolved = allConflicts.filter(c => c.status === 'open');
    const distribution: Record<string, number> = {};
    for (const e of allEntries) {
      distribution[e.factType] = (distribution[e.factType] ?? 0) + 1;
    }

    this._statistics = new CanonStatistics({
      totalEntries: allEntries.length,
      activeEntries: active.length,
      conflictedEntries: conflicted.length,
      deprecatedEntries: deprecated.length,
      draftEntries: draft.length,
      publishedEntries: published.length,
      totalConflicts: allConflicts.length,
      unresolvedConflicts: unresolved.length,
      totalFacts: allEntries.reduce((sum, e) => sum + e.versionCount, 0),
      factTypeDistribution: distribution,
    });
  }

  protected toSnapshot(): Record<string, unknown> {
    return {
      name: this._name,
      description: this._description,
      entries: this._entries.toJSON(),
      rules: this._rules.map(r => r.toJSON()),
      statistics: this._statistics.toJSON(),
      isPublished: this._isPublished,
    };
  }

  protected applySnapshot(snapshot: DomainSnapshot): void {
    const data = snapshot.data;
    this._name = data.name as string;
    this._description = data.description as string;
    this._entries = data.entries as CanonCollection;
    this._rules = data.rules as CanonRule[];
    this._statistics = data.statistics as CanonStatistics;
    this._isPublished = data.isPublished as boolean;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      name: this._name,
      description: this._description,
      entries: this._entries.toJSON(),
      rules: this._rules.map(r => r.toJSON()),
      statistics: this._statistics.toJSON(),
      isPublished: this._isPublished,
    };
  }
}


