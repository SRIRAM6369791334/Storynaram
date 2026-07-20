import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { RepositoryRegistry } from '../repository/repository-registry';
import { RelationshipGraph } from './relationship-graph';
import type { RelationshipNode, RelationshipEdge } from './types';

export interface ResolvedRelationship<T extends { entityId: EntityId } = { entityId: EntityId }> {
  edge: RelationshipEdge;
  source?: T;
  target?: T;
}

@Injectable()
export class RelationshipResolver {
  private readonly logger = new Logger(RelationshipResolver.name);

  constructor(
    private readonly graph: RelationshipGraph,
    private readonly repositoryRegistry?: RepositoryRegistry,
  ) {}

  async resolveTarget<T extends { entityId: EntityId }>(edge: RelationshipEdge): Promise<T | undefined> {
    if (!this.repositoryRegistry) return undefined;
    try {
      const repo = this.repositoryRegistry.resolve<T>(this.getEntityType(edge.targetId));
      const result = await repo.findById(edge.targetId);
      return result.success ? result.data : undefined;
    } catch {
      return undefined;
    }
  }

  async resolveSource<T extends { entityId: EntityId }>(edge: RelationshipEdge): Promise<T | undefined> {
    if (!this.repositoryRegistry) return undefined;
    try {
      const repo = this.repositoryRegistry.resolve<T>(this.getEntityType(edge.sourceId));
      const result = await repo.findById(edge.sourceId);
      return result.success ? result.data : undefined;
    } catch {
      return undefined;
    }
  }

  async resolve<T extends { entityId: EntityId }>(edge: RelationshipEdge): Promise<ResolvedRelationship<T>> {
    const [source, target] = await Promise.all([
      this.resolveSource<T>(edge),
      this.resolveTarget<T>(edge),
    ]);
    return { edge, source, target };
  }

  async resolveEdges<T extends { entityId: EntityId }>(edges: RelationshipEdge[]): Promise<ResolvedRelationship<T>[]> {
    return Promise.all(edges.map(e => this.resolve<T>(e)));
  }

  addNodeFromEntity(entityId: EntityId, entityType: string, metadata?: Record<string, unknown>): void {
    const node: RelationshipNode = { entityId, entityType, metadata };
    this.graph.addNode(node);
  }

  private getEntityType(entityId: EntityId): string {
    const node = this.graph.getNode(entityId);
    return node?.entityType ?? 'unknown';
  }
}
