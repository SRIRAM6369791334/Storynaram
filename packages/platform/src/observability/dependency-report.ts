import { DependencyGraph, DependencyLevel } from '../graph/dependency-graph';

export interface DependencyReportEntry {
  domain: string;
  dependsOn: string[];
  dependedBy: string[];
  level: number;
  hasCycles: boolean;
}

export interface DependencyReport {
  entries: DependencyReportEntry[];
  totalDomains: number;
  totalDependencies: number;
  hasCycles: boolean;
  topologicalLevels: number;
}

export class DependencyReportBuilder {
  build(graph: DependencyGraph): DependencyReport {
    const levels = graph.getTopologicalLevels();
    const levelMap = new Map<string, number>();
    for (const l of levels) {
      for (const domain of l.domains) {
        levelMap.set(domain, l.level);
      }
    }

    const cycleResult = graph.detectCycles();
    const entries: DependencyReportEntry[] = graph.getAllEntries().map(e => ({
      domain: e.domain,
      dependsOn: e.dependsOn,
      dependedBy: e.dependedBy,
      level: levelMap.get(e.domain) ?? -1,
      hasCycles: cycleResult.involvedNodes.includes(e.domain),
    }));

    const totalDependencies = entries.reduce((sum, e) => sum + e.dependsOn.length, 0);

    return {
      entries,
      totalDomains: entries.length,
      totalDependencies,
      hasCycles: cycleResult.hasCycle,
      topologicalLevels: levels.length,
    };
  }
}
