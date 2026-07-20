export class DomainMetadata {
  private readonly data = new Map<string, unknown>();

  constructor(initial?: Record<string, unknown>) {
    if (initial) {
      for (const [key, value] of Object.entries(initial)) {
        this.data.set(key, value);
      }
    }
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  delete(key: string): boolean {
    return this.data.delete(key);
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of this.data) {
      result[key] = value;
    }
    return result;
  }

  static fromJSON(data: Record<string, unknown>): DomainMetadata {
    return new DomainMetadata(data);
  }
}
