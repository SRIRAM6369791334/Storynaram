import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent';

export class MergeExecutionAgent extends ExecutionAgent {
  readonly id = 'merge-execution';
  readonly name = 'Merge Execution Agent';
  readonly dependencies: string[] = [
    'character-execution',
    'world-execution',
    'timeline-execution',
    'canon-execution',
    'narrative-execution',
    'composition-execution',
    'validation-execution',
  ];

  async execute(input: AgentInput): Promise<AgentOutput> {
    const memory = input.memory;
    const result = input.context.planningResult;
    const startTime = Date.now();

    const characterOutput = memory.getOutput('character-execution');
    const worldOutput = memory.getOutput('world-execution');
    const timelineOutput = memory.getOutput('timeline-execution');
    const canonOutput = memory.getOutput('canon-execution');
    const narrativeOutput = memory.getOutput('narrative-execution');
    const compositionOutput = memory.getOutput('composition-execution');
    const validationOutput = memory.getOutput('validation-execution');

    const systemPrompt = 'You are a master story editor. Merge all generated story components into a single, coherent story draft. Resolve conflicts, maintain consistent voice, and ensure smooth transitions between components.';
    const userPrompt = [
      `Merge the following story components into a complete, publish-ready story draft for "${result.storyPlan.title}".`,
      '',
      'STORY METADATA',
      `Genres: ${result.storyPlan.genre.join(', ')}`,
      `Logline: ${result.storyPlan.logline}`,
      `Premise: ${result.storyPlan.premise}`,
      `Themes: ${result.storyPlan.themes.join(', ')}`,
      '',
      'COMPONENTS',
      '',
      '--- Character Prose ---',
      characterOutput?.content ?? '(none)',
      '',
      '--- World Prose ---',
      worldOutput?.content ?? '(none)',
      '',
      '--- Timeline Narrative ---',
      timelineOutput?.content ?? '(none)',
      '',
      '--- Canon Entries ---',
      canonOutput?.content ?? '(none)',
      '',
      '--- Narrative Chapters ---',
      narrativeOutput?.content ?? '(none)',
      '',
      '--- Composition/Scenes ---',
      compositionOutput?.content ?? '(none)',
      '',
      '--- Validation Report ---',
      validationOutput?.content ?? '(none)',
      '',
      'INSTRUCTIONS',
      '1. Integrate character introductions naturally into the narrative chapters',
      '2. Weave world descriptions into scenes where they are most relevant',
      '3. Ensure timeline events appear in proper chronological order',
      '4. Maintain canon facts throughout',
      '5. Apply composition arc structure to arrange chapters',
      '6. Resolve any inconsistencies identified in validation',
      '7. Use consistent narrative voice and tense throughout',
      '8. Include chapter breaks with clear transitions',
      '9. Ensure each scene has purpose and advances the story',
      '',
      'Output the complete merged story draft with clear chapter divisions.',
    ].join('\n');

    const { content, tokenUsage, latencyMs } = await callAI(input.context, systemPrompt, userPrompt);

    return {
      agentId: this.id,
      success: true,
      content,
      tokenUsage,
      latencyMs,
      metadata: {
        mergedComponentCount: 7,
        sourceCharacters: result.characterPlan.name,
        sourceWorlds: result.worldPlan.name,
        sourceNarrative: result.narrativePlan.title,
      },
    };
  }
}
