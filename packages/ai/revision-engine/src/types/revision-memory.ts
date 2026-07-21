export interface RevisionRecord {
  passName: string;
  chapterNumber: number;
  original: string;
  revised: string;
  changes: number;
  issues: string[];
  timestamp: Date;
}

export class RevisionMemory {
  private records: RevisionRecord[] = [];
  private sharedContext: Map<string, unknown> = new Map();
  private checkpoints: string[] = [];

  record(record: RevisionRecord): void {
    this.records.push(record);
  }

  getRecordsForPass(passName: string): RevisionRecord[] {
    return this.records.filter(r => r.passName === passName);
  }

  getRecordsForChapter(chapterNumber: number): RevisionRecord[] {
    return this.records.filter(r => r.chapterNumber === chapterNumber);
  }

  getAllRecords(): RevisionRecord[] {
    return [...this.records];
  }

  getTotalChanges(): number {
    return this.records.reduce((sum, r) => sum + r.changes, 0);
  }

  getTotalIssues(): string[] {
    const all: string[] = [];
    for (const r of this.records) {
      all.push(...r.issues);
    }
    return all;
  }

  setShared(key: string, value: unknown): void {
    this.sharedContext.set(key, value);
  }

  getShared<T = unknown>(key: string): T | undefined {
    return this.sharedContext.get(key) as T | undefined;
  }

  addCheckpoint(snapshot: string): void {
    this.checkpoints.push(snapshot);
  }

  getCheckpoint(index: number): string | undefined {
    return this.checkpoints[index];
  }

  getCheckpointCount(): number {
    return this.checkpoints.length;
  }

  clear(): void {
    this.records = [];
    this.sharedContext.clear();
    this.checkpoints = [];
  }
}
