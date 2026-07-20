import { Injectable, Logger } from '@nestjs/common';
import type { RelationshipType, RelationshipConfig } from './types';

@Injectable()
export class RelationshipRegistry {
  private readonly logger = new Logger(RelationshipRegistry.name);
  private readonly configs = new Map<RelationshipType, RelationshipConfig>();

  registerConfig(config: RelationshipConfig): void {
    this.configs.set(config.type, { ...config });
    this.logger.log(`Registered relationship config for type: ${config.type}`);
  }

  unregisterConfig(type: RelationshipType): boolean {
    const removed = this.configs.delete(type);
    if (removed) {
      this.logger.log(`Unregistered relationship config for type: ${type}`);
    }
    return removed;
  }

  getConfig(type: RelationshipType): RelationshipConfig | undefined {
    return this.configs.get(type);
  }

  hasConfig(type: RelationshipType): boolean {
    return this.configs.has(type);
  }

  listConfigs(): RelationshipConfig[] {
    return Array.from(this.configs.values()).map(c => ({ ...c }));
  }

  listTypes(): RelationshipType[] {
    return Array.from(this.configs.keys());
  }

  registerDefaultConfigs(): void {
    const defaults: RelationshipConfig[] = [
      { type: 'oneToOne', maxTargets: 1, allowCycles: false },
      { type: 'oneToMany', maxTargets: undefined, allowCycles: false },
      { type: 'manyToOne', maxTargets: undefined, allowCycles: false },
      { type: 'manyToMany', maxTargets: undefined, allowCycles: true },
      { type: 'directed', maxTargets: undefined, allowCycles: true },
      { type: 'bidirectional', maxTargets: undefined, allowCycles: false, bidirectional: true },
      { type: 'hierarchical', maxTargets: 1, allowCycles: false },
      { type: 'reference', maxTargets: undefined, allowCycles: true },
      { type: 'dependency', maxTargets: undefined, allowCycles: true },
      { type: 'ownership', maxTargets: undefined, allowCycles: false },
    ];
    for (const config of defaults) {
      if (!this.configs.has(config.type)) {
        this.configs.set(config.type, config);
      }
    }
    this.logger.log(`Registered ${String(defaults.length)} default relationship type configs`);
  }
}
