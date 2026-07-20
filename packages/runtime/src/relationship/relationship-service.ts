import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { EntityCacheService } from '../entity-cache.service';
import { EntityEventService } from '../entity-event.service';
import { RuntimeConfig } from '../runtime-config';
import { RelationshipGraph } from './relationship-graph';
import { RelationshipTraversalService } from './relationship-traversal.service';
import { RelationshipQueryService } from './relationship-query.service';
import { RelationshipValidator } from './relationship-validator';
import type { RelationshipPort } from './relationship-port';
import type {
  RelationshipEdge,
  RelationshipNode,
  RelationshipType,
  CreateRelationshipInput,
  RelationshipFilter,
  RelationshipQuery,
  RelationshipSearchResult,
  PathResult,
  CycleResult,
  GraphStatistics,
  RelationshipConfig,
  RelationshipValidationResult,
  RelationshipDirection,
} from './types';
import {
  RelationshipNotFoundError,
  RelationshipValidationError,
} from './errors';

@Injectable()
export class RelationshipService implements RelationshipPort {
  private readonly logger = new Logger(RelationshipService.name);
  private readonly graph: RelationshipGraph;

  constructor(
    private readonly traversal: RelationshipTraversalService,
    private readonly queryService: RelationshipQueryService,
    private readonly validator: RelationshipValidator,
    private readonly cache?: EntityCacheService,
    private readonly events?: EntityEventService,
    private readonly config?: RuntimeConfig,
  ) {
    this.graph = traversal['graph'];
  }

  async connect(input: CreateRelationshipInput): Promise<RelationshipEdge> {
    const validation = await this.validator.validateAddEdge(input);
    if (!validation.valid) {
      throw new RelationshipValidationError(input.sourceId, validation.errors.join('; '));
    }

    const edge = this.graph.addEdge(
      input.sourceId,
      input.targetId,
      input.type,
      input.label,
      input.weight,
      input.metadata,
    );

    this.logger.log(`Created relationship: ${input.sourceId} --[${input.type}]--> ${input.targetId}`);

    if (this.config?.enableEvents !== false && this.events) {
      await this.events.emit('created', 'relationship', input.sourceId, edge as unknown as Record<string, unknown>);
    }

    this.cache?.invalidate('relationship:graph', '' as EntityId);

    return edge;
  }

  async disconnect(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): Promise<boolean> {
    const removed = this.graph.removeEdgeByEndpoints(sourceId, targetId, type);
    if (removed) {
      this.logger.log(`Removed relationship: ${sourceId} --[${type ?? '*'}]--> ${targetId}`);
      if (this.config?.enableEvents !== false && this.events) {
        await this.events.emit('deleted', 'relationship', sourceId, {
          sourceId,
          targetId,
          type,
        } as unknown as Record<string, unknown>);
      }
      this.cache?.invalidate('relationship:graph', '' as EntityId);
    }
    return removed;
  }

  async removeEdge(edgeId: string): Promise<boolean> {
    const edge = this.graph.getEdge(edgeId);
    if (!edge) return false;
    return this.disconnect(edge.sourceId, edge.targetId, edge.type);
  }

  async removeNode(entityId: EntityId): Promise<boolean> {
    const hadEdges = this.graph.getOutgoingEdges(entityId).length > 0
      || this.graph.getIncomingEdges(entityId).length > 0;
    const removed = this.graph.removeNode(entityId);
    if (removed && hadEdges && this.config?.enableEvents !== false && this.events) {
      await this.events.emit('deleted', 'graph', entityId, { entityId });
    }
    return removed;
  }

  getEdge(edgeId: string): RelationshipEdge | undefined {
    return this.graph.getEdge(edgeId);
  }

  getEdgeBetween(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): RelationshipEdge | undefined {
    return this.graph.getEdgeByEndpoints(sourceId, targetId, type);
  }

  getNode(entityId: EntityId): RelationshipNode | undefined {
    return this.graph.getNode(entityId);
  }

  hasNode(entityId: EntityId): boolean {
    return this.graph.hasNode(entityId);
  }

  hasEdge(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): boolean {
    return this.graph.hasEdge(sourceId, targetId, type);
  }

  getOutgoing(entityId: EntityId): RelationshipEdge[] {
    return this.graph.getOutgoingEdges(entityId);
  }

  getIncoming(entityId: EntityId): RelationshipEdge[] {
    return this.graph.getIncomingEdges(entityId);
  }

  getNeighbors(entityId: EntityId, direction: RelationshipDirection = 'both'): EntityId[] {
    return this.graph.getNeighbors(entityId, direction);
  }

  findRelations(filter: RelationshipFilter): RelationshipEdge[] {
    return this.queryService.findRelations(filter);
  }

  findIncoming(entityId: EntityId, type?: string): RelationshipEdge[] {
    return this.queryService.findIncoming(entityId, type);
  }

  findOutgoing(entityId: EntityId, type?: string): RelationshipEdge[] {
    return this.queryService.findOutgoing(entityId, type);
  }

  findByType(type: RelationshipType): RelationshipEdge[] {
    return this.queryService.findByType(type);
  }

  search(query: RelationshipQuery): RelationshipSearchResult {
    return this.queryService.search(query);
  }

  ancestors(entityId: EntityId, maxDepth?: number): RelationshipEdge[][] {
    return this.traversal.ancestors(entityId, maxDepth);
  }

  descendants(entityId: EntityId, maxDepth?: number): RelationshipEdge[][] {
    return this.traversal.descendants(entityId, maxDepth);
  }

  children(entityId: EntityId): RelationshipEdge[] {
    return this.traversal.children(entityId);
  }

  parents(entityId: EntityId): RelationshipEdge[] {
    return this.traversal.parents(entityId);
  }

  roots(): EntityId[] {
    return this.traversal.roots();
  }

  leaves(): EntityId[] {
    return this.traversal.leaves();
  }

  path(from: EntityId, to: EntityId): PathResult | undefined {
    return this.traversal.path(from, to);
  }

  shortestPath(from: EntityId, to: EntityId): PathResult | undefined {
    return this.traversal.shortestPath(from, to);
  }

  allPaths(from: EntityId, to: EntityId, maxDepth?: number): PathResult[] {
    return this.traversal.allPaths(from, to, maxDepth);
  }

  bfs(startId: EntityId, visit: (entityId: EntityId, depth: number) => void): void {
    this.traversal.bfs(startId, visit);
  }

  dfs(startId: EntityId, visit: (entityId: EntityId, depth: number) => void): void {
    this.traversal.dfs(startId, visit);
  }

  reachableNodes(startId: EntityId, maxDepth?: number): EntityId[] {
    return this.traversal.reachableNodes(startId, maxDepth);
  }

  detectCycles(): CycleResult {
    return this.traversal.detectCycles();
  }

  statistics(): GraphStatistics {
    return this.graph.statistics();
  }
}
