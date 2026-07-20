import { Identity } from './identity';
import { Timestamp } from './timestamp';
import { DomainVersion } from './domain-version';
import { SoftDelete } from './soft-delete';

export abstract class Entity<TIdentity extends Identity = Identity> implements SoftDelete {
  public readonly identity: TIdentity;
  public version: DomainVersion;
  public readonly createdAt: Timestamp;
  public updatedAt: Timestamp;
  public deletedAt: Timestamp | null;

  constructor(identity: TIdentity) {
    this.identity = identity;
    this.version = DomainVersion.initial();
    this.createdAt = Timestamp.now();
    this.updatedAt = Timestamp.now();
    this.deletedAt = null;
  }

  equals(other: Entity<TIdentity>): boolean {
    if (other === null || other === undefined) return false;
    if (this.constructor !== other.constructor) return false;
    return this.identity.equals(other.identity);
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  delete(): void {
    this.deletedAt = Timestamp.now();
    this.markUpdated();
  }

  restore(): void {
    this.deletedAt = null;
    this.markUpdated();
  }

  protected markUpdated(): void {
    this.updatedAt = Timestamp.now();
    this.version = this.version.next();
  }

  toJSON(): Record<string, unknown> {
    return {
      identity: this.identity.toJSON(),
      version: this.version.toJSON(),
      createdAt: this.createdAt.toJSON(),
      updatedAt: this.updatedAt.toJSON(),
      deletedAt: this.deletedAt?.toJSON() ?? null,
    };
  }
}
