import { Injectable, Logger } from '@nestjs/common';
import type { AITool, AIToolDefinition } from '../types.js';
import { AIToolError } from '../errors.js';

@Injectable()
export class AIToolRegistry {
  private readonly logger = new Logger(AIToolRegistry.name);
  private readonly tools: Map<string, AITool> = new Map();

  register(tool: AITool): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`Overwriting existing tool: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
    this.logger.log(`Registered AI tool: ${tool.name}`);
  }

  registerMany(tools: AITool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  unregister(name: string): void {
    this.tools.delete(name);
    this.logger.log(`Unregistered AI tool: ${name}`);
  }

  resolve(name: string): AITool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new AIToolError(`Tool "${name}" is not registered`, name);
    }
    return tool;
  }

  get(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  list(): AITool[] {
    return Array.from(this.tools.values());
  }

  listDefinitions(): AIToolDefinition[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as Record<string, unknown>,
      },
    }));
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  clear(): void {
    this.tools.clear();
  }

  get size(): number {
    return this.tools.size;
  }
}
