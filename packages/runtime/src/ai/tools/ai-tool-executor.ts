import { Injectable, Logger } from '@nestjs/common';
import type { AITool, AIToolResult, AIToolCall } from '../types.js';
import { AIToolError, AITimeoutError } from '../errors.js';
import { AIToolRegistry } from './ai-tool-registry.js';

@Injectable()
export class AIToolExecutor {
  private readonly logger = new Logger(AIToolExecutor.name);

  constructor(private readonly toolRegistry: AIToolRegistry) {}

  async executeTool(toolName: string, args: Record<string, unknown>, context?: Record<string, unknown>): Promise<AIToolResult> {
    const startTime = Date.now();
    try {
      const tool = this.toolRegistry.resolve(toolName);
      const output = await tool.execute(args, context);
      return {
        success: true,
        output,
        durationMs: Date.now() - startTime,
        toolName,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(`Tool "${toolName}" execution failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        durationMs,
        toolName,
      };
    }
  }

  async executeToolCall(toolCall: AIToolCall, context?: Record<string, unknown>): Promise<AIToolResult> {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
    } catch {
      return {
        success: false,
        output: null,
        error: `Invalid tool arguments JSON: ${toolCall.function.arguments}`,
        durationMs: 0,
        toolName: toolCall.function.name,
      };
    }
    return this.executeTool(toolCall.function.name, args, context);
  }

  async executeToolCalls(toolCalls: AIToolCall[], context?: Record<string, unknown>): Promise<AIToolResult[]> {
    return Promise.all(toolCalls.map(tc => this.executeToolCall(tc, context)));
  }

  async executeToolWithTimeout(toolName: string, args: Record<string, unknown>, timeoutMs: number, context?: Record<string, unknown>): Promise<AIToolResult> {
    const startTime = Date.now();
    const timeoutPromise = new Promise<AIToolResult>((_, reject) => {
      setTimeout(() => reject(new AITimeoutError(`Tool "${toolName}" timed out after ${timeoutMs}ms`, 'tool', toolName, timeoutMs)), timeoutMs);
    });

    try {
      const result = await Promise.race([
        this.executeTool(toolName, args, context),
        timeoutPromise,
      ]);
      return result;
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startTime,
        toolName,
      };
    }
  }

  async executeToolWithRetry(toolName: string, args: Record<string, unknown>, maxRetries: number = 3, context?: Record<string, unknown>): Promise<AIToolResult> {
    let lastError: string | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await this.executeTool(toolName, args, context);
      if (result.success) return result;
      lastError = result.error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
    return {
      success: false,
      output: null,
      error: lastError ?? `Tool "${toolName}" failed after ${maxRetries} retries`,
      durationMs: 0,
      toolName,
    };
  }
}
