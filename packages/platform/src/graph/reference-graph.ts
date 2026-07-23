import { GraphTraversal, GraphNode, GraphEdge } from './graph-traversal.js';
import { CycleDetection, CycleResult } from './cycle-detection.js';

export interface ReferenceGraphEntry {
  sourceId: string;
  sourceDomain: string;
  sourceType: string;
  targetId: string;
  targetDomain: string;
  targetType: string;
  referenceType: string;
}

export class ReferenceGraph {
  private readonly entries: ReferenceGraphEntry[] = [];
  private readonly traversal = new GraphTraversal();
  private readonly cycleDetector = new CycleDetection();

  addEntry(entry: ReferenceGraphEntry): void {
    this.entries.push(entry);
  }

  addEntries(entries: ReferenceGraphEntry[]): void {
    this.entries.push(...entries);
  }

  getAllEntries(): readonly ReferenceGraphEntry[] {
    return [...this.entries];
  }

  getEntryCount(): number {
    return this.entries.length;
  }

  findReferencesTo(entityId: string): ReferenceGraphEntry[] {
    return this.entries.filter(e => e.targetId === entityId);
  }

  findReferencesFrom(entityId: string): ReferenceGraphEntry[] {
    return this.entries.filter(e => e.sourceId === entityId);
  }

  findReferencesBetween(sourceDomain: string, targetDomain: string): ReferenceGraphEntry[] {
    return this.entries.filter(
      e => e.sourceDomain === sourceDomain && e.targetDomain === targetDomain,
    );
  }

  toGraphNodes(): GraphNode[] {
    const nodeMap = new Map<string, GraphNode>();
    for (const entry of this.entries) {
      if (!nodeMap.has(entry.sourceId)) {
        nodeMap.set(entry.sourceId, {
          id: entry.sourceId, type: entry.sourceType,
          domain: entry.sourceDomain, label: `${entry.sourceDomain}:${entry.sourceId}`,
        });
      }
      if (!nodeMap.has(entry.targetId)) {
        nodeMap.set(entry.targetId, {
          id: entry.targetId, type: entry.targetType,
          domain: entry.targetDomain, label: `${entry.targetDomain}:${entry.targetId}`,
        });
      }
    }
    return Array.from(nodeMap.values());
  }

  toGraphEdges(): GraphEdge[] {
    return this.entries.map(e => ({
      source: e.sourceId,
      target: e.targetId,
      type: e.referenceType,
      label: e.referenceType,
      weight: 1,
    }));
  }

  detectCycles(): CycleResult {
    return this.cycleDetector.detect(this.toGraphEdges());
  }

  getTraversal(): GraphTraversal {
    return this.traversal;
  }

  getCycleDetector(): CycleDetection {
    return this.cycleDetector;
  }

  clear(): void {
    this.entries.length = 0;
  }
}
