import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent';

export class TimelineExecutionAgent extends ExecutionAgent {
  readonly id = 'timeline-execution';
  readonly name = 'Timeline Execution Agent';
  readonly dependencies: string[] = [];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const plan = input.context.planningResult.timelinePlan;
    const startTime = Date.now();

    const systemPrompt = 'You are a timeline narrator. Generate a flowing, chronological narrative from the provided timeline events. Connect events causally and maintain temporal coherence.';
    const userPrompt = [
      `Generate timeline narrative for "${plan.name}".`,
      `Events:`,
      ...plan.events.map(e => `  - ${e.date}: ${e.title} (${e.type}) — ${e.description}`),
      `Branches: ${plan.branches.join(', ')}`,
      '',
      'Provide:',
      '1. A cohesive timeline narrative that connects events causally',
      '2. Pacing and tension across the timeline',
      '3. Key turning points and their significance',
      '4. The overall arc of time in the story',
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
