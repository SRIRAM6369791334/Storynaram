import type { EntityId } from '@storynaram/core';
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

export interface RelationshipPort {
  connect(input: CreateRelationshipInput): Promise<RelationshipEdge>;
  disconnect(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): Promise<boolean>;
  removeEdge(edgeId: string): Promise<boolean>;
  removeNode(entityId: EntityId): Promise<boolean>;
  getEdge(edgeId: string): RelationshipEdge | undefined;
  getEdgeBetween(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): RelationshipEdge | undefined;
  getNode(entityId: EntityId): RelationshipNode | undefined;
  hasNode(entityId: EntityId): boolean;
  hasEdge(sourceId: EntityId, targetId: EntityId, type?: RelationshipType): boolean;

  getOutgoing(entityId: EntityId): RelationshipEdge[];
  getIncoming(entityId: EntityId): RelationshipEdge[];
  getNeighbors(entityId: EntityId, direction?: RelationshipDirection): EntityId[];

  findRelations(filter: RelationshipFilter): RelationshipEdge[];
  findIncoming(entityId: EntityId, type?: string): RelationshipEdge[];
  findOutgoing(entityId: EntityId, type?: string): RelationshipEdge[];
  findByType(type: RelationshipType): RelationshipEdge[];
  search(query: RelationshipQuery): RelationshipSearchResult;

  ancestors(entityId: EntityId, maxDepth?: number): RelationshipEdge[][];
  descendants(entityId: EntityId, maxDepth?: number): RelationshipEdge[][];
  children(entityId: EntityId): RelationshipEdge[];
  parents(entityId: EntityId): RelationshipEdge[];
  roots(): EntityId[];
  leaves(): EntityId[];

  path(from: EntityId, to: EntityId): PathResult | undefined;
  shortestPath(from: EntityId, to: EntityId): PathResult | undefined;
  allPaths(from: EntityId, to: EntityId, maxDepth?: number): PathResult[];

  bfs(startId: EntityId, visit: (entityId: EntityId, depth: number) => void): void;
  dfs(startId: EntityId, visit: (entityId: EntityId, depth: number) => void): void;
  reachableNodes(startId: EntityId, maxDepth?: number): EntityId[];

  detectCycles(): CycleResult;
  statistics(): GraphStatistics;
}
