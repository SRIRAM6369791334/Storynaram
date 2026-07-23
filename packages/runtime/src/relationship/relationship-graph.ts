import { Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type {
  RelationshipNode,
  RelationshipEdge,
  RelationshipType,
  RelationshipDirection,
  GraphStatistics,
} from './types.js';
import { RelationshipNotFoundError, RelationshipConflictError } from './errors.js';

export class RelationshipGraph {
  private readonly logger = new Logger(RelationshipGraph.name);
  private readonly nodes = new Map<string, RelationshipNode>();
  private readonly outgoing = new Map<string, Map<string, RelationshipEdge>>();
  private readonly incoming = new Map<string, Map<string, RelationshipEdge>>();
  private readonly edges = new Map<string, RelationshipEdge>();

  addNode(node: RelationshipNode): void {
    this.nodes.set(node.entityId, { ...node });
    this.outgoing.set(node.entityId, this.outgoing.get(node.entityId) ?? new Map());
    this.incoming.set(node.entityId, this.incoming.get(node.entityId) ?? new Map());
  }

  removeNode(entityId: EntityId): boolean {
    const existed = this.nodes.has(entityId);
    if (!existed) return false;

    const outEdges = this.outgoing.get(entityId);
    if (outEdges) {
      for (const [targetId, edge] of outEdges) {
        this.incoming.get(targetId)?.delete(entityId);
        this.edges.delete(edge.id);
      }
    }
    const inEdges = this.incoming.get(entityId);
    if (inEdges) {
      for (const [sourceId, edge] of inEdges) {
        this.outgoing.get(sourceId)?.delete(entityId);
        this.edges.delete(edge.id);
      }
    }

    this.nodes.delete(entityId);
    this.outgoing.delete(entityId);
    this.incoming.delete(entityId);
    this.logger.debug(`Removed node ${entityId}`);
    return true;
  }

  addEdge(
    sourceId: EntityId,
    targetId: EntityId,
    type: RelationshipType,
    label?: string,
    weight?: number,
    metadata?: Record<string, unknown>,
  ): RelationshipEdge {
    if (!this.nodes.has(sourceId)) {
      this.addNode({ entityId: sourceId, entityType: 'unknown' });
    }
    if (!this.nodes.has(targetId)) {
      this.addNode({ entityId: targetId, entityType: 'unknown' });
    }

    const existingOut = this.outgoing.get(sourceId)?.get(targetId);
    if (existingOut && existingOut.type === type) {
      throw new RelationshipConflictError(sourceId, targetId, `Edge of type ${type} already exists`);
    }

    const id = `${sourceId}:${targetId}:${type}:${label ?? 'default'}`;
    const now = new Date();
    const edge: RelationshipEdge = {
      id,
      sourceId,
      targetId,
      type,
      label,
      weight: weight ?? 1,
      metadata,
      createdAt: now,
      updatedAt: now,
    };

    let outMap = this.outgoing.get(sourceId);
    if (!outMap) {
      outMap = new Map();
      this.outgoing.set(sourceId, outMap);
    }
    outMap.set(targetId, edge);

    let inMap = this.incoming.get(targetId);
    if (!inMap) {
      inMap = new Map();
      this.incoming.set(targetId, inMap);
    }
    inMap.set(sourceId, edge);

    this.edges.set(id, edge);
    return { ...edge };
  }

  removeEdge(edgeId: string): boolean {
    const edge = this.edges.get(edgeId);
    if (!edge) return false;
    this.outgoing.get(edge.sourceId)?.delete(edge.targetId);
    this.incoming.get(edge.targetId)?.delete(edge.sourceId);
    this.edges.delete(edgeId);
    return true;
  }

  removeEdgeByEndpoints(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): boolean {
    const outMap = this.outgoing.get(sourceId);
    if (!outMap) return false;
    const edge = outMap.get(targetId);
    if (!edge) return false;
    if (type && edge.type !== type) return false;
    return this.removeEdge(edge.id);
  }

  getNode(entityId: EntityId): RelationshipNode | undefined {
    const node = this.nodes.get(entityId);
    return node ? { ...node } : undefined;
  }

  getEdge(edgeId: string): RelationshipEdge | undefined {
    const edge = this.edges.get(edgeId);
    return edge ? { ...edge } : undefined;
  }

  getEdgeByEndpoints(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): RelationshipEdge | undefined {
    const edge = this.outgoing.get(sourceId)?.get(targetId);
    if (!edge) return undefined;
    if (type && edge.type !== type) return undefined;
    return edge ? { ...edge } : undefined;
  }

  hasNode(entityId: EntityId): boolean {
    return this.nodes.has(entityId);
  }

  hasEdge(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): boolean {
    const edge = this.outgoing.get(sourceId)?.get(targetId);
    if (!edge) return false;
    if (type && edge.type !== type) return false;
    return true;
  }

  getOutgoingEdges(entityId: EntityId): RelationshipEdge[] {
    const map = this.outgoing.get(entityId);
    if (!map) return [];
    return Array.from(map.values()).map(e => ({ ...e }));
  }

  getIncomingEdges(entityId: EntityId): RelationshipEdge[] {
    const map = this.incoming.get(entityId);
    if (!map) return [];
    return Array.from(map.values()).map(e => ({ ...e }));
  }

  getOutgoingNeighbors(entityId: EntityId): EntityId[] {
    const edges = this.getOutgoingEdges(entityId);
    return edges.map(e => e.targetId);
  }

  getIncomingNeighbors(entityId: EntityId): EntityId[] {
    const edges = this.getIncomingEdges(entityId);
    return edges.map(e => e.sourceId);
  }

  getNeighbors(entityId: EntityId, direction: RelationshipDirection = 'both'): EntityId[] {
    const result = new Set<EntityId>();
    if (direction === 'outgoing' || direction === 'both') {
      for (const id of this.getOutgoingNeighbors(entityId)) {
        result.add(id);
      }
    }
    if (direction === 'incoming' || direction === 'both') {
      for (const id of this.getIncomingNeighbors(entityId)) {
        result.add(id);
      }
    }
    return Array.from(result);
  }

  getAllEdges(): RelationshipEdge[] {
    return Array.from(this.edges.values()).map(e => ({ ...e }));
  }

  getAllNodes(): RelationshipNode[] {
    return Array.from(this.nodes.values()).map(n => ({ ...n }));
  }

  get nodesSize(): number {
    return this.nodes.size;
  }

  get edgesSize(): number {
    return this.edges.size;
  }

  clear(): void {
    this.nodes.clear();
    this.outgoing.clear();
    this.incoming.clear();
    this.edges.clear();
  }

  statistics(): GraphStatistics {
    const typeCounts: Record<string, number> = {};
    for (const edge of this.edges.values()) {
      typeCounts[edge.type] = (typeCounts[edge.type] ?? 0) + 1;
    }
    const totalEdges = this.edges.size;
    const totalNodes = this.nodes.size;
    const avgOut = totalNodes > 0 ? totalEdges / totalNodes : 0;
    const avgIn = totalNodes > 0 ? totalEdges / totalNodes : 0;
    const maxPossible = totalNodes * (totalNodes - 1);
    const density = maxPossible > 0 ? totalEdges / maxPossible : 0;
    const componentCount = this.countComponents();

    return {
      totalNodes,
      totalEdges,
      totalRelationshipsByType: typeCounts,
      averageOutDegree: avgOut,
      averageInDegree: avgIn,
      density,
      componentCount,
    };
  }

  private countComponents(): number {
    const visited = new Set<string>();
    let count = 0;
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        count++;
        const stack: string[] = [nodeId];
        while (stack.length > 0) {
          const current = stack.pop()!;
          if (visited.has(current)) continue;
          visited.add(current);
          for (const neighbor of this.getNeighbors(current as EntityId)) {
            if (!visited.has(neighbor)) {
              stack.push(neighbor);
            }
          }
        }
      }
    }
    return count;
  }
}
