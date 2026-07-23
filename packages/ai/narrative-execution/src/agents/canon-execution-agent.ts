import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent.js';

export class CanonExecutionAgent extends ExecutionAgent {
  readonly id = 'canon-execution';
  readonly name = 'Canon Execution Agent';
  readonly dependencies: string[] = ['character-execution', 'world-execution', 'timeline-execution'];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const result = input.context.planningResult;
    const characterOutput = input.memory.getOutput('character-execution');
    const worldOutput = input.memory.getOutput('world-execution');
    const timelineOutput = input.memory.getOutput('timeline-execution');

    const startTime = Date.now();

    const systemPrompt = 'You are a canon consistency guardian. Generate canon entries that establish and maintain factual consistency across the narrative. Identify potential conflicts and resolve them.';
    const userPrompt = [
      'Generate canon entries based on the provided plans and generated content.',
      '',
      'Canon entries to generate:',
      ...result.storyPlan.themes.map(t => `  - Theme canon: ${t}`),
      `  - Character count: ${result.storyPlan.characterCount}`,
      `  - World count: ${result.storyPlan.worldCount}`,
      `  - Timeline events to track: ${result.timelinePlan.events.length}`,
      ...result.timelinePlan.events.slice(0, 5).map(e => `  - Key event: ${e.title} at ${e.date}`),
      '',
      'Character output summary:',
      characterOutput?.content.slice(0, 200) ?? '(pending)',
      '',
      'World output summary:',
      worldOutput?.content.slice(0, 200) ?? '(pending)',
      '',
      'Timeline output summary:',
      timelineOutput?.content.slice(0, 200) ?? '(pending)',
      '',
      'Provide:',
      '1. Core canon facts (unchanging truths of the story world)',
      '2. Character canon (fixed traits, backstory, relationships)',
      '3. World canon (physical laws, geography, history)',
      '4. Timeline canon (fixed dates, sequence, causality)',
      '5. Identified potential conflicts and their resolutions',
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
