import { Injectable } from '@nestjs/common';
import type { SchemaMeta, SchemaId } from './types';
import { CircularDependencyError } from './errors';
import { SchemaCacheService } from './schema-cache.service';
import { SchemaLoaderService } from './schema-loader.service';

@Injectable()
export class SchemaResolverService {
  constructor(
    private readonly cache: SchemaCacheService,
    private readonly loader: SchemaLoaderService,
  ) {}

  resolveDependencies(schemaId: SchemaId, allMetas: Map<SchemaId, SchemaMeta>): SchemaId[] {
    const resolved: SchemaId[] = [];
    const visit = new Set<SchemaId>();
    const stack = new Set<SchemaId>();

    const dfs = (current: SchemaId): void => {
      if (stack.has(current)) {
        throw new CircularDependencyError([...stack, current]);
      }
      if (visit.has(current)) return;
      
      const meta = allMetas.get(current);
      if (!meta) return;
      
      visit.add(current);
      stack.add(current);
      
      for (const dep of meta.dependencies) {
        // Find the actual schemaId for this dependency
        const depMeta = this.findTargetSchema(dep, allMetas);
        if (depMeta) {
          resolved.push(depMeta.$id);
          dfs(depMeta.$id);
        }
      }
      
      stack.delete(current);
    };

    dfs(schemaId);
    return resolved;
  }

  resolveAllDependencies(allMetas: Map<SchemaId, SchemaMeta>): void {
    for (const [, meta] of allMetas) {
      const resolved: SchemaId[] = [];
      const unresolved: string[] = [];

      for (const dep of meta.dependencies) {
        const target = this.findTargetSchema(dep, allMetas);
        if (target) {
          resolved.push(target.$id);
          target.dependents.push(meta.$id);
        } else {
          unresolved.push(dep);
        }
      }

      this.cache.setDependencies(meta.$id, resolved);
    }
  }

  getReverseDependencies(schemaId: SchemaId, allMetas: Map<SchemaId, SchemaMeta>): SchemaId[] {
    const deps: SchemaId[] = [];
    for (const [, meta] of allMetas) {
      const resolved = this.cache.getDependencies(meta.$id) ?? [];
      if (resolved.includes(schemaId)) {
        deps.push(meta.$id);
      }
    }
    return deps;
  }

  private findTargetSchema(refName: string, allMetas: Map<SchemaId, SchemaMeta>): SchemaMeta | undefined {
    // Try exact match first
    if (allMetas.has(refName as SchemaId)) {
      return allMetas.get(refName as SchemaId);
    }
    // Try matching by title (BaseIdentifier -> BaseIdentifier.schema.json)
    for (const [, meta] of allMetas) {
      const metaId = meta.$id.split('/').pop()?.replace('.schema.json', '');
      const refId = refName.replace('.schema.json', '').split('/').pop();
      if (metaId === refId) {
        return meta;
      }
    }
    return undefined;
  }
}
