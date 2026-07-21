import { CanonResolution } from './canon-resolution';

export type ConflictStatus = 'open' | 'resolved';

export class CanonConflict {
  constructor(
    public readonly conflictId: string,
    public readonly entryId: string,
    public readonly conflictingEntryId: string,
    public readonly key: string,
    public readonly description: string,
    public readonly status: ConflictStatus = 'open',
    public readonly detectedAt: Date = new Date(),
    public readonly resolution: CanonResolution | null = null,
  ) {
    if (conflictId.trim().length === 0) throw new Error('Conflict ID cannot be empty');
    if (entryId.trim().length === 0) throw new Error('Entry ID cannot be empty');
  }

  resolve(resolution: CanonResolution): CanonConflict {
    return new CanonConflict(
      this.conflictId,
      this.entryId,
      this.conflictingEntryId,
      this.key,
      this.description,
      'resolved',
      this.detectedAt,
      resolution,
    );
  }
}
