import { GraphTraversal, GraphNode, GraphEdge } from './graph-traversal.js';
import { CycleDetection, CycleResult } from './cycle-detection.js';
import { ReferenceGraph } from './reference-graph.js';
import { DependencyGraph } from './dependency-graph.js';
import { ImpactAnalysis } from './impact-analysis.js';

export interface PlatformGraphSummary {
  totalNodes: number;
  totalEdges: number;
  referenceCount: number;
  dependencyCount: number;
  hasCycles: boolean;
  domains: string[];
}

export class PlatformGraph {
  private readonly traversal = new GraphTraversal();
  private readonly cycleDetector = new CycleDetection();

  constructor(
    private readonly referenceGraph: ReferenceGraph,
    private readonly dependencyGraph: DependencyGraph,
    private readonly impactAnalysis: ImpactAnalysis,
  ) {}

  getReferenceGraph(): ReferenceGraph {
    return this.referenceGraph;
  }

  getDependencyGraph(): DependencyGraph {
    return this.dependencyGraph;
  }

  getImpactAnalysis(): ImpactAnalysis {
    return this.impactAnalysis;
  }

  getTraversal(): GraphTraversal {
    return this.traversal;
  }

  getCycleDetector(): CycleDetection {
    return this.cycleDetector;
  }

  getAllNodes(): GraphNode[] {
    return [
      ...this.referenceGraph.toGraphNodes(),
      ...this.dependencyGraph.toGraphNodes(),
    ];
  }

  getAllEdges(): GraphEdge[] {
    return [
      ...this.referenceGraph.toGraphEdges(),
      ...this.dependencyGraph.toGraphEdges(),
    ];
  }

  detectCycles(): CycleResult {
    const refCycles = this.referenceGraph.detectCycles();
    const depCycles = this.dependencyGraph.detectCycles();
    return {
      hasCycle: refCycles.hasCycle || depCycles.hasCycle,
      cycles: [...refCycles.cycles, ...depCycles.cycles],
      involvedNodes: [...new Set([...refCycles.involvedNodes, ...depCycles.involvedNodes])],
    };
  }

  getSummary(): PlatformGraphSummary {
    return {
      totalNodes: this.getAllNodes().length,
      totalEdges: this.getAllEdges().length,
      referenceCount: this.referenceGraph.getEntryCount(),
      dependencyCount: this.dependencyGraph.getDomainCount(),
      hasCycles: this.detectCycles().hasCycle,
      domains: this.dependencyGraph.getAllEntries().map(e => e.domain),
    };
  }
}
