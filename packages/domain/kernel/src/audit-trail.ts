import { Timestamp } from './timestamp';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class AuditEntry {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly action: AuditAction,
    public readonly actor: string,
    public readonly timestamp: Timestamp,
    public readonly version: number,
    public readonly changes?: Record<string, unknown>,
  ) {}

  toJSON(): Record<string, unknown> {
    return {
      entityId: this.entityId,
      entityType: this.entityType,
      action: this.action,
      actor: this.actor,
      timestamp: this.timestamp.toJSON(),
      version: this.version,
      changes: this.changes,
    };
  }
}

export interface AuditStore {
  append(entry: AuditEntry): Promise<void>;
  findByEntityId(entityId: string): Promise<AuditEntry[]>;
  findByEntityType(entityType: string): Promise<AuditEntry[]>;
}

export class AuditTrail {
  private entries: AuditEntry[] = [];

  constructor(private readonly store?: AuditStore) {}

  record(entry: AuditEntry): void {
    this.entries.push(entry);
    this.store?.append(entry).catch(() => {});
  }

  getEntries(): readonly AuditEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
