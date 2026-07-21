export interface GenerationRecord {
  chapterNumber: number;
  chapterTitle: string;
  prompt: string;
  optimizedPrompt: string;
  content: string;
  model: string;
  provider: string;
  latencyMs: number;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  qualityScore?: number;
  error?: string;
  timestamp: Date;
}

export class GenerationMemory {
  private records: GenerationRecord[] = [];
  private sharedContext: Map<string, unknown> = new Map();

  record(record: GenerationRecord): void {
    this.records.push(record);
  }

  getLastChapter(): GenerationRecord | undefined {
    return this.records[this.records.length - 1];
  }

  getChapter(index: number): GenerationRecord | undefined {
    return this.records[index];
  }

  getChapterCount(): number {
    return this.records.length;
  }

  getAllChapters(): GenerationRecord[] {
    return [...this.records];
  }

  getPreviousContent(chapterNumber: number): string {
    const prevChapters = this.records.filter(r => r.chapterNumber < chapterNumber);
    return prevChapters.map(r => r.content).join('\n\n');
  }

  setShared(key: string, value: unknown): void {
    this.sharedContext.set(key, value);
  }

  getShared<T = unknown>(key: string): T | undefined {
    return this.sharedContext.get(key) as T | undefined;
  }

  clear(): void {
    this.records = [];
    this.sharedContext.clear();
  }
}
