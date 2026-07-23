import { Injectable, Logger } from '@nestjs/common';
import type { EntityId } from '@storynaram/core';
import type { ValidationEngineService } from '@storynaram/validation';
import { RelationshipGraph } from './relationship-graph.js';
import type {
  RelationshipEdge,
  RelationshipConfig,
  RelationshipValidationResult,
  CreateRelationshipInput,
  RelationshipType,
} from './types.js';
import { RelationshipValidationError } from './errors.js';

@Injectable()
export class RelationshipValidator {
  private readonly logger = new Logger(RelationshipValidator.name);
  private readonly typeConfigs = new Map<RelationshipType, RelationshipConfig>();

  constructor(
    private readonly graph: RelationshipGraph,
    private readonly validationEngine?: ValidationEngineService,
  ) {}

  registerTypeConfig(config: RelationshipConfig): void {
    this.typeConfigs.set(config.type, { ...config });
  }

  getTypeConfig(type: RelationshipType): RelationshipConfig | undefined {
    return this.typeConfigs.get(type);
  }

  async validateAddEdge(input: CreateRelationshipInput): Promise<RelationshipValidationResult> {
    const errors: string[] = [];

    const sourceExists = this.graph.hasNode(input.sourceId);
    const targetExists = this.graph.hasNode(input.targetId);
    if (!sourceExists) {
      errors.push(`Source entity ${input.sourceId} not found in graph`);
    }
    if (!targetExists) {
      errors.push(`Target entity ${input.targetId} not found in graph`);
    }
    if (errors.length > 0) return { valid: false, errors };

    const config = this.typeConfigs.get(input.type);

    if (config?.allowedSourceTypes) {
      const sourceNode = this.graph.getNode(input.sourceId);
      if (sourceNode && !config.allowedSourceTypes.includes(sourceNode.entityType)) {
        errors.push(
          `Source type ${sourceNode.entityType} not allowed for relationship type ${input.type}`,
        );
      }
    }

    if (config?.allowedTargetTypes) {
      const targetNode = this.graph.getNode(input.targetId);
      if (targetNode && !config.allowedTargetTypes.includes(targetNode.entityType)) {
        errors.push(
          `Target type ${targetNode.entityType} not allowed for relationship type ${input.type}`,
        );
      }
    }

    if (config?.maxTargets) {
      const existingCount = this.graph.getOutgoingEdges(input.sourceId).filter(
        e => e.type === input.type,
      ).length;
      if (existingCount >= config.maxTargets) {
        errors.push(
          `Maximum targets (${String(config.maxTargets)}) reached for type ${input.type} on source ${input.sourceId}`,
        );
      }
    }

    if (input.sourceId === input.targetId) {
      errors.push('Self-referencing relationships are not allowed');
    }

    const duplicate = this.graph.getEdgeByEndpoints(input.sourceId, input.targetId, input.type);
    if (duplicate) {
      errors.push(`Duplicate relationship of type ${input.type} between ${input.sourceId} and ${input.targetId}`);
    }

    if (config?.allowCycles === false) {
      if (this.wouldCreateCycle(input.sourceId, input.targetId)) {
        errors.push(`Adding this edge would create a cycle`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateEdge(edge: RelationshipEdge): RelationshipValidationResult {
    const errors: string[] = [];
    if (!edge.sourceId) errors.push('Edge missing sourceId');
    if (!edge.targetId) errors.push('Edge missing targetId');
    if (!edge.type) errors.push('Edge missing type');
    if (edge.sourceId === edge.targetId) errors.push('Self-referencing edge');
    return { valid: errors.length === 0, errors };
  }

  private wouldCreateCycle(sourceId: EntityId, targetId: EntityId): boolean {
    if (sourceId === targetId) return true;
    const visited = new Set<string>();
    const stack = [targetId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === sourceId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const neighbor of this.graph.getOutgoingNeighbors(current)) {
        stack.push(neighbor);
      }
    }
    return false;
  }
}
