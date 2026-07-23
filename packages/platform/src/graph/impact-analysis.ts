import { GraphTraversal, GraphNode, GraphEdge } from './graph-traversal.js';
import { ReferenceGraph } from './reference-graph.js';
import { DependencyGraph } from './dependency-graph.js';

export interface ImpactResult {
  affectedNodeIds: string[];
  affectedDomains: string[];
  directImpacts: number;
  indirectImpacts: number;
  impactChain: string[][];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export class ImpactAnalysis {
  private readonly traversal = new GraphTraversal();

  constructor(
    private readonly referenceGraph: ReferenceGraph,
    private readonly dependencyGraph: DependencyGraph,
  ) {}

  analyzeChange(nodeId: string, maxDepth: number = 5): ImpactResult {
    const nodes = this.referenceGraph.toGraphNodes();
    const edges = this.referenceGraph.toGraphEdges();

    const reachable = this.traversal.findReachableNodes(nodes, edges, nodeId, maxDepth);
    const affectedNodeIds = Array.from(reachable.keys());

    const pathResults: string[][] = [];
    for (const affectedId of affectedNodeIds) {
      const paths = this.traversal.findPaths(nodes, edges, nodeId, affectedId, maxDepth);
      const firstPath = paths[0];
      if (firstPath) {
        pathResults.push(firstPath.map(n => n.id));
      }
    }

    const affectedDomains = [...new Set(
      affectedNodeIds
        .map(id => nodes.find(n => n.id === id))
        .filter((n): n is GraphNode => n !== undefined)
        .map(n => n.domain),
    )];

    const directImpacts = reachable.size > 0 ? Math.ceil(reachable.size * 0.3) : 0;
    const indirectImpacts = reachable.size - directImpacts;

    let severity: ImpactResult['severity'] = 'none';
    if (affectedDomains.length >= 4) severity = 'critical';
    else if (affectedDomains.length >= 3) severity = 'high';
    else if (affectedDomains.length >= 2) severity = 'medium';
    else if (affectedDomains.length >= 1) severity = 'low';

    return {
      affectedNodeIds,
      affectedDomains,
      directImpacts,
      indirectImpacts,
      impactChain: pathResults,
      severity,
    };
  }

  analyzeDomainChange(domain: string, maxDepth: number = 5): ImpactResult {
    const depEdges = this.dependencyGraph.toGraphEdges();
    const depNodes = this.dependencyGraph.toGraphNodes();

    const reachable = this.traversal.findReachableNodes(depNodes, depEdges, domain, maxDepth);
    const affectedDomains = Array.from(reachable.keys());

    let severity: ImpactResult['severity'] = 'none';
    if (affectedDomains.length >= 4) severity = 'critical';
    else if (affectedDomains.length >= 3) severity = 'high';
    else if (affectedDomains.length >= 2) severity = 'medium';
    else if (affectedDomains.length >= 1) severity = 'low';

    return {
      affectedNodeIds: affectedDomains,
      affectedDomains,
      directImpacts: affectedDomains.length,
      indirectImpacts: 0,
      impactChain: [],
      severity,
    };
  }

  getTraversal(): GraphTraversal {
    return this.traversal;
  }
}
