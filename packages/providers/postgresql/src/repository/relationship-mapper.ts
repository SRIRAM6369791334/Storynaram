import { Injectable } from '@nestjs/common';
import type { RelationshipEdge, RelationshipType, CreateRelationshipInput } from '../internal/runtime-types';

@Injectable()
export class RelationshipMapper {
  inputToRow(input: CreateRelationshipInput): Record<string, unknown> {
    return {
      id: input.sourceId + '_' + input.targetId + '_' + input.type,
      source_id: input.sourceId,
      target_id: input.targetId,
      type: input.type,
      label: input.label ?? null,
      weight: input.weight ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  rowToEdge(row: Record<string, unknown>): RelationshipEdge {
    return {
      id: row['id'] as string,
      sourceId: row['source_id'] as string,
      targetId: row['target_id'] as string,
      type: row['type'] as RelationshipType,
      label: row['label'] as string | undefined,
      weight: row['weight'] as number | undefined,
      metadata: typeof row['metadata'] === 'string' ? JSON.parse(row['metadata'] as string) : (row['metadata'] as Record<string, unknown> | undefined),
      createdAt: row['created_at'] as Date,
      updatedAt: row['updated_at'] as Date,
    };
  }

  rowsToEdges(rows: Record<string, unknown>[]): RelationshipEdge[] {
    return rows.map(r => this.rowToEdge(r));
  }
}
