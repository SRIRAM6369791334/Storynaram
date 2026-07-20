import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginManifest } from './types';
import { PluginDependencyError } from './errors';

interface DependencyNode {
  id: PluginId;
  manifest: PluginManifest;
  requiredDeps: PluginId[];
  optionalDeps: PluginId[];
}

@Injectable()
export class PluginDependencyResolver {
  private readonly logger = new Logger(PluginDependencyResolver.name);

  resolve(manifests: PluginManifest[]): PluginManifest[] {
    const nodes = this.buildGraph(manifests);
    this.detectCycles(nodes);
    const resolved = this.topologicalSort(nodes, manifests);
    this.logger.log(`Resolved ${resolved.length} plugins in dependency order`);
    return resolved;
  }

  validateDependencies(manifest: PluginManifest, available: Map<PluginId, PluginManifest>): void {
    const requiredDeps = manifest.dependencies?.filter(d => !d.optional) ?? [];
    for (const dep of requiredDeps) {
      const availableManifest = available.get(dep.id);
      if (!availableManifest) {
        throw new PluginDependencyError(
          `Plugin "${manifest.id}" requires missing dependency "${dep.id}"`,
          manifest.id,
          dep.id,
        );
      }
      if (!this.isVersionCompatible(dep.version, availableManifest.version)) {
        throw new PluginDependencyError(
          `Plugin "${manifest.id}" requires "${dep.id}@${dep.version}" but found "${availableManifest.version}"`,
          manifest.id,
          dep.id,
        );
      }
    }
  }

  getMissingDependencies(manifest: PluginManifest, available: Map<PluginId, PluginManifest>): PluginId[] {
    const requiredDeps = manifest.dependencies?.filter(d => !d.optional) ?? [];
    const missing: PluginId[] = [];
    for (const dep of requiredDeps) {
      if (!available.has(dep.id)) {
        missing.push(dep.id);
      }
    }
    return missing;
  }

  private buildGraph(manifests: PluginManifest[]): Map<PluginId, DependencyNode> {
    const nodes = new Map<PluginId, DependencyNode>();
    for (const manifest of manifests) {
      nodes.set(manifest.id, {
        id: manifest.id,
        manifest,
        requiredDeps: manifest.dependencies?.filter(d => !d.optional).map(d => d.id) ?? [],
        optionalDeps: [
          ...(manifest.dependencies?.filter(d => d.optional).map(d => d.id) ?? []),
          ...(manifest.peerDependencies?.map(d => d.id) ?? []),
        ],
      });
    }
    return nodes;
  }

  private detectCycles(nodes: Map<PluginId, DependencyNode>): void {
    const visited = new Set<PluginId>();
    const recursionStack = new Set<PluginId>();

    const dfs = (id: PluginId): void => {
      visited.add(id);
      recursionStack.add(id);

      const node = nodes.get(id);
      if (node) {
        for (const depId of node.requiredDeps) {
          if (!nodes.has(depId)) continue;
          if (!visited.has(depId)) {
            dfs(depId);
          } else if (recursionStack.has(depId)) {
            throw new PluginDependencyError(
              `Circular dependency detected involving "${id}" and "${depId}"`,
              id,
              depId,
            );
          }
        }
      }

      recursionStack.delete(id);
    };

    for (const id of nodes.keys()) {
      if (!visited.has(id)) {
        dfs(id);
      }
    }
  }

  private topologicalSort(nodes: Map<PluginId, DependencyNode>, manifests: PluginManifest[]): PluginManifest[] {
    const sorted: PluginManifest[] = [];
    const visited = new Set<PluginId>();
    const inProgress = new Set<PluginId>();
    const manifestMap = new Map<PluginId, PluginManifest>();
    for (const m of manifests) {
      manifestMap.set(m.id, m);
    }

    const visit = (id: PluginId): void => {
      if (visited.has(id)) return;
      if (inProgress.has(id)) return;

      inProgress.add(id);
      const node = nodes.get(id);
      if (node) {
        for (const depId of node.requiredDeps) {
          if (nodes.has(depId)) {
            visit(depId);
          }
        }
      }
      inProgress.delete(id);
      visited.add(id);

      const manifest = manifestMap.get(id);
      if (manifest) {
        sorted.push(manifest);
      }
    };

    for (const id of nodes.keys()) {
      visit(id);
    }

    return sorted;
  }

  private isVersionCompatible(required?: string, actual?: string): boolean {
    if (!required || !actual) return true;
    const normalizedRequired = required.replace(/^[\^~>=<]/, '');
    const normalizedActual = actual.replace(/^[\^~>=<]/, '');
    const requiredParts = normalizedRequired.split('.').map(Number);
    const actualParts = normalizedActual.split('.').map(Number);
    for (let i = 0; i < Math.max(requiredParts.length, actualParts.length); i++) {
      const r = requiredParts[i] ?? 0;
      const a = actualParts[i] ?? 0;
      if (a > r) return true;
      if (a < r) return false;
    }
    return true;
  }
}
