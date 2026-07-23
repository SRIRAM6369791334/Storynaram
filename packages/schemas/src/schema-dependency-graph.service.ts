import { Injectable } from '@nestjs/common';
import type { SchemaMeta, SchemaId } from './types.js';
import { CircularDependencyError } from './errors.js';

@Injectable()
export class SchemaDependencyGraphService {
  private readonly adjacency = new Map<SchemaId, Set<SchemaId>>();
  private readonly reverseAdjacency = new Map<SchemaId, Set<SchemaId>>();
  private readonly nodes = new Set<SchemaId>();

  build(metas: SchemaMeta[]): void {
    this.clear();
    const metaMap = new Map<SchemaId, SchemaMeta>();
    for (const meta of metas) {
      metaMap.set(meta.$id, meta);
      this.nodes.add(meta.$id);
    }

    for (const meta of metas) {
      const deps = this.resolveDependencyIds(meta, metaMap);
      for (const dep of deps) {
        this.addEdge(meta.$id, dep);
      }
    }
  }

  addEdge(from: SchemaId, to: SchemaId): void {
    let fromSet = this.adjacency.get(from);
    if (!fromSet) {
      fromSet = new Set();
      this.adjacency.set(from, fromSet);
    }
    let toSet = this.reverseAdjacency.get(to);
    if (!toSet) {
      toSet = new Set();
      this.reverseAdjacency.set(to, toSet);
    }
    fromSet.add(to);
    toSet.add(from);
    this.nodes.add(from);
    this.nodes.add(to);
  }

  getChildren(schemaId: SchemaId): SchemaId[] {
    return [...(this.adjacency.get(schemaId) ?? [])];
  }

  getParents(schemaId: SchemaId): SchemaId[] {
    return [...(this.reverseAdjacency.get(schemaId) ?? [])];
  }

  getAncestors(schemaId: SchemaId): SchemaId[] {
    const result: SchemaId[] = [];
    const visit = new Set<SchemaId>();
    const dfs = (id: SchemaId): void => {
      for (const parent of this.getParents(id)) {
        if (!visit.has(parent)) {
          visit.add(parent);
          result.push(parent);
          dfs(parent);
        }
      }
    };
    dfs(schemaId);
    return result;
  }

  getDescendants(schemaId: SchemaId): SchemaId[] {
    const result: SchemaId[] = [];
    const visit = new Set<SchemaId>();
    const dfs = (id: SchemaId): void => {
      for (const child of this.getChildren(id)) {
        if (!visit.has(child)) {
          visit.add(child);
          result.push(child);
          dfs(child);
        }
      }
    };
    dfs(schemaId);
    return result;
  }

  topologicalSort(): SchemaId[] {
    const visited = new Set<SchemaId>();
    const stack: SchemaId[] = [];
    const inProgress = new Set<SchemaId>();

    const dfs = (node: SchemaId): void => {
      if (inProgress.has(node)) {
        throw new CircularDependencyError([...inProgress, node]);
      }
      if (visited.has(node)) return;

      inProgress.add(node);
      for (const child of this.getChildren(node)) {
        dfs(child);
      }
      inProgress.delete(node);
      visited.add(node);
      stack.push(node);
    };

    for (const node of this.nodes) {
      if (!visited.has(node)) dfs(node);
    }

    return stack.reverse();
  }

  impactAnalysis(schemaId: SchemaId): { direct: SchemaId[]; transitive: SchemaId[]; all: SchemaId[] } {
    const direct = this.getParents(schemaId);
    const transitive = this.getAncestors(schemaId).filter(a => !direct.includes(a));
    return {
      direct,
      transitive,
      all: [...direct, ...transitive],
    };
  }

  hasCycles(): { hasCycles: boolean; cycles?: SchemaId[][] } {
    const cycles: SchemaId[][] = [];
    const visited = new Set<SchemaId>();
    const inStack = new Set<SchemaId>();
    const path: SchemaId[] = [];

    const dfs = (node: SchemaId): void => {
      if (inStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return;
      }
      if (visited.has(node)) return;

      visited.add(node);
      inStack.add(node);
      path.push(node);

      for (const child of this.getChildren(node)) {
        dfs(child);
      }

      path.pop();
      inStack.delete(node);
    };

    for (const node of this.nodes) dfs(node);

    return { hasCycles: cycles.length > 0, cycles: cycles.length > 0 ? cycles : undefined };
  }

  clear(): void {
    this.adjacency.clear();
    this.reverseAdjacency.clear();
    this.nodes.clear();
  }

  get size(): number {
    return this.nodes.size;
  }

  private resolveDependencyIds(meta: SchemaMeta, metaMap: Map<SchemaId, SchemaMeta>): SchemaId[] {
    const resolved: SchemaId[] = [];
    for (const dep of meta.dependencies) {
      const depName = dep.replace('.schema.json', '');
      for (const [, m] of metaMap) {
        const mName = m.$id.split('/').pop()?.replace('.schema.json', '') ?? '';
        if (mName === depName || m.$id === dep || m.title === depName) {
          resolved.push(m.$id);
          break;
        }
      }
    }
    return resolved;
  }
}
