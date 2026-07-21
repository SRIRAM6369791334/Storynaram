import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent';

export class WorldExecutionAgent extends ExecutionAgent {
  readonly id = 'world-execution';
  readonly name = 'World Execution Agent';
  readonly dependencies: string[] = [];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const plan = input.context.planningResult.worldPlan;
    const startTime = Date.now();

    const systemPrompt = 'You are a world-building writer. Generate rich, immersive world descriptions based on the provided world plan. Create vivid settings that support the narrative.';
    const userPrompt = [
      `Generate detailed world prose for "${plan.name}".`,
      `Regions: ${plan.regions.join(', ')}`,
      `Factions: ${plan.factions.join(', ')}`,
      `Magic System: ${plan.magicSystem}`,
      `Technology Level: ${plan.technologyLevel}`,
      `Cultures: ${plan.cultures.join(', ')}`,
      `History: ${plan.history.join('; ')}`,
      '',
      'Provide:',
      '1. A world overview and atmosphere',
      '2. Detailed region descriptions (geography, climate, notable locations)',
      '3. Faction dynamics and political landscape',
      '4. Cultural customs, beliefs, and daily life',
      '5. Sensory details (sights, sounds, smells) that bring the world to life',
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
