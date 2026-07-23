import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent.js';

export class NarrativeExecutionAgent extends ExecutionAgent {
  readonly id = 'narrative-execution';
  readonly name = 'Narrative Execution Agent';
  readonly dependencies: string[] = ['timeline-execution'];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const plan = input.context.planningResult.narrativePlan;
    const timelineOutput = input.memory.getOutput('timeline-execution');

    const startTime = Date.now();

    const systemPrompt = 'You are a narrative prose writer. Transform narrative plans into flowing chapter prose. Maintain consistent voice, pacing, and dramatic tension across all chapters.';
    const userPrompt = [
      `Generate narrative chapters for "${plan.title}".`,
      `Synopsis: ${plan.synopsis}`,
      '',
      `Chapters:`,
      ...plan.chapters.map(ch => `  Chapter ${ch.number}: ${ch.title}`),
      '',
      'Detailed chapter plans:',
      ...plan.chapters.map(ch => [
        `  Chapter ${ch.number}: ${ch.title}`,
        `    Summary: ${ch.summary}`,
        `    Scenes: ${ch.scenes.join(', ')}`,
      ].join('\n')),
      '',
      'Timeline context:',
      timelineOutput?.content.slice(0, 300) ?? '(pending)',
      '',
      'Provide for each chapter:',
      '1. A strong opening hook',
      '2. Scene-by-scene prose with sensory detail',
      '3. Dialogue and internal monologue',
      '4. Pacing that matches the emotional beats',
      '5. A compelling cliffhanger or resolution',
      '',
      'Target word count per chapter: approximately 2000 words.',
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
