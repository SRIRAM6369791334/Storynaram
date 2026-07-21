import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent';

export class CompositionExecutionAgent extends ExecutionAgent {
  readonly id = 'composition-execution';
  readonly name = 'Composition Execution Agent';
  readonly dependencies: string[] = ['narrative-execution'];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const plan = input.context.planningResult.compositionPlan;
    const narrativeOutput = input.memory.getOutput('narrative-execution');

    const startTime = Date.now();

    const systemPrompt = 'You are a story composition writer. Generate scene-level prose, narrative arcs, and structural elements that weave the narrative together. Ensure story architecture supports dramatic tension.';
    const userPrompt = [
      `Generate composition prose for story "${plan.storyId}".`,
      `Plot Structure: ${plan.plotStructure}`,
      '',
      `Arcs:`,
      ...plan.arcs.map(a => `  - ${a.name}: ${a.description}`),
      '',
      'Arc beats:',
      ...plan.arcs.map(a => [
        `  ${a.name}:`,
        ...a.beats.map(b => `    - ${b}`),
      ].join('\n')),
      '',
      `Themes: ${plan.themes.join(', ')}`,
      `Conflicts: ${plan.conflicts.map(c => `${c.type}: ${c.description} (${c.parties.join(', ')})`).join('; ')}`,
      `Foreshadowing: ${plan.foreshadowing.map(f => `${f.hint} -> ${f.payoff}`).join('; ')}`,
      '',
      'Narrative context:',
      narrativeOutput?.content.slice(0, 300) ?? '(pending)',
      '',
      'Provide:',
      '1. Scene-by-scene prose for each story arc',
      '2. Integration of themes throughout the composition',
      '3. Conflict escalation and resolution pacing',
      '4. Foreshadowing payoff moments',
      '5. Character objective progress tracking',
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
