import type { ExecutionContext } from '../execution-context.js';
import type { ExecutionMemory } from '../execution-memory.js';

export interface AgentInput {
  context: ExecutionContext;
  memory: ExecutionMemory;
}

export interface AgentOutput {
  agentId: string;
  success: boolean;
  content: string;
  tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number };
  latencyMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export abstract class ExecutionAgent {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly dependencies: string[];

  abstract execute(input: AgentInput): Promise<AgentOutput>;
}

export async function callAI(
  context: ExecutionContext,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ content: string; tokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number }; latencyMs: number }> {
  const startTime = Date.now();
  const response = await context.aiRuntime.generate(
    {
      model: context.options.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: context.options.temperature ?? 0.7,
      maxTokens: context.options.maxTokens ?? 2000,
    },
    { sessionId: context.sessionId },
  );

  const messages = response.messages;
  const lastMessage = messages[messages.length - 1];

  return {
    content: lastMessage?.content ?? '',
    tokenUsage: response.tokenUsage,
    latencyMs: Date.now() - startTime,
  };
}
