import { ExecutionAgent, callAI, type AgentOutput, type AgentInput } from './execution-agent.js';
import type { ValidationResult } from '../execution-result.js';

export interface ValidationAgentOutput extends AgentOutput {
  metadata: {
    validationResults: ValidationResult[];
    passed: boolean;
  };
}

export class ValidationExecutionAgent extends ExecutionAgent {
  readonly id = 'validation-execution';
  readonly name = 'Validation Execution Agent';
  readonly dependencies: string[] = [
    'character-execution',
    'world-execution',
    'timeline-execution',
    'canon-execution',
    'narrative-execution',
    'composition-execution',
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

    const systemPrompt = 'You are a narrative validation expert. Review generated story content for consistency, coherence, and quality. Check timeline, canon, narrative, character, and world consistency.';

    const userPrompt = [
      'Validate all generated story content for the following dimensions:',
      '',
      '1. TIMELINE CONSISTENCY',
      '   - Are events in chronological order?',
      '   - Are there any temporal contradictions?',
      '   - Do character ages align with timeline dates?',
      '',
      '2. CANON CONSISTENCY',
      '   - Are established facts maintained throughout?',
      '   - Are there contradictions between character/world lore and narrative?',
      '   - Are character relationships consistent?',
      '',
      '3. NARRATIVE CONSISTENCY',
      '   - Does the narrative flow logically?',
      '   - Are chapter transitions smooth?',
      '   - Are plot threads resolved?',
      '',
      '4. CHARACTER CONSISTENCY',
      '   - Do characters act according to their established traits?',
      '   - Are character arcs coherent?',
      '   - Is dialogue consistent with character voice?',
      '',
      '5. WORLD CONSISTENCY',
      '   - Are world rules consistently applied?',
      '   - Are settings described consistently across scenes?',
      '   - Are faction dynamics logically maintained?',
      '',
      `Plans for reference:`,
      `- Characters: ${result.characterPlan.name} (${result.characterPlan.role})`,
      `- World: ${result.worldPlan.name}`,
      `- Timeline events: ${result.timelinePlan.events.length}`,
      `- Narrative chapters: ${result.narrativePlan.chapters.length}`,
      `- Composition arcs: ${result.compositionPlan.arcs.length}`,
      '',
      'Generated content summaries:',
      `Character: ${characterOutput?.content.slice(0, 100) ?? '(none)'}`,
      `World: ${worldOutput?.content.slice(0, 100) ?? '(none)'}`,
      `Timeline: ${timelineOutput?.content.slice(0, 100) ?? '(none)'}`,
      `Canon: ${canonOutput?.content.slice(0, 100) ?? '(none)'}`,
      `Narrative: ${narrativeOutput?.content.slice(0, 100) ?? '(none)'}`,
      `Composition: ${compositionOutput?.content.slice(0, 100) ?? '(none)'}`,
      '',
      'For each dimension, provide:',
      '- Pass/Fail status',
      '- Specific issues found (if any)',
      '- Detailed explanation',
      '',
      'Then provide an overall pass/fail summary.',
    ].join('\n');

    const { content, tokenUsage, latencyMs } = await callAI(input.context, systemPrompt, userPrompt);

    const validationResults: ValidationResult[] = [
      {
        validator: 'TimelineConsistency',
        passed: !content.toLowerCase().includes('timeline inconsistency'),
        issues: content.includes('timeline') ? extractIssues(content, 'timeline') : [],
      },
      {
        validator: 'CanonConsistency',
        passed: !content.toLowerCase().includes('canon inconsistency'),
        issues: content.includes('canon') ? extractIssues(content, 'canon') : [],
      },
      {
        validator: 'NarrativeConsistency',
        passed: !content.toLowerCase().includes('narrative inconsistency'),
        issues: content.includes('narrative') ? extractIssues(content, 'narrative') : [],
      },
      {
        validator: 'CharacterConsistency',
        passed: !content.toLowerCase().includes('character inconsistency'),
        issues: content.includes('character') ? extractIssues(content, 'character') : [],
      },
      {
        validator: 'WorldConsistency',
        passed: !content.toLowerCase().includes('world inconsistency'),
        issues: content.includes('world') ? extractIssues(content, 'world') : [],
      },
    ];

    return {
      agentId: this.id,
      success: true,
      content,
      tokenUsage,
      latencyMs,
      metadata: {
        validationResults,
        passed: validationResults.every(v => v.passed),
      },
    };
  }
}

function extractIssues(content: string, dimension: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');
  let inSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes(`${dimension} consistency`) || lower.includes(`${dimension} `)) {
      if (line.includes('fail') || line.includes('issue') || line.includes('problem') || line.includes('contradiction')) {
        issues.push(line.trim());
      }
      inSection = true;
    } else if (inSection) {
      if (line.match(/^\d\./) || line.match(/^[A-Z]/) || line.trim() === '') {
        inSection = false;
      } else if (line.includes('fail') || line.includes('issue') || line.includes('problem') || line.includes('contradiction')) {
        issues.push(line.trim());
      }
    }
  }

  return issues;
}
