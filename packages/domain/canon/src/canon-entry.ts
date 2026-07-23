import { CanonFact, FactType } from './canon-fact.js';
import { CanonVersion } from './canon-version.js';
import { CanonConflict } from './canon-conflict.js';
import { CanonResolution } from './canon-resolution.js';
import { CanonReference } from './canon-reference.js';

export type EntryStatus = 'active' | 'deprecated' | 'conflicted' | 'draft' | 'published';

export class CanonEntry {
  private _versions: CanonVersion[];
  private _conflicts: CanonConflict[];

  constructor(
    public readonly entryId: string,
    public readonly factType: FactType,
    public readonly key: string,
    private _currentFact: CanonFact,
    versions: CanonVersion[] = [],
    conflicts: CanonConflict[] = [],
    private _status: EntryStatus = 'draft',
    public readonly createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    if (entryId.trim().length === 0) throw new Error('Entry ID cannot be empty');
    this._versions = [...versions];
    this._conflicts = [...conflicts];
  }

  get currentFact(): CanonFact { return this._currentFact; }
  get versions(): readonly CanonVersion[] { return [...this._versions]; }
  get conflicts(): readonly CanonConflict[] { return [...this._conflicts]; }
  get status(): EntryStatus { return this._status; }
  get updatedAt(): Date { return this._updatedAt; }
  get versionCount(): number { return this._versions.length + 1; }

  updateFact(fact: CanonFact, reason: string): void {
    const version = new CanonVersion(
      this._versions.length + 1,
      this._currentFact,
      new Date(),
      reason,
    );
    this._versions.push(version);
    this._currentFact = fact;
    this._updatedAt = new Date();
    this._status = 'active';
  }

  addConflict(conflict: CanonConflict): void {
    this._conflicts.push(conflict);
    this._status = 'conflicted';
    this._updatedAt = new Date();
  }

  resolveConflict(conflictId: string, resolution: CanonResolution): void {
    this._conflicts = this._conflicts.map(c =>
      c.conflictId === conflictId ? c.resolve(resolution) : c,
    );
    this._status = this._conflicts.some(c => c.status === 'open') ? 'conflicted' : 'active';
    this._updatedAt = new Date();
  }

  deprecate(): void {
    this._status = 'deprecated';
    this._updatedAt = new Date();
  }

  publish(): void {
    if (this._status === 'conflicted') throw new Error('Cannot publish entry with unresolved conflicts');
    this._status = 'published';
    this._updatedAt = new Date();
  }

  hasOpenConflicts(): boolean {
    return this._conflicts.some(c => c.status === 'open');
  }

  getLatestVersion(): CanonVersion | null {
    if (this._versions.length === 0) return null;
    return this._versions[this._versions.length - 1] ?? null;
  }

  toJSON(): Record<string, unknown> {
    return {
      entryId: this.entryId,
      factType: this.factType,
      key: this.key,
      currentFact: this._currentFact.toJSON(),
      versions: this._versions.map(v => v.toJSON()),
      conflicts: this._conflicts.map(c => ({
        conflictId: c.conflictId,
        entryId: c.entryId,
        conflictingEntryId: c.conflictingEntryId,
        key: c.key,
        description: c.description,
        status: c.status,
        detectedAt: c.detectedAt.toISOString(),
        resolution: c.resolution?.toJSON() ?? null,
      })),
      status: this._status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
