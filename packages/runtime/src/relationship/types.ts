import type { EntityId } from '@storynaram/core';

export type RelationshipType =
  | 'oneToOne'
  | 'oneToMany'
  | 'manyToOne'
  | 'manyToMany'
  | 'directed'
  | 'bidirectional'
  | 'hierarchical'
  | 'reference'
  | 'dependency'
  | 'ownership';

export type RelationshipDirection = 'outgoing' | 'incoming' | 'both';

export interface RelationshipNode {
  entityId: EntityId;
  entityType: string;
  metadata?: Record<string, unknown>;
}

export interface RelationshipEdge {
  id: string;
  sourceId: EntityId;
  targetId: EntityId;
  type: RelationshipType;
  label?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipConfig {
  type: RelationshipType;
  allowCycles?: boolean;
  maxTargets?: number;
  allowedSourceTypes?: string[];
  allowedTargetTypes?: string[];
  bidirectional?: boolean;
  label?: string;
}

export interface CreateRelationshipInput {
  sourceId: EntityId;
  targetId: EntityId;
  type: RelationshipType;
  label?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface RelationshipFilter {
  sourceId?: EntityId;
  targetId?: EntityId;
  type?: RelationshipType;
  types?: RelationshipType[];
  label?: string;
  direction?: RelationshipDirection;
}

export interface PathResult {
  edges: RelationshipEdge[];
  totalWeight: number;
  nodeCount: number;
}

export interface CycleResult {
  hasCycles: boolean;
  cycles?: RelationshipEdge[][];
}

export interface GraphStatistics {
  totalNodes: number;
  totalEdges: number;
  totalRelationshipsByType: Record<string, number>;
  averageOutDegree: number;
  averageInDegree: number;
  density: number;
  componentCount: number;
}

export interface RelationshipQuery {
  sourceTypes?: string[];
  targetTypes?: string[];
  types?: RelationshipType[];
  labels?: string[];
  limit?: number;
  offset?: number;
}

export interface RelationshipSearchResult {
  edges: RelationshipEdge[];
  total: number;
  limit: number;
  offset: number;
}

export interface RelationshipValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RelationshipRuntimeOptions {
  enableValidation?: boolean;
  enableEvents?: boolean;
  enableCache?: boolean;
  maxRelationshipDepth?: number;
  defaultMaxTargets?: number;
}
