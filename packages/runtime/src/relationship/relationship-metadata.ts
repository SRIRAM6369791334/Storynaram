import type { RelationshipEdge, RelationshipNode, RelationshipType } from './types.js';

export interface RelationshipMetadataEntry {
  edgeId: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label?: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
  sourceType?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

export function extractEdgeMetadata(
  edge: RelationshipEdge,
  sourceNode?: RelationshipNode,
  targetNode?: RelationshipNode,
): RelationshipMetadataEntry {
  return {
    edgeId: edge.id,
    sourceId: edge.sourceId,
    targetId: edge.targetId,
    type: edge.type,
    label: edge.label,
    weight: edge.weight ?? 1,
    createdAt: edge.createdAt,
    updatedAt: edge.updatedAt,
    sourceType: sourceNode?.entityType,
    targetType: targetNode?.entityType,
    metadata: edge.metadata,
  };
}

export function edgeToSimpleString(edge: RelationshipEdge): string {
  const label = edge.label ? `:${edge.label}` : '';
  return `${edge.sourceId} --[${edge.type}${label}]--> ${edge.targetId}`;
}
