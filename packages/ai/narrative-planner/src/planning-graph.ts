import { GraphTraversal, CycleDetection } from '@storynaram/platform';
import type { GraphNode, GraphEdge, CycleResult } from '@storynaram/platform';

export type PlanningStage =
  | 'idea-analysis'
  | 'character-planning'
  | 'world-planning'
  | 'timeline-planning'
  | 'canon-validation'
  | 'narrative-planning'
  | 'composition-planning'
  | 'consistency-validation'
  | 'prompt-assembly';

export interface StageDependency {
  stage: PlanningStage;
  dependsOn: PlanningStage[];
}

const DEFAULT_DEPENDENCIES: StageDependency[] = [
  { stage: 'idea-analysis', dependsOn: [] },
  { stage: 'character-planning', dependsOn: ['idea-analysis'] },
  { stage: 'world-planning', dependsOn: ['idea-analysis'] },
  { stage: 'timeline-planning', dependsOn: ['character-planning', 'world-planning'] },
  { stage: 'canon-validation', dependsOn: ['character-planning', 'world-planning', 'timeline-planning'] },
  { stage: 'narrative-planning', dependsOn: ['character-planning', 'world-planning', 'timeline-planning'] },
  { stage: 'composition-planning', dependsOn: ['narrative-planning', 'canon-validation'] },
  { stage: 'consistency-validation', dependsOn: ['composition-planning'] },
  { stage: 'prompt-assembly', dependsOn: ['consistency-validation'] },
];

export class PlanningGraph {
  private readonly dependencies: Map<PlanningStage, PlanningStage[]>;
  private readonly traversal = new GraphTraversal();
  private readonly cycleDetector = new CycleDetection();

  constructor(deps: StageDependency[] = DEFAULT_DEPENDENCIES) {
    this.dependencies = new Map();
    for (const dep of deps) {
      this.dependencies.set(dep.stage, dep.dependsOn);
      for (const d of dep.dependsOn) {
        if (!this.dependencies.has(d)) {
          this.dependencies.set(d, []);
        }
      }
    }
  }

  getDependencies(stage: PlanningStage): readonly PlanningStage[] {
    return this.dependencies.get(stage) ?? [];
  }

  getDependents(stage: PlanningStage): PlanningStage[] {
    const dependents: PlanningStage[] = [];
    for (const [s, deps] of this.dependencies) {
      if (deps.includes(stage)) {
        dependents.push(s);
      }
    }
    return dependents;
  }

  getRootStages(): PlanningStage[] {
    return Array.from(this.dependencies.entries())
      .filter(([, deps]) => deps.length === 0)
      .map(([stage]) => stage);
  }

  getAllStages(): PlanningStage[] {
    return Array.from(this.dependencies.keys());
  }

  getTopologicalOrder(): PlanningStage[] {
    const visited = new Set<PlanningStage>();
    const result: PlanningStage[] = [];

    const dfs = (stage: PlanningStage): void => {
      if (visited.has(stage)) return;
      visited.add(stage);
      const deps = this.dependencies.get(stage) ?? [];
      for (const dep of deps) {
        dfs(dep);
      }
      result.push(stage);
    };

    for (const stage of this.dependencies.keys()) {
      dfs(stage);
    }

    return result;
  }

  canRunInParallel(stageA: PlanningStage, stageB: PlanningStage): boolean {
    const depsA = this.dependencies.get(stageA) ?? [];
    const depsB = this.dependencies.get(stageB) ?? [];
    return (
      !depsA.includes(stageB) &&
      !depsB.includes(stageA) &&
      !this.isTransitiveDependency(stageA, stageB) &&
      !this.isTransitiveDependency(stageB, stageA)
    );
  }

  getParallelGroups(): PlanningStage[][] {
    const order = this.getTopologicalOrder();
    const groups: PlanningStage[][] = [];

    for (const stage of order) {
      let placed = false;
      for (const group of groups) {
        if (group.every(g => this.canRunInParallel(stage, g))) {
          group.push(stage);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups.push([stage]);
      }
    }

    return groups;
  }

  toGraphNodes(): GraphNode[] {
    return this.getAllStages().map(s => ({
      id: s,
      type: 'planning-stage',
      domain: 'narrative-planner',
      label: `Stage: ${s}`,
    }));
  }

  toGraphEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const [stage, deps] of this.dependencies) {
      for (const dep of deps) {
        edges.push({
          source: stage,
          target: dep,
          type: 'depends-on',
          label: `${stage} -> ${dep}`,
          weight: 1,
        });
      }
    }
    return edges;
  }

  detectCycles(): CycleResult {
    return this.cycleDetector.detect(this.toGraphEdges());
  }

  private isTransitiveDependency(from: PlanningStage, to: PlanningStage): boolean {
    const deps = this.dependencies.get(from) ?? [];
    for (const dep of deps) {
      if (dep === to || this.isTransitiveDependency(dep, to)) {
        return true;
      }
    }
    return false;
  }
}
