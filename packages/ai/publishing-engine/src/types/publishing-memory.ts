export class PublishingMemory {
  private rendered: Map<string, string> = new Map();
  private exported: Map<string, string> = new Map();
  private sharedContext: Map<string, unknown> = new Map();

  storeRendered(format: string, content: string): void {
    this.rendered.set(format, content);
  }

  getRendered(format: string): string | undefined {
    return this.rendered.get(format);
  }

  getAllRendered(): Map<string, string> {
    return new Map(this.rendered);
  }

  storeExported(format: string, content: string): void {
    this.exported.set(format, content);
  }

  getExported(format: string): string | undefined {
    return this.exported.get(format);
  }

  getAllExported(): Map<string, string> {
    return new Map(this.exported);
  }

  setShared(key: string, value: unknown): void {
    this.sharedContext.set(key, value);
  }

  getShared<T = unknown>(key: string): T | undefined {
    return this.sharedContext.get(key) as T | undefined;
  }

  clear(): void {
    this.rendered.clear();
    this.exported.clear();
    this.sharedContext.clear();
  }
}
