import { Injectable } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import { RelationshipGraph } from './relationship-graph';
import type {
  RelationshipEdge,
  RelationshipFilter,
  RelationshipQuery,
  RelationshipSearchResult,
} from './types';

@Injectable()
export class RelationshipQueryService {
  constructor(private readonly graph: RelationshipGraph) {}

  findRelations(filter: RelationshipFilter): RelationshipEdge[] {
    return this.graph.getAllEdges().filter(edge => this.matchesFilter(edge, filter));
  }

  findIncoming(entityId: string, type?: string): RelationshipEdge[] {
    const edges = this.graph.getIncomingEdges(entityId as EntityId);
    if (type) {
      return edges.filter(e => e.type === type);
    }
    return edges;
  }

  findOutgoing(entityId: string, type?: string): RelationshipEdge[] {
    const edges = this.graph.getOutgoingEdges(entityId as EntityId);
    if (type) {
      return edges.filter(e => e.type === type);
    }
    return edges;
  }

  findByType(type: string): RelationshipEdge[] {
    return this.graph.getAllEdges().filter(e => e.type === type);
  }

  search(query: RelationshipQuery): RelationshipSearchResult {
    let edges = this.graph.getAllEdges();

    if (query.types && query.types.length > 0) {
      edges = edges.filter(e => query.types!.includes(e.type));
    }
    if (query.labels && query.labels.length > 0) {
      edges = edges.filter(e => e.label && query.labels!.includes(e.label));
    }
    if (query.sourceTypes && query.sourceTypes.length > 0) {
      const sourceIds = new Set(
        this.graph
          .getAllNodes()
          .filter(n => query.sourceTypes!.includes(n.entityType))
          .map(n => n.entityId),
      );
      edges = edges.filter(e => sourceIds.has(e.sourceId));
    }
    if (query.targetTypes && query.targetTypes.length > 0) {
      const targetIds = new Set(
        this.graph
          .getAllNodes()
          .filter(n => query.targetTypes!.includes(n.entityType))
          .map(n => n.entityId),
      );
      edges = edges.filter(e => targetIds.has(e.targetId));
    }

    const total = edges.length;
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    const paged = edges.slice(offset, offset + limit);

    return {
      edges: paged,
      total,
      limit,
      offset,
    };
  }

  private matchesFilter(edge: RelationshipEdge, filter: RelationshipFilter): boolean {
    if (filter.sourceId && edge.sourceId !== filter.sourceId) return false;
    if (filter.targetId && edge.targetId !== filter.targetId) return false;
    if (filter.type && edge.type !== filter.type) return false;
    if (filter.types && filter.types.length > 0 && !filter.types.includes(edge.type)) return false;
    if (filter.label && edge.label !== filter.label) return false;
    if (filter.direction === 'incoming' && edge.targetId !== filter.sourceId) return false;
    if (filter.direction === 'outgoing' && edge.sourceId !== filter.sourceId) return false;
    return true;
  }
}
