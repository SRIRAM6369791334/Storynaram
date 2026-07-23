import { GraphTraversal, GraphNode, GraphEdge } from './graph-traversal.js';
import { CycleDetection, CycleResult } from './cycle-detection.js';
import { ReferenceGraph } from './reference-graph.js';

export interface DependencyEntry {
  domain: string;
  dependsOn: string[];
  dependedBy: string[];
  entityCount: number;
  referenceCount: number;
}

export interface DependencyLevel {
  level: number;
  domains: string[];
}

export class DependencyGraph {
  private readonly traversal = new GraphTraversal();
  private readonly cycleDetector = new CycleDetection();
  private readonly dependencies = new Map<string, Set<string>>();

  addDependency(domain: string, dependsOn: string): void {
    if (domain === dependsOn) return;
    const deps = this.dependencies.get(domain) ?? new Set();
    deps.add(dependsOn);
    this.dependencies.set(domain, deps);
    if (!this.dependencies.has(dependsOn)) {
      this.dependencies.set(dependsOn, new Set());
    }
  }

  addDependencies(domain: string, dependsOn: string[]): void {
    for (const dep of dependsOn) {
      this.addDependency(domain, dep);
    }
  }

  getDependencies(domain: string): string[] {
    return Array.from(this.dependencies.get(domain) ?? []);
  }

  getDependents(domain: string): string[] {
    const dependents: string[] = [];
    for (const [d, deps] of this.dependencies) {
      if (deps.has(domain)) {
        dependents.push(d);
      }
    }
    return dependents;
  }

  getEntry(domain: string): DependencyEntry {
    const dependsOn = this.getDependencies(domain);
    const dependedBy = this.getDependents(domain);
    return {
      domain,
      dependsOn,
      dependedBy,
      entityCount: 0,
      referenceCount: 0,
    };
  }

  getAllEntries(): DependencyEntry[] {
    return Array.from(this.dependencies.keys()).map(d => this.getEntry(d));
  }

  getTopologicalLevels(): DependencyLevel[] {
    const levels: DependencyLevel[] = [];
    const visited = new Set<string>();
    const remaining = new Set(this.dependencies.keys());

    let level = 0;
    while (remaining.size > 0) {
      const currentLevel: string[] = [];
      for (const domain of remaining) {
        const deps = this.dependencies.get(domain) ?? new Set();
        if (Array.from(deps).every(d => visited.has(d) || !remaining.has(d))) {
          currentLevel.push(domain);
        }
      }
      if (currentLevel.length === 0) break;
      for (const d of currentLevel) {
        visited.add(d);
        remaining.delete(d);
      }
      levels.push({ level, domains: currentLevel });
      level++;
    }

    return levels;
  }

  detectCycles(): CycleResult {
    const edges: GraphEdge[] = [];
    for (const [domain, deps] of this.dependencies) {
      for (const dep of deps) {
        edges.push({
          source: domain, target: dep,
          type: 'depends-on', label: `${domain}->${dep}`, weight: 1,
        });
      }
    }
    return this.cycleDetector.detect(edges);
  }

  toGraphEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const [domain, deps] of this.dependencies) {
      for (const dep of deps) {
        edges.push({
          source: domain, target: dep,
          type: 'depends-on', label: `${domain} depends on ${dep}`, weight: 1,
        });
      }
    }
    return edges;
  }

  toGraphNodes(): GraphNode[] {
    return Array.from(this.dependencies.keys()).map(d => ({
      id: d, type: 'domain', domain: d,
      label: `Domain: ${d}`,
    }));
  }

  getTraversal(): GraphTraversal {
    return this.traversal;
  }

  getCycleDetector(): CycleDetection {
    return this.cycleDetector;
  }

  getDomainCount(): number {
    return this.dependencies.size;
  }
}
