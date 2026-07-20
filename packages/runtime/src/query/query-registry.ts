import { Injectable, Logger } from '@nestjs/common';
import type { NamedQuery, QueryOptions } from './types';

@Injectable()
export class QueryRegistry {
  private readonly logger = new Logger(QueryRegistry.name);
  private readonly queries = new Map<string, NamedQuery>();

  register(name: string, entityType: string, options: QueryOptions, description?: string): void {
    if (this.queries.has(name)) {
      this.logger.warn(`Query "${name}" already registered, overwriting`);
    }
    this.queries.set(name, { name, entityType, options, description });
    this.logger.log(`Registered named query: ${name} (${entityType})`);
  }

  unregister(name: string): boolean {
    const removed = this.queries.delete(name);
    if (removed) {
      this.logger.log(`Unregistered named query: ${name}`);
    }
    return removed;
  }

  get(name: string): NamedQuery | undefined {
    return this.queries.get(name);
  }

  has(name: string): boolean {
    return this.queries.has(name);
  }

  list(): NamedQuery[] {
    return Array.from(this.queries.values());
  }

  listNames(): string[] {
    return Array.from(this.queries.keys());
  }

  findByEntityType(entityType: string): NamedQuery[] {
    return Array.from(this.queries.values()).filter(q => q.entityType === entityType);
  }

  clear(): void {
    this.queries.clear();
  }
}
