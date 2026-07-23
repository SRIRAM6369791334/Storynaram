import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent.js';

export class CharacterExecutionAgent extends ExecutionAgent {
  readonly id = 'character-execution';
  readonly name = 'Character Execution Agent';
  readonly dependencies: string[] = [];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const plan = input.context.planningResult.characterPlan;
    const startTime = Date.now();

    const systemPrompt = 'You are a narrative character writer. Generate vivid, compelling character prose based on the provided character plan. Maintain consistent voice, motivation, and depth.';
    const userPrompt = [
      `Generate detailed character prose for "${plan.name}".`,
      `Role: ${plan.role}`,
      `Arc: ${plan.arc}`,
      `Traits: ${plan.traits.join(', ')}`,
      `Goals: ${plan.goals.join(', ')}`,
      `Conflicts: ${plan.conflicts.join(', ')}`,
      `Relationships: ${plan.relationships.map(r => `${r.targetId} (${r.type}): ${r.description}`).join('; ')}`,
      '',
      'Provide:',
      '1. A character introduction (personality, appearance, mannerisms)',
      '2. Key dialogue snippets that reveal character voice',
      '3. Scene placements where this character appears',
      '4. Internal conflict and growth trajectory',
    ].join('\n');

    const { content, tokenUsage, latencyMs } = await callAI(input.context, systemPrompt, userPrompt);

    return {
      agentId: this.id,
      success: true,
      content,
      tokenUsage,
      latencyMs,
    };
  }
}
