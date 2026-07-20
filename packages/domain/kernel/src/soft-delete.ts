import { Timestamp } from './timestamp';

export interface SoftDelete {
  deletedAt: Timestamp | null;

  isDeleted(): boolean;

  delete(): void;

  restore(): void;
}

export function applySoftDelete<T extends { deletedAt: Timestamp | null }>(target: T): void {
  target.deletedAt = Timestamp.now();
}

export function applyRestore<T extends { deletedAt: Timestamp | null }>(target: T): void {
  target.deletedAt = null;
}
